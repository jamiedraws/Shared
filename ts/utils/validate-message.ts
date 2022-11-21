// utils
import Validate, {
    ValidateControl,
    ValidateControlTarget
} from "Shared/ts/utils/validate";

// interfaces
import { IValidateConfig } from "Shared/ts/interfaces/validate";

/**
 * Represents a message group element containing either a valid message element, an invalid message element or both
 */
export type ValidateControlMessageGroup = Element | null;

/**
 * Represents either a valid message element or an invalid message element
 */
export type ValidateControlMessage = Element | null;

export default class ValidateMessage extends Validate {
    /**
     * Extending the `Validate` class, providing an interface to access validation message group elements, valid message elements and invalid message elements.
     * @param config IValidateConfig
     */
    constructor(config?: IValidateConfig) {
        super(config);
    }

    /**
     * Takes a control element and returns a message group element; otherwise, returns null
     * @param control ValidateControl
     * @returns ValidateControlMessageGroup
     */
    public getMessageGroupByControl(
        control: ValidateControl
    ): ValidateControlMessageGroup {
        return this.getMessageGroupByTarget(this.getTargetByControl(control));
    }

    /**
     * Takes a target element and returns a nearby message group element; otherwise, returns null
     * @param target ValidateControlTarget
     * @returns ValidateControlMessageGroup
     */
    public getMessageGroupByTarget(
        target: ValidateControlTarget
    ): ValidateControlMessageGroup {
        let element = target.nextElementSibling;

        while (element) {
            if (element.classList.contains(`${this.namespace}__group`))
                return element;

            element = element.nextElementSibling;
        }

        return element;
    }

    /**
     * Takes a control element and returns an invalid message element; otherwise, returns null
     * @param control ValidateControl
     * @returns ValidateControlMessage
     */
    public getInvalidMessageByControl(
        control: ValidateControl
    ): ValidateControlMessage {
        const group = this.getMessageGroupByControl(control);

        return this.getInvalidMessageByGroup(group);
    }

    /**
     * Takes a control element and returns a valid message element; otherwise, returns null
     * @param control ValidateControl
     * @returns ValidateControlMessage
     */
    public getValidMessageByControl(
        control: ValidateControl
    ): ValidateControlMessage {
        const group = this.getMessageGroupByControl(control);

        return this.getInvalidMessageByGroup(group);
    }

    /**
     * Takes a target element and returns a valid element; otherwise, returns null
     * @param target ValidateControlMessageGroup
     * @returns ValidateControlMessage
     */
    public getValidMessageByGroup(
        target: ValidateControlMessageGroup
    ): ValidateControlMessage {
        return target
            ? target.querySelector(`.${this.namespace}__valid`)
            : null;
    }

    /**
     * Takes a target element and returns a invalid element; otherwise, returns null
     * @param target ValidateControlMessageGroup
     * @returns ValidateControlMessage
     */
    public getInvalidMessageByGroup(
        target: ValidateControlMessageGroup
    ): ValidateControlMessage {
        return target
            ? target.querySelector(`.${this.namespace}__invalid`)
            : null;
    }

    /**
     * Returns an array of message group elements that are mapped from all valid and required controls
     * @returns ValidateControlMessageGroup[]
     */
    public getValidRequiredMessageGroups(): ValidateControlMessageGroup[] {
        return this.getValidRequiredTargets().map((target) =>
            this.getMessageGroupByTarget(target)
        );
    }

    /**
     * Returns an array of message group elements that are mapped from all invalid and required controls
     * @returns ValidateControlMessageGroup[]
     */
    public getInvalidRequiredMessageGroups(): ValidateControlMessageGroup[] {
        return this.getInvalidRequiredTargets().map((target) =>
            this.getMessageGroupByTarget(target)
        );
    }

    /**
     * Returns an array of invalid message elements
     * @returns ValidateControlMessage[]
     */
    public getValidRequiredMessages(): ValidateControlMessage[] {
        return this.getValidRequiredMessageGroups().map((target) =>
            this.getValidMessageByGroup(target)
        );
    }

    /**
     * Returns an array of valid message elements
     * @returns ValidateControlMessage[]
     */
    public getInvalidRequiredMessages(): ValidateControlMessage[] {
        return this.getInvalidRequiredMessageGroups().map((target) =>
            this.getInvalidMessageByGroup(target)
        );
    }
}
