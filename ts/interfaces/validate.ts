export interface IValidateConfig {
    /**
     * Represents the form element
     */
    form?: HTMLFormElement;
    /**
     * Represents the submit button element
     */
    submit?: HTMLInputElement | HTMLButtonElement;
    /**
     * Represents the CSS namespace that is responsible for rendering each controls valid and invalid state. Defaults to *message*
     */
    namespace?: string;
    /**
     * Represents the HTML attribute that will determine when a control is considered valid or invalid. Defaults to *required*
     */
    attribute?: string;
}
