/**
 * An object where each observable type contains an array that can be populated with the ICaptureElementEventTask object
 */
export interface ICaptureElementEvents {
    /**
     * Represents a collection of ICaptureElementEventTask objects that are mapped to the attributes observable
     */
    attributes?: ICaptureElementEventTask[];
    /**
     * Represents a collection of ICaptureElementEventTask objects that are mapped to the characterData observable
     */
    characterData?: ICaptureElementEventTask[];
    /**
     * Represents a collection of ICaptureElementEventTask objects that are mapped to the childList observable
     */
    childList?: ICaptureElementEventTask[];
}

/**
 * An object where the token represents a unique identifier as a key to access the object and a task that represents the author-provided callback function to execute.
 */
export interface ICaptureElementEventTask {
    /**
     * Represents a unique identifier as an object key
     */
    token: string;
    /**
     * Represents a callback function to execute
     */
    task: CaptureElementTask;
}

/**
 * The event name is directly related to the type of mutation event that can be observed from the MutationObserverInit dictionary.
 *
 * https://dom.spec.whatwg.org/#interface-mutationobserver
 */
export type CaptureElementEventName =
    | "attributes"
    | "characterData"
    | "childList";

/**
 * This is a callback function which executes on a captured mutation observer event. MutationRecord is a parameter containing the information on the captured event.
 */
export type CaptureElementTask = (record: MutationRecord) => void;
