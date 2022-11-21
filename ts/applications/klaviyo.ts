// utils
import CaptureElement from "Shared/ts/utils/capture-element";
import ValidateEvent from "Shared/ts/utils/validate-event";

// components
import KlaviyoTemplateController from "Shared/ts/components/klaviyo-template-controller";
import StatusScreen from "Shared/ts/components/status-screen";

/**
 * Attempts to initialize the form for the Klaviyo *Back In Stock* flow with the HTML template id `klaviyo-waitlist-template`. Supporting functionality such as `ValidateEvent` and `StatusScreen` are included to equip the form with client-side validation and user-feedback during a network transaction.
 *
 * An optional `placeholder` HTML element can be provided to render the Klaviyo form in a specific location on the document; otherwise, the form will append to the end of the document.
 * @param placeholder HTMLElement
 * @returns Promise<void>
 */
export const initializeKlaviyoWaitlist = async (
    placeholder?: HTMLElement
): Promise<void> => {
    if (!placeholder) return;

    const template = document.querySelector<HTMLTemplateElement>(
        "#klaviyo-waitlist-template"
    );
    if (!template) return;

    const klaviyoTemplateController = new KlaviyoTemplateController(
        template,
        placeholder
    );

    klaviyoTemplateController.initializeViewByDefault();

    const statusScreen = new StatusScreen("klaviyo-waitlist", placeholder);

    placeholder.addEventListener("viewchange", (event) => {
        statusScreen.busy("Please wait...");
    });

    placeholder.addEventListener("viewready", (event) => {
        requestAnimationFrame(() => statusScreen.close());
    });

    const captureKlaviyoWaitlist = new CaptureElement(placeholder);

    captureKlaviyoWaitlist.subscribe("childList", (record) => {
        const form = Array.from(record.addedNodes).find(
            (node) => node.nodeName.toLowerCase() === "form"
        ) as HTMLFormElement;
        if (!form) return;

        const submit = form.querySelector(
            'button[type="button"]'
        ) as HTMLButtonElement;
        if (!submit) return;

        captureKlaviyoWaitlist.disconnect();

        const validateKlaviyoWaitlist = new ValidateEvent({
            form,
            submit,
            inputEvents: ["blur"],
            invalidInputEvents: ["keyup"]
        });

        validateKlaviyoWaitlist.processInputEvents();

        validateKlaviyoWaitlist.submit?.addEventListener("click", (event) => {
            validateKlaviyoWaitlist.validateAll();

            if (!validateKlaviyoWaitlist.isValidForm()) {
                validateKlaviyoWaitlist.setFocusOnInvalidControl();
                return;
            }

            statusScreen.busy("Processing...");

            const variant = validateKlaviyoWaitlist.inputs.find(
                (input) => input.id === "klaviyo-variant-id"
            );

            if (!variant) {
                console.debug(
                    `The Klaviyo variant id was not provided for the subscription request.`
                );
                statusScreen.problem(
                    "This form cannot be submitted right now. Please try again later."
                );
                return;
            }

            const data = new FormData(form);

            const email = data.get("klaviyo-email");

            if (!email) {
                console.debug(
                    `An email was not provided for the Klaviyo waitlist form.`
                );
                requestAnimationFrame(() => statusScreen.close());
                return;
            }

            klaviyoTemplateController
                .requestSubscribe({
                    variant: variant.value,
                    email: email.toString()
                })
                .then((response) => {
                    console.log(response);
                    statusScreen.done("You Have Joined!");
                })
                .catch((error) => {
                    console.debug(error);
                    statusScreen.problem(
                        "There was a problem submitting the form."
                    );
                });
        });
    });
};
