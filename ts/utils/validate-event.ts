import { IValidateEventConfig } from "Shared/ts/interfaces/validate-event";
import CaptureElement from "Shared/ts/utils/capture-element";
import Validate, { ValidateControl } from "Shared/ts/utils/validate";

export default class ValidateEvent extends Validate {
    /**
     * Represents a list of event types that can be assigned to perform validation on the HTMLInputElement type
     */
    public inputEvents: string[];

    /**
     * Represets a list of event types that can be assigned to perform validation on the HTMLInputElement type when invalid
     */
    public invalidInputEvents: string[];

    /**
     * Represents a list of event types that can be assigned to perform validation on the HTMLSelectElement type
     */
    public comboboxEvents: string[];

    /**
     * Represets a list of event types that can be assigned to perform validation on the HTMLSelectElement type when invalid
     */
    public invalidComboboxEvents: string[];

    /**
     * Represents a list of event types that can be assigned to perform validation on the HTMLTextAreaElement type
     */
    public textareaEvents: string[];

    /**
     * Represets a list of event types that can be assigned to perform validation on the HTMLTextAreaElement type when invalid
     */
    public invalidTextareaEvents: string[];

    /**
     * Reference name to the input event handler method that can be added and removed from the input element
     */
    public validateInputEvent: (event: Event) => void;

    /**
     * Reference name to the combobox event handler method that can be added and removed from the combobox element
     */
    public validateComboboxEvent: (event: Event) => void;

    /**
     * Reference name to the textarea event handler method that can be added and removed from the textarea element
     */
    public validateTextareaEvent: (event: Event) => void;

    /**
     * Provides the ability to apply validation rules from common.js through the Validate interface. Inheriting from the Validate interface, configuration settings include the ability to provide a specific element to represent the form to validate for, a CSS namespace to customize the presentation and an attribute to discern which form controls are required. Additionally, event type mapping can be provided to customize the validation experience.
     * @param config IValidateEventConfig
     */
    constructor(config?: IValidateEventConfig) {
        super(config);

        this.inputEvents = config?.inputEvents ?? [];
        this.comboboxEvents = config?.comboboxEvents ?? [];
        this.textareaEvents = config?.textareaEvents ?? [];

        this.invalidInputEvents =
            config?.invalidInputEvents ?? this.inputEvents;
        this.invalidComboboxEvents =
            config?.invalidComboboxEvents ?? this.comboboxEvents;
        this.invalidTextareaEvents =
            config?.invalidTextareaEvents ?? this.textareaEvents;

        this.validateInputEvent = (event: Event): void => {
            this.validateControl(event.target as HTMLInputElement);
        };

        this.validateComboboxEvent = (event: Event): void => {
            this.validateControl(event.target as HTMLSelectElement);
        };

        this.validateTextareaEvent = (event: Event): void => {
            this.validateControl(event.target as HTMLTextAreaElement);
        };

        ValidateEvent.initializeCapture(this);
    }

    /**
     * Establishes a mutation observer on the form element and observes attribute changes on all required controls. Changes to the attributes will determine the flow control of valid/invalid event mapping.
     * @param context ValidateEvent
     * @returns void
     */
    protected static initializeCapture(context: ValidateEvent): void {
        if (!context.form) return;

        const captureForm = new CaptureElement(context.form);
        const controls = context.getRequiredControls() as ValidateControl[];

        captureForm.subscribe("attributes", (record): void => {
            const control = record.target as ValidateControl;

            if (!controls.includes(control)) return;

            const nodeName = control.nodeName.toLowerCase();

            if (context.isInvalidControl(control)) {
                switch (nodeName) {
                    case "input":
                        ValidateEvent.assignInvalidInputEvents(
                            control as HTMLInputElement,
                            context
                        );
                        break;
                    case "select":
                        ValidateEvent.assignInvalidComboEvents(
                            control as HTMLSelectElement,
                            context
                        );
                        break;
                    case "textarea":
                        ValidateEvent.assignInvalidTextareaEvents(
                            control as HTMLTextAreaElement,
                            context
                        );
                        break;
                }
            }
        });
    }

    /**
     * Enable direct validation
     */
    public validateOnDemand(): void {
        this.setFocusOnInvalidControl();
        this.processControlEvents();
    }

    /**
     * Enable validation based on the form's submit element's "click" event
     */
    public validateOnSubmit(): void {
        this.submit?.addEventListener("click", () => {
            this.validateOnDemand();
        });
    }

    /**
     * Enable validation based on whether the captured element is the submit element
     */
    public validateOnSubmitDelegation(): void {
        this.form?.addEventListener("click", (event) => {
            const target = event.target as HTMLElement;

            if (target === this.submit) {
                this.validateOnDemand();
            }
        });
    }

    /**
     * Enable event listeners mapping to each of the provided event types on input, combobox and textarea elements
     */
    public processControlEvents(): void {
        this.processInputEvents();
        this.processComboboxEvents();
        this.processTextareaEvents();
    }

