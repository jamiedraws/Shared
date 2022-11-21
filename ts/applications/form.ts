// api
import BraintreeCheckout from "Shared/ts/api/express-checkout/braintree-checkout";
import ValidateCommon from "Shared/ts/api/validate/validate-common";
import ModalDialogIframe from "Shared/ts/api/modal/modal-dialog-iframe";
import ExpressCheckout from "Shared/ts/api/express-checkout/express-checkout";

// applications
import { initializeToolTip } from "Shared/ts/applications/template";

// interfaces
import { ICartChange } from "Shared/ts/interfaces/cart-change";
import { IValidateCommonErrorResponse } from "Shared/ts/interfaces/validate/validate-common";
import {
    DefaultTask,
    FailTask,
    FinallyTask,
    IPassFailController,
    IPassFailRouter,
    PassTask
} from "Shared/ts/interfaces/pass-fail";

// utils
import { isFunction } from "Shared/ts/utils/data";
import ElementController from "Shared/ts/utils/element-controller";
import CaptureElement from "Shared/ts/utils/capture-element";
import ValidateEvent from "Shared/ts/utils/validate-event";

// observers
import { observer } from "Shared/ts/observers/intersection";

declare global {
    interface Window {
        forms: WeakMap<HTMLFormElement, ValidateEvent>;
    }
}

export const initializeGlobalValidateEventMap = (): WeakMap<
    HTMLFormElement,
    ValidateEvent
> => {
    const map = new WeakMap<HTMLFormElement, ValidateEvent>();

    window.forms = map;

    return map;
};

export const initializeModalDialogIframe = (): void => {
    const modalDialogIframe = new ModalDialogIframe();
    modalDialogIframe.initializeObserver();
};

export const initializeExpressCheckout = (root?: HTMLElement): void => {
    addEventListener("ECDrawFormComplete", (event) => {
        const ec = new ExpressCheckout(root);

        ec.createCheckoutButtonGUI();

        initializeToolTip();
    });
};

export const validateInputRules = (control: HTMLInputElement): boolean => {
    const isValid = control.validity.valid;
    if (!isValid) return false;

    const isEmpty = control.value === "";
    if (isEmpty) return false;

    const pattern = control.getAttribute("data-pattern");
    if (pattern) {
        const regex = new RegExp(pattern);
        const hasValidPattern = regex.test(control.value);

        return hasValidPattern;
    }

    if (control.type === "checkbox") {
        return control.checked;
    }

    if (control.type === "radio") {
        return Array.from<HTMLInputElement>(
            document.querySelectorAll(
                `input[type="radio"][name="${control.name}"]`
            )
        ).some((input) => input.checked);
    }

    return true;
};

export const validateComboboxRules = (control: HTMLSelectElement): boolean => {
    return control.validity.valid;
};

export const validateTextareaRules = (
    control: HTMLTextAreaElement
): boolean => {
    return control.validity.valid;
};

export const initializeValidateEvent = (
    form?: HTMLFormElement,
    submit?: HTMLButtonElement,
    attribute: string = "data-required"
): ValidateEvent => {
    const validateEvent = new ValidateEvent({
        form,
        attribute,
        inputEvents: ["blur", "change"],
        invalidInputEvents: ["keyup", "blur", "change"],
        comboboxEvents: ["change", "blur"],
        textareaEvents: ["blur", "change"],
        invalidTextareaEvents: ["keyup", "blur", "change"],
        submit
    });

    validateEvent.validateInputEvent = (event: Event) => {
        validateEvent.validateControl(
            event.target as HTMLInputElement,
            validateInputRules
        );
    };

    validateEvent.validateComboboxEvent = (event: Event) => {
        validateEvent.validateControl(
            event.target as HTMLSelectElement,
            validateComboboxRules
        );
    };

    validateEvent.validateTextareaEvent = (event: Event) => {
        validateEvent.validateControl(
            event.target as HTMLTextAreaElement,
            validateTextareaRules
        );
    };

    validateEvent.processInputEvents();
    validateEvent.processComboboxEvents();
    validateEvent.processTextareaEvents();

    return validateEvent;
};

