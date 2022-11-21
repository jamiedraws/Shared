import "element-closest/browser";
import { IValidateConfig } from "Shared/ts/interfaces/validate";

export type ValidateControl =
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement;

export type ValidateControlTarget = ValidateControl | Element;

export default class Validate {
    /**
     * Represents the form element
     */
    public form: HTMLFormElement | null;

    /**
     * Represents an array of all combobox (select) controls
     */
    public comboboxes: HTMLSelectElement[] = [];

    /**
     * Represents an array of all input controls
     */
    public inputs: HTMLInputElement[] = [];

    /**
     * Represents an array of all textarea elements
     */
    public textareas: HTMLTextAreaElement[] = [];

    /**
     * Represents an array of controls that are neither combobox nor input controls
     */
    public controlTargets: ValidateControlTarget[] = [];

    /**
     * Represents the current form submit button
     */
    public submit: HTMLInputElement | HTMLButtonElement | null | undefined;

    /**
     * Represents the CSS namespace that is responsible for rendering each controls valid and invalid state. Defaults to *message*
     */
    public namespace: string;

    /**
     * Represents the HTML attribute that will determine when a control is considered valid or invalid. Defaults to *required*
     */
    public attribute: string;

    constructor(config?: IValidateConfig) {
        this.form = config?.form ?? document.querySelector("form");

        this.submit =
            config?.submit ?? this.form?.querySelector(`[type="submit"]`);

        this.captureComboboxes();
        this.captureInputs();
        this.captureTextareas();

        this.namespace = config?.namespace ?? "message";
        this.attribute = config?.attribute ?? "required";

        this.getRequiredControls()
            .filter((control) => !control.hasAttribute("required"))
            .forEach((control) => {
                control.setAttribute("aria-required", "true");
                control.setAttribute("aria-invalid", "true");
            });
    }

    /**
     * Takes an element and updates the CSS rules in order to render the valid state
     * @param control Element
     */
    public setControlToValid(control: ValidateControlTarget): void {
        control.classList.remove(`${this.namespace}__is-invalid`);
        control.classList.add(`${this.namespace}__is-valid`);
    }

    /**
     * Takes an element and updates the CSS rules in order to render the invalid state
     * @param control Element
     */
    public setControlToInvalid(control: ValidateControlTarget): void {
        control.classList.remove(`${this.namespace}__is-valid`);
        control.classList.add(`${this.namespace}__is-invalid`);
    }

    /**
     * Takes an element and removes the CSS rules in order to render the default state
     * @param control Element
     */
    public setControlToDefault(control: ValidateControlTarget): void {
        control.classList.remove(`${this.namespace}__is-valid`);
        control.classList.remove(`${this.namespace}__is-invalid`);
    }

    /**
     * Refreshes the combobox array with a new array containing all combobox (select) controls in the current form
     */
    public captureComboboxes(): void {
        if (!this.form) return;

        this.comboboxes = Array.from(this.form.querySelectorAll("select"));
    }

    /**
     * Refreshes the input array with a new array containing all input controls in the current form
     */
    public captureInputs(): void {
        if (!this.form) return;

        this.inputs = Array.from(this.form.querySelectorAll(`input`));
    }

    /**
     * Refreshes the textarea array with a new array containing all textarea controls in the current form
     */
    public captureTextareas(): void {
        if (!this.form) return;

        this.textareas = Array.from(this.form.querySelectorAll("textarea"));
    }

    /**
     * Accesses the first invalid control and attempts to set focus to it
     */
    public setFocusOnInvalidControl(): void {
        const control = this.getRequiredControls().find((control) =>
            this.getTargetByControl(control).classList.contains(
                `${this.namespace}__is-invalid`
            )
        );

        if (control) {
            control.focus();
        }
    }

    /**
     * Takes either an input or combobox element and determines the nearest element that can handle rendering the control's valid and invalid state via CSS
     * @param control HTMLInputElement or HTMLSelectElement
     */
    public validateControl<T extends ValidateControl>(
        control: T,
        predicate?: (control: T) => boolean
    ): void {
        const target = this.getTargetByControl(control);

        const checkValidity =
            typeof predicate === "function"
                ? predicate(control)
                : control.checkValidity();

        checkValidity
            ? this.setControlToValid(target)
            : this.setControlToInvalid(target);

        const isRequiredControl = this.getRequiredControls().find(
            (requiredControl) => requiredControl === control
        );

        if (isRequiredControl && !control.hasAttribute("required")) {
            control.setAttribute(
                "aria-invalid",
                checkValidity ? "false" : "true"
            );
        }
    }

