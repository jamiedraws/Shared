/**
 * This configuration allows an author to specific the exact type of HTML element that should be created, which source the element should point to and determine the loading event strategy when the element is inserted into the document.
 */
export interface ILoadItemConfig {
    /**
     * Represents the HTML tag name
     */
    tag: string;
    /**
     * Represents the source value pointing to a specific file or URL
     */
    src: string;
    /**
     * Represents the name of the load event type that will execute when the network response for the source succeeds
     */
    onloadname?: string;
    /**
     * Represents the name of the error event type that will execute when the network response for the source fails
     */
    onerrorname?: string;
}

export type LoadItemTask = (element?: HTMLElement | undefined) => void;

export interface ILoadItemController {
    name: string;
    task: LoadItemTask;
}
