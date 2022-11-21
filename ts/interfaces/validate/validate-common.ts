import { IValidateConfig } from "Shared/ts/interfaces/validate";

export interface IValidateCommonErrorResponse {
    /**
     * Represents the error message text
     */
    message: string;
    /**
     * Represents the jQuery object containing either an HTMLInputElement or HTMLSelectElement type
     */
    element: JQuery<HTMLElement | HTMLInputElement | HTMLSelectElement>;
}

export interface IValidateCommonConfig extends IValidateConfig {
    /**
     * Represents a list of event types that can be assigned to perform validation on the HTMLInputElement type
     */
    inputEvents?: string[];
    /**
     * Represents a list of event types that can be assigned to perform validation on the HTMLSelectElement type
     */
    comboboxEvents?: string[];
    /**
     * Represets a list of event types that can be assigned to perform validation on the HTMLInputElement type when invalid
     */
    invalidInputEvents?: string[];
    /**
     * Represets a list of event types that can be assigned to perform validation on the HTMLSelectElement type when invalid
     */
    invalidComboboxEvents?: string[];
}