export const initializeValidateEventWithAjaxSubmit = (
    form?: HTMLFormElement,
    submit?: HTMLButtonElement,
    outputResponseHandler?: (message: string) => void,
    attribute?: string
): ValidateEvent => {
    const validateEvent = initializeValidateEvent(form, submit, attribute);

    const outputResponse = isFunction(outputResponseHandler)
        ? (outputResponseHandler as (message: string) => void)
        : (message: string) => console.debug(message);

    validateEvent.processInputEvents();
    validateEvent.processComboboxEvents();

    validateEvent.submit?.addEventListener("click", (event: Event): void => {
        event.preventDefault();

        validateEvent.validateInputs(validateInputRules);
        validateEvent.validateComboboxes(validateComboboxRules);

        if (!validateEvent.isValidForm()) return;

        outputResponse(
            validateEvent.form?.getAttribute("data-message-status") ??
                "Submitting request"
        );

        processRequestByFormAction(form as HTMLFormElement)
            .then((response): void => {
                switch (response.status) {
                    case 200:
                        outputResponse(
                            validateEvent.form?.getAttribute(
                                "data-message-success"
                            ) ?? "Request was sent successfully"
                        );
                        break;
                    default:
                        outputResponse(
                            validateEvent.form?.getAttribute(
                                "data-message-error"
                            ) ?? "Request was sent but may not be successful"
                        );
                        break;
                }
            })
            .catch((error) => console.error(error));
    });

    return validateEvent;
};

export const processRequestByFormAction = (
    form: HTMLFormElement
): Promise<Response> => {
    return new Promise<Response>((resolve, reject) => {
        const action = form.action;
        if (!action || action === "")
            reject({
                message: `The value for the action attribute was not provided for the following form`,
                form
            });

        const method = form.method;
        if (!method || method === "")
            reject({
                message: `The value for the method attribute was not provided for the following form`,
                form
            });

        const request = fetch(action, {
            method: method.toUpperCase(),
            body: new FormData(form)
        });

        request
            .then((response) => resolve(response))
            .catch((error) => reject(error));
    });
};

export const validatePromoCode = (
    predicate?: () => boolean
): IPassFailController => {
    let router: IPassFailRouter = Object.create(null);

    window.addEventListener("CartChange", (event: CustomEvent<ICartChange>) => {
        const meetsCondition = predicate?.() ?? true;
        if (!meetsCondition) return;

        const cart = event.detail;
        const promoCode = cart.promoCode;
        if (!promoCode) return;

        switch (true) {
            case promoCode.toLowerCase() ===
                cart.promoCodeTarget?.toLowerCase():
                router?.pass?.(promoCode);
                break;
            case cart.promoCode !== "":
                const error = cart.errors.shift() ?? "An error occurred";

                router?.fail?.(error);
                break;
            default:
                router?.default?.();
                break;
        }

        router?.finally?.();
    });

    return Object.create({
        default: function (task: DefaultTask) {
            router.default = task;

            return this;
        },
        pass: function (task: PassTask) {
            router.pass = task;

            return this;
        },
        fail: function (task: FailTask) {
            router.fail = task;

            return this;
        },
        finally: function (task: FinallyTask) {
            router.finally = task;

            return this;
        }
    });
};

export const validatePromoCodeWhenVisible = (
    selector: string = "#promoCode"
): IPassFailController => {
    let isVisible = false;

    observer(selector, {
        inRange: (record) => (isVisible = true),
        outRange: (record) => (isVisible = false),
        unObserve: false
    });

    return validatePromoCode(() => isVisible);
};

export const initializeValidateEventWithPromoCode = (
    form?: HTMLFormElement,
    submit?: HTMLButtonElement
): ValidateEvent => {
    const validateEvent = initializeValidateEvent(form, submit);

    const promoInput = validateEvent.inputs.find(
        (input) => input.id === "promoCode"
    );

    if (promoInput) {
        window.addEventListener(
            "CartChange",
            (event: CustomEvent<ICartChange>) => {
                const cart = event.detail;

                if (cart.promoCode === "") {
                    validateEvent.setControlToDefault(promoInput);
                    return;
                }

                validateEvent.validateControl(
                    promoInput,
                    (control) =>
                        cart.promoCode?.toLowerCase() ===
                        cart.promoCodeTarget?.toLowerCase()
                );
            }
        );
    }

    return validateEvent;
};

