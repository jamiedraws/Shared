import {
    IValidateCommonConfig,
    IValidateCommonErrorResponse
} from "Shared/ts/interfaces/validate/validate-common";
import ValidateEvent from "Shared/ts/utils/validate-event";

declare global {
    /**
     * Global access-point to the validateForm function, declared in common.js. Responsible for validating a web form.
     * @param event Event
     * @param returnIsValid boolean
     * @param returnErrorObj boolean
     */
    function validateForm(
        /**
         * Represents the event object that is used from a UI-Event
         */
        event: Event,
        /**
         * Determines if the form is valid
         */
        returnIsValid?: boolean,
        /**
         * Determines if the function should return an array of error objects containing pairs of messages and jQuery objects
         */
        returnErrorObj?: boolean
    ): boolean | IValidateCommonErrorResponse[];

    /**
     * Global access-point to the onFormPreValidation function, called from common.js. Provides ability to return a new array of errors before validation occurs.
     * @param event Event
     */
    function onFormPreValidation(event: Event): IValidateCommonErrorResponse[];

    /**
     * Global access-point to the onFormPostValidation function, called from common.js. Provides ability to return a new array of errors after validation occurs.
     * @param event Event
     */
    function onFormPostValidation(event: Event): IValidateCommonErrorResponse[];

    interface Window {
        /**
         * Global access-point to the validator variable. Provides access to the ValidateCommon interface.
         */
        validator: ValidateCommon;
    }
}

export default class ValidateCommon extends ValidateEvent {
    /**
     * Represents an array of error objects containing pairs for messages and jQuery elements
     */
    public get errors() {
        const errors = ValidateCommon.getErrors();

        errors.forEach((error) => {
            const control = error.element.get(0);

            if (!control?.hasAttribute(this.attribute)) {
                control?.setAttribute(this.attribute, "true");
            }
        });

        return errors;
    }

    /**
     * Responsible for providing towards the event argument in the common.js validateForm function
     */
    private static event: Event = document.createEvent("Event");

    /**
     * Provides the ability to apply validation rules from common.js through the Validate interface. Inheriting from the Validate interface, configuration settings include the ability to provide a specific element to represent the form to validate for, a CSS namespace to customize the presentation and an attribute to discern which form controls are required. Additionally, event type mapping can be provided to customize the validation experience.
     * @param config IValidateCommonConfig
     */
    constructor(config?: IValidateCommonConfig) {
        super(config);

        this.errors;

        this.validateInputEvent = (event: Event): void => {
            this.validateControlAgainstCommon(event.target as HTMLInputElement);
        };

        this.validateComboboxEvent = (event: Event): void => {
            this.validateControlAgainstCommon(
                event.target as HTMLSelectElement
            );
        };

        ValidateCommon.initializeCapture(this);
    }

    /**
     * Enable direct validation
     */
    public validateOnDemand(): void {
        this.validateAllAgainstCommon();
        this.setFocusOnInvalidControl();
        this.processControlEvents();
    }

    /**
     * Takes an element and determines if that element is valid or invalid based on the error array
     * @param control HTMLInputElement | HTMLSelectElement
     */
    public validateControlAgainstCommon<
        T extends HTMLInputElement | HTMLSelectElement
    >(control: T): void {
        this.validateControl(
            control,
            (control) =>
                !this.errors.some((error) =>
                    error.element.get().includes(control)
                )
        );
    }

    /**
     * Determines if all required elements are valid or invalid based on the error array
     */
    public validateAllAgainstCommon(): void {
        this.validateAll(
            (control) =>
                !this.errors.some((error) =>
                    error.element.get().includes(control)
                )
        );
    }

    /**
     * Interfaces with the validateForm function from common.js and returns an array of errors containing pairs of messages and jQuery objects
     * @returns IValidateCommonErrorResponse[]
     */
    private static getErrors(): IValidateCommonErrorResponse[] {
        let errors;

        if (typeof validateForm === "function") {
            errors = validateForm(this.event, false, true);
        }

        return Array.isArray(errors) ? errors : [];
    }
}