    /**
     * Removes all invalid input events and adds all valid input events to the control
     * @param input HTMLInputElement
     * @param context ValidateEvent
     */
    private static assignValidInputEvents(
        input: HTMLInputElement,
        context: ValidateEvent
    ): void {
        context.invalidInputEvents.forEach((event) => {
            input.removeEventListener(event, context.validateInputEvent);
        });

        context.inputEvents.forEach((event) => {
            input.removeEventListener(event, context.validateInputEvent);
            input.addEventListener(event, context.validateInputEvent);
        });
    }

    /**
     * Removes all valid input events and adds all invalid input events to the control
     * @param input HTMLInputElement
     * @param context ValidateEvent
     */
    private static assignInvalidInputEvents(
        input: HTMLInputElement,
        context: ValidateEvent
    ): void {
        context.inputEvents.forEach((event) => {
            input.removeEventListener(event, context.validateInputEvent);
        });

        context.invalidInputEvents.forEach((event) => {
            input.removeEventListener(event, context.validateInputEvent);
            input.addEventListener(event, context.validateInputEvent);
        });
    }

    /**
     * Removes all invalid combobox events and adds all valid combobox events to the control
     * @param combobox HTMLSelectElement
     * @param context ValidateEvent
     */
    private static assignValidComboboxEvents(
        combobox: HTMLSelectElement,
        context: ValidateEvent
    ): void {
        context.invalidComboboxEvents.forEach((event) => {
            combobox.removeEventListener(event, context.validateInputEvent);
        });

        context.comboboxEvents.forEach((event) => {
            combobox.removeEventListener(event, context.validateInputEvent);
            combobox.addEventListener(event, context.validateInputEvent);
        });
    }

    /**
     * Removes all valid combobox events and adds all invalid combobox events to the control
     * @param combobox HTMLSelectElement
     * @param context ValidateEvent
     */
    private static assignInvalidComboEvents(
        combobox: HTMLSelectElement,
        context: ValidateEvent
    ): void {
        context.comboboxEvents.forEach((event) => {
            combobox.removeEventListener(event, context.validateInputEvent);
        });

        context.invalidComboboxEvents.forEach((event) => {
            combobox.removeEventListener(event, context.validateInputEvent);
            combobox.addEventListener(event, context.validateInputEvent);
        });
    }

    /**
     * Removes all invalid textarea events and adds all valid textarea events to the control
     * @param textarea HTMLTextAreaElement
     * @param context ValidateEvent
     */
    private static assignValidTextareaEvents(
        textarea: HTMLTextAreaElement,
        context: ValidateEvent
    ): void {
        context.invalidTextareaEvents.forEach((event) => {
            textarea.removeEventListener(event, context.validateTextareaEvent);
        });

        context.textareaEvents.forEach((event) => {
            textarea.removeEventListener(event, context.validateTextareaEvent);
            textarea.addEventListener(event, context.validateTextareaEvent);
        });
    }

    /**
     * Removes all valid textarea events and adds all invalid textarea events to the control
     * @param textarea HTMLTextAreaElement
     * @param context ValidateEvent
     */
    private static assignInvalidTextareaEvents(
        textarea: HTMLTextAreaElement,
        context: ValidateEvent
    ): void {
        context.invalidTextareaEvents.forEach((event) => {
            textarea.removeEventListener(event, context.validateTextareaEvent);
        });

        context.textareaEvents.forEach((event) => {
            textarea.removeEventListener(event, context.validateTextareaEvent);
            textarea.addEventListener(event, context.validateTextareaEvent);
        });
    }

    /**
     * Enable event listeners mapping to each of the provided event types on input elements
     */
    public processInputEvents(): void {
        this.getValidRequiredInputs().forEach((input) =>
            ValidateEvent.assignValidInputEvents(input, this)
        );

        this.getInvalidRequiredInputs().forEach((input) =>
            ValidateEvent.assignInvalidInputEvents(input, this)
        );
    }

    /**
     * Enable event listeners mapping to each of the provided event types on combobox elements
     */
    public processComboboxEvents(): void {
        this.getValidRequiredComboboxes().forEach((combobox) =>
            ValidateEvent.assignValidComboboxEvents(combobox, this)
        );

        this.getInvalidRequiredComboboxes().forEach((combobox) =>
            ValidateEvent.assignInvalidComboEvents(combobox, this)
        );
    }

    /**
     * Enable event listeners mapping to each of the provided event types on textarea elements
     */
    public processTextareaEvents(): void {
        this.getValidRequiredTextareas().forEach((textarea) =>
            ValidateEvent.assignValidTextareaEvents(textarea, this)
        );

        this.getInvalidRequiredTextareas().forEach((textarea) =>
            ValidateEvent.assignInvalidTextareaEvents(textarea, this)
        );
    }
}