export const initializeValidateCommon = (
    form?: HTMLFormElement,
    submit?: HTMLButtonElement
): ValidateCommon => {
    const validateCommon = new ValidateCommon({
        form,
        attribute: "data-required",
        inputEvents: ["blur", "change"],
        invalidInputEvents: ["keyup", "blur", "change"],
        comboboxEvents: ["change", "blur"],
        submit
    });

    validateCommon.validateOnSubmit();
    validateCommon.processInputEvents();
    validateCommon.processComboboxEvents();

    console.log(form, validateCommon);

    return validateCommon;
};

export const initializeValidateCommonWithSeminarRadioGroup = (
    form?: HTMLFormElement,
    submit?: HTMLButtonElement
): ValidateCommon => {
    const validateCommon = initializeValidateCommon(form, submit);

    window.onFormPreValidation = (
        event: Event
    ): IValidateCommonErrorResponse[] => {
        const errors: IValidateCommonErrorResponse[] = [];

        const defaultActionCodeInput = validateCommon.inputs.find(
            (input) => input.getAttribute("name") === "ActionCode0"
        );
        if (!defaultActionCodeInput) return errors;

        const isActionCodeChecked = validateCommon.inputs
            .filter((input) => input.getAttribute("name") === "ActionCode0")
            .some((input) => input.checked);
        if (isActionCodeChecked) return errors;

        const actionCodeErrorMessage = document.querySelector(
            "#action-code-error-message"
        );

        if (!actionCodeErrorMessage) {
            console.error({
                message: `A validation message must be provided in the HTML document for the following HTMLInputElement`,
                element: defaultActionCodeInput
            });
        }

        const message =
            actionCodeErrorMessage?.textContent?.trim() ??
            "Please select an option";

        errors.push({
            message,
            element: $(defaultActionCodeInput)
        });

        return errors;
    };

    return validateCommon;
};

export const initializeQuestionCodeCheckboxes = (): void => {
    const questionCodes: HTMLInputElement[] = Array.from(
        document.querySelectorAll('[id^="QuestionCode"]')
    );

    const ids = questionCodes
        .map((questionCode) =>
            questionCode.getAttribute("id")?.replace("QuestionCode", "")
        )
        .filter((id) => id !== "" || id !== undefined) as string[];

    const checkboxes = ids
        .map((id) => document.getElementById(id))
        .filter(
            (checkbox) => checkbox !== undefined || checkbox !== null
        ) as HTMLInputElement[];

    checkboxes.forEach((checkbox) => {
        const questionCode = questionCodes.find((questionCode) =>
            questionCode
                .getAttribute("id")
                ?.includes(checkbox?.getAttribute("id") ?? "")
        );
        if (!questionCode) return;

        checkbox?.addEventListener("change", (event) => {
            questionCode.value = checkbox.checked.toString();
        });
    });
};

export const initializeValidateCommonWithBraintree = (
    form?: HTMLFormElement
): void => {
    const validateCommon = initializeValidateCommon(
        form,
        document.querySelector("#braintreeSubmit") as HTMLButtonElement
    );

    const fieldset = document.querySelector(
        "#paymentInformation"
    ) as HTMLFieldSetElement;
    if (!fieldset) return;

    const bt = new BraintreeCheckout(fieldset);

    bt.subscribe("CardNumberHostedField", (hostedField) =>
        hostedField.classList.add("form__field")
    );

    bt.subscribe("CardCvv2HostedField", (hostedField) =>
        hostedField.classList.add("form__field")
    );

    bt.subscribe("CardExpirationHostedField", (hostedField) => {
        const cardExpYear = document.querySelector("#CardExpirationYearCt");
        if (cardExpYear) {
            cardExpYear.remove();
        }

        const cardExpDateButton = document.querySelector(
            "#CardExpirationCt .form__button"
        );
        if (cardExpDateButton) {
            cardExpDateButton.remove();
        }
    });

    bt.on("default", (hostedField) => {
        const target = validateCommon.getTargetByControl(
            hostedField as HTMLInputElement
        );

        validateCommon.setControlToDefault(target);
    });

    bt.on("invalid", (hostedField) => {
        const target = validateCommon.getTargetByControl(
            hostedField as HTMLInputElement
        );

        validateCommon.setControlToInvalid(target);
    });

    bt.on("valid", (hostedField) => {
        const target = validateCommon.getTargetByControl(
            hostedField as HTMLInputElement
        );

        validateCommon.setControlToValid(target);
    });
};