    public validateControlTarget(
        controlTarget: ValidateControlTarget,
        predicate?: (controlTarget: ValidateControlTarget) => boolean
    ): void {
        const hasPredicate = typeof predicate === "function";
        if (!hasPredicate) return;

        predicate(controlTarget)
            ? this.setControlToValid(controlTarget)
            : this.setControlToInvalid(controlTarget);
    }

    /**
     * Takes an input or combobox element and determines if the control is invalid
     * @param control HTMLInputElement | HTMLSelectElement
     * @returns boolean
     */
    public isValidControl(
        control: ValidateControl | HTMLTextAreaElement
    ): boolean {
        const target = this.getTargetByControl(control);

        return (
            target.classList.contains(`${this.namespace}__is-valid`) ||
            !this.isInvalidControl(control)
        );
    }

    /**
     * Takes an input or combobox element and determines if the control is valid
     * @param control HTMLInputElement | HTMLSelectElement
     * @returns boolean
     */
    public isInvalidControl(control: ValidateControl): boolean {
        const target = this.getTargetByControl(control);

        return this.isInvalidControlTarget(target);
    }

    /**
     * Determines if the control is valid based on the class name match from the control target element
     * @param target ValidateControlTarget
     * @returns boolean
     */
    public isValidControlTarget(target: ValidateControlTarget): boolean {
        return !this.isInvalidControlTarget(target);
    }

    /**
     * Determines if the control is invalid based on the class name match from the control target element
     * @param target ValidateControlTarget
     * @returns boolean
     */
    public isInvalidControlTarget(target: ValidateControlTarget): boolean {
        return target.classList.contains(`${this.namespace}__is-invalid`);
    }

    /**
     * Returns the closest element that matches the CSS class namespace or defaults to the control itself
     * @param control HTMLInputElement or HTMLSelectElement
     * @returns Element | T
     */
    public getTargetByControl(control: ValidateControl): ValidateControlTarget {
        return control.closest(`.${this.namespace}__select`) ?? control;
    }

    /**
     * Returns a new array containing both input and combobox elements that contain the attribute that represents the required state
     * @returns ValidateControl[]
     */
    public getRequiredControls(): ValidateControl[] | [] {
        if (!this.form) return [];

        return Array.from(
            this.form.querySelectorAll<ValidateControl>(`[${this.attribute}]`)
        );
    }

    /**
     * Returns all invalid and required controls
     * @returns ValidateControl[]
     */
    public getInvalidRequiredControls(): ValidateControl[] {
        return this.getRequiredControls().filter((control) =>
            this.isInvalidControl(control)
        );
    }

    /**
     * Returns all valid and required controls
     * @returns ValidateControl[]
     */
    public getValidRequiredControls(): ValidateControl[] {
        return this.getRequiredControls().filter((control) =>
            this.isValidControl(control)
        );
    }

    /**
     * Returns all invalid and required target elements
     * @returns ValidateControlTarget[]
     */
    public getInvalidRequiredTargets(): ValidateControlTarget[] {
        return this.getInvalidRequiredControls().map((control) =>
            this.getTargetByControl(control)
        );
    }

    /**
     * Returns all valid and required target elements
     * @returns ValidateControlTarget[]
     */
    public getValidRequiredTargets(): ValidateControlTarget[] {
        return this.getValidRequiredControls().map((control) =>
            this.getTargetByControl(control)
        );
    }

    /**
     * Returns a new array of input elements that contain the attribute that represents the required state
     * @returns HTMLInputElement[]
     */
    public getRequiredInputs(): HTMLInputElement[] {
        const inputs = this.inputs.filter((input) =>
            input.hasAttribute(this.attribute)
        );

        inputs
            .filter((input) => input.type === "radio")
            .forEach((radio) =>
                this.inputs
                    .filter(
                        (input) => input.name === radio.name && input !== radio
                    )
                    .forEach((input) => inputs.push(input))
            );

        return inputs;
    }

