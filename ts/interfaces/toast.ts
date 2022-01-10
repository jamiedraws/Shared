export interface IToastHTMLTemplate {
    /**
     * Represents the element containing everything within the toast component
     */
    container: HTMLElement;
    /**
     * Represents the animatable container and controls the content's visibility status
     */
    stage: HTMLElement;
    /**
     * Represents a button that can dismiss the toast component
     */
    dismissButton: HTMLButtonElement;
    /**
     * Represents the group containing the text container and the dismiss button
     */
    group: HTMLElement;
    /**
     * Represents the element containing the text node
     */
    textContainer: HTMLSpanElement;
    /**
     * Represents the live region container
     */
    liveRegion: HTMLElement;
}

export interface IToastConfig {
    /**
     * Represents the role of content that resides within the toast
     */
    role?: "status" | "alert" | "log";
    /**
     * Represents the message to be read within the toast
     */
    message?: string;
    /**
     * Represents the visual appearance of the toast
     */
    theme?: string;
}

export interface IToastEventManager {
    /**
     * When the stage element transitions on/off screen
     */
    stage: EventListenerOrEventListenerObject;
    /**
     * When the dismiss button is activated
     */
    dismissButton: EventListenerOrEventListenerObject;
}