export const getHiddenFormControlsByElement = (element: Element): Element[] => {
    return Array.from(element.querySelectorAll("input, select, textarea"));
};

export const addAttributeToFormControls = (
    elements: Element[],
    attribute: string
): void => {
    elements.forEach((element) => element.setAttribute(attribute, "true"));
};

export const removeAttributeFromFormControls = (
    elements: Element[],
    attribute: string
): void => {
    elements.forEach((element) => element.removeAttribute(attribute));
};

export const validateByElementController = (
    validateEvent: ValidateEvent
): void => {
    const candidates = Array.from(
        validateEvent.form?.querySelectorAll(".element-controller") ?? []
    );

    candidates.forEach((candidate) => {
        const elementController = new ElementController(candidate);

        elementController.controllers.forEach((controller) => {
            controller.addEventListener("change", (event) => {
                elementController.toggleElementsByController(controller);
            });
        });

        elementController.elements.forEach((element) => {
            if (!element) return;

            const captureElement = new CaptureElement(element);
            const formControls = getHiddenFormControlsByElement(element);

            captureElement.subscribe("attributes", (record) => {
                if (record.attributeName === "data-element-controller-name") {
                    const hasControllerName = element.hasAttribute(
                        "data-element-controller-name"
                    );

                    hasControllerName
                        ? addAttributeToFormControls(
                              formControls,
                              validateEvent.attribute
                          )
                        : removeAttributeFromFormControls(
                              formControls,
                              validateEvent.attribute
                          );

                    validateEvent.captureComboboxes();
                    validateEvent.captureInputs();
                    validateEvent.captureTextareas();

                    validateEvent.processComboboxEvents();
                    validateEvent.processInputEvents();
                    validateEvent.processTextareaEvents();
                }
            });
        });
    });
};

export const initializeValidateEventNavigator = (
    form: HTMLFormElement,
    submit: HTMLButtonElement
): Promise<HTMLFormElement> => {
    const validateEvent = initializeValidateEvent(form, submit, "required");

    const elementController = new ElementController(form);

    validateByElementController(validateEvent);

    const navigators: HTMLLinkElement[] = Array.from(
        form.querySelectorAll(`[data-fieldset-navigator]`)
    );

    const nextNavigators = navigators.filter(
        (navigator) =>
            navigator.getAttribute("data-fieldset-navigator") === "next"
    );

    nextNavigators.forEach((navigator) => {
        navigator.addEventListener("click", (event) =>
            validateByNavigator(validateEvent, navigator).then(() =>
                updateFieldsetViewByElementController(
                    elementController,
                    navigator
                )
            )
        );
    });

    const prevNavigators = navigators.filter(
        (navigator) =>
            navigator.getAttribute("data-fieldset-navigator") === "prev"
    );

    prevNavigators.forEach((navigator) => {
        navigator.addEventListener("click", (event) => {
            updateFieldsetViewByElementController(elementController, navigator);
        });
    });

    return new Promise<HTMLFormElement>((resolve, reject) => {
        submit.addEventListener("click", (event) => {
            event.preventDefault();

            validateEvent.validateAll();

            if (validateEvent.isValidForm()) {
                resolve(form);
            }
        });
    });
};

export const updateFieldsetViewByElementController = (
    elementController: ElementController,
    navigator: HTMLElement
): void => {
    const controller = elementController.controllers.find(
        (controller) => controller === navigator
    );
    if (!controller) return;

    elementController.toggleElementsByController(controller);
};

export const validateByNavigator = (
    validateEvent: ValidateEvent,
    navigator: HTMLLinkElement
): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const controls = validateEvent
            .getRequiredControls()
            .filter(
                (control) =>
                    control.closest("fieldset") ===
                    navigator.closest("fieldset")
            );

        controls.forEach((control) => validateEvent.validateControl(control));

        const isValid = controls.every((control) =>
            validateEvent.isValidControl(control)
        );

        if (isValid) {
            resolve();
        }
    });
};

export const initializeValidateEventThenSubscribe = (): void => {};