    /**
     * Returns all invalid and required input controls
     * @returns HTMLInputElement[]
     */
    public getInvalidRequiredInputs(): HTMLInputElement[] {
        return this.getRequiredInputs().filter((input) =>
            this.isInvalidControl(input)
        );
    }

    /**
     * Returns all valid and required input controls
     * @returns HTMLInputElement[]
     */
    public getValidRequiredInputs(): HTMLInputElement[] {
        return this.getRequiredInputs().filter((input) =>
            this.isValidControl(input)
        );
    }

    /**
     * Returns a new array of combobox elements that contain the attribute that represents the required state
     * @returns HTMLSelectElement[]
     */
    public getRequiredComboboxes(): HTMLSelectElement[] {
        return this.comboboxes.filter((combobox) =>
            combobox.hasAttribute(this.attribute)
        );
    }

    /**
     * Returns all invalid and required combobox controls
     * @returns HTMLSelectElement[]
     */
    public getInvalidRequiredComboboxes(): HTMLSelectElement[] {
        return this.getRequiredComboboxes().filter((combobox) =>
            this.isInvalidControl(combobox)
        );
    }

    /**
     * Returns all valid and required combobox controls
     * @returns HTMLSelectElement[]
     */
    public getValidRequiredComboboxes(): HTMLSelectElement[] {
        return this.getRequiredComboboxes().filter((combobox) =>
            this.isValidControl(combobox)
        );
    }

    /**
     * Returns a new array of textarea elements that contain the attribute that represents the required state
     * @returns HTMLTextAreaElement[]
     */
    public getRequiredTextareas(): HTMLTextAreaElement[] {
        return this.textareas.filter((textarea) =>
            textarea.hasAttribute(this.attribute)
        );
    }

    /**
     * Returns all invalid and required textarea controls
     * @returns HTMLTextAreaElement[]
     */
    public getInvalidRequiredTextareas(): HTMLTextAreaElement[] {
        return this.getRequiredTextareas().filter((textarea) =>
            this.isInvalidControl(textarea)
        );
    }

    /**
     * Returns all valid and required textarea controls
     * @returns HTMLTextAreaElement[]
     */
    public getValidRequiredTextareas(): HTMLTextAreaElement[] {
        return this.getRequiredTextareas().filter((textarea) =>
            this.isValidControl(textarea)
        );
    }

    /**
     * Iterates through all required combobox elements and validates each combobox
     */
    public validateComboboxes(
        predicate?: (combobox: HTMLSelectElement) => boolean
    ): void {
        this.getRequiredComboboxes().forEach((combobox) =>
            this.validateControl(combobox, predicate)
        );
    }

    /**
     * Iterates through all required controllers elements and validates each combobox
     */
    public validateControls(
        predicate?: (control: ValidateControl) => boolean
    ): void {
        this.getRequiredControls().forEach((control) => {
            this.validateControl(control, predicate);
        });
    }

    /**
     * Iterates through all required control target elements and validates each combobox
     */
    public validateControlTargets(
        predicate?: (control: ValidateControlTarget) => boolean
    ): void {
        this.controlTargets.forEach((controlTarget) => {
            this.validateControlTarget(controlTarget, predicate);
        });
    }

    /**
     * Iterates through all required input elements and validates each input
     */
    public validateInputs(
        predicate?: (input: HTMLInputElement) => boolean
    ): void {
        this.getRequiredInputs().forEach((input) =>
            this.validateControl(input, predicate)
        );
    }

    /**
     * Iterates through all required textarea elements and validates each textarea
     */
    public validateTextareas(
        predicate?: (textarea: HTMLTextAreaElement) => boolean
    ): void {
        this.getRequiredTextareas().forEach((textarea) =>
            this.validateControl(textarea, predicate)
        );
    }

    /**
     * Iterates through all required combobox and input elements and validates each element
     */
    public validateAll(
        predicate?: (control: ValidateControlTarget) => boolean
    ): void {
        this.validateInputs(predicate);
        this.validateComboboxes(predicate);
        this.validateTextareas(predicate);
        this.validateControlTargets(predicate);
    }

    /**
     * Determines if the entire form is considered valid
     * @returns boolean
     */
    public isValidForm(): boolean {
        return this.getInvalidRequiredControls().length === 0;
    }
}
