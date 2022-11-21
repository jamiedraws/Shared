import { IValidateConfig } from "Shared/ts/interfaces/validate";

export interface IValidateEventConfig extends IValidateConfig {
    /**
     * Represents a list of event types that can be assigned to perform validation on the HTMLInputElement type
     */
    inputEvents?: string[];
    /**
     * Represents a list of event types that can be assigned to perform validation on the HTMLSelectElement type
     */
    comboboxEvents?: string[];
    /**
     * Represents a list of event types that can be assigned to perform validation on the HTMLTextAreaElement type
     */
    textareaEvents?: string[];
    /**
     * Represets a list of event types that can be assigned to perform validation on the HTMLInputElement type when invalid
     */
    invalidInputEvents?: string[];
    /**
     * Represets a list of event types that can be assigned to perform validation on the HTMLSelectElement type when invalid
     */
    invalidComboboxEvents?: string[];
    /**
     * Represets a list of event types that can be assigned to perform validation on the HTMLTextAreaElement type when invalid
     */
    invalidTextareaEvents?: string[];
}
