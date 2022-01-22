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

    constructor(
        form?: HTMLFormElement,
        namespace?: string,
        attribute?: string
    ) {
        this.form = form ?? document.querySelector("form");

        this.submit = this.form?.querySelector(`[type="submit"]`);

        this.captureComboboxes();
        this.captureInputs();

        this.namespace = namespace ?? "message";
        this.attribute = attribute ?? "required";
    }

    /**
     * Takes an element and updates the CSS rules in order to render the valid state
     * @param control Element
     */
    public setControlToValid(control: Element): void {
        control.classList.remove(`${this.namespace}__is-invalid`);
        control.classList.add(`${this.namespace}__is-valid`);
    }

    /**
     * Takes an element and updates the CSS rules in order to render the invalid state
     * @param control Element
     */
    public setControlToInvalid(control: Element): void {
        control.classList.remove(`${this.namespace}__is-valid`);
        control.classList.add(`${this.namespace}__is-invalid`);
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
     * Accesses the first invalid control and attempts to set focus to it
     */
    public setFocusOnInvalidControl(): void {
        const control = this.getRequiredControls()[0];

        if (control) {
            control.focus();
        }
    }

    /**
     * Takes either an input or combobox element and determines the nearest element that can handle rendering the control's valid and invalid state via CSS
     * @param control HTMLInputElement or HTMLSelectElement
     */
    public validateControl<T extends HTMLInputElement | HTMLSelectElement>(
        control: T
    ): void {
        const target = control.closest(`.${this.namespace}__select`) ?? control;

        control.checkValidity()
            ? this.setControlToValid(target)
            : this.setControlToInvalid(target);
    }

    /**
     * Returns a new array containing both input and combobox elements that contain the attribute that represents the required state
     * @returns (HTMLSelectElement | HTMLInputElement)[]
     */
    public getRequiredControls(): (HTMLSelectElement | HTMLInputElement)[] | [] {
        if (!this.form) return [];

        return Array.from(this.form.querySelectorAll(`[${this.attribute}]`));
    }

    /**
     * Returns a new array of input elements that contain the attribute that represents the required state
     * @returns HTMLInputElement[]
     */
    public getRequiredInputs(): HTMLInputElement[] {
        return this.inputs.filter((input) =>
            input.hasAttribute(this.attribute)
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
     * Iterates through all required combobox elements and validates each combobox
     */
    public validateComboboxes(): void {
        this.getRequiredComboboxes().forEach((combobox) =>
            this.validateControl(combobox)
        );
    }

    /**
     * Iterates through all required input elements and validates each input
     */
    public validateInputs(): void {
        this.getRequiredInputs().forEach((input) =>
            this.validateControl(input)
        );
    }

    /**
     * Iterates through all required combobox and input elements and validates each element
     */
    public validateAll(): void {
        this.validateComboboxes();
        this.validateInputs();
    }
}
