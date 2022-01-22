export interface IToastHTMLTemplate {
    /**
     * Represents the element containing everything within the toast component
     */
    container: HTMLElement | null;
    /**
     * Represents the animatable container and controls the content's visibility status
     */
    stage: HTMLElement | null;
    /**
     * Represents a button that can dismiss the toast component
     */
    dismissButton: HTMLButtonElement | null;
    /**
     * Represents the group containing the text container and the dismiss button
     */
    group: HTMLElement | null;
    /**
     * Represents the element containing the text node
     */
    textContainer: HTMLSpanElement | null;
    /**
     * Represents the live region container
     */
    liveRegion: HTMLElement | null;
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
    stage: (event: TransitionEvent) => void;
    /**
     * When the dismiss button is activated
     */
    dismissButton: (event: MouseEvent) => void;
}
