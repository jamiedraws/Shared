/**
 * An object where each observable type contains an array that can be populated with the IPubSubEventTask object
 */
export interface IPubSubEvents {}

export interface IPubSubEventTask {
    /**
     * Represents a unique identifier as an object key
     */
    token: string;
    /**
     * Represents a callback function to execute
     */
    task: PubSubTask;
}

/**
 * This is a callback function which executes on a publish event
 */
export type PubSubTask = (data: any) => void;
