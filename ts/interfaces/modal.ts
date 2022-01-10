import { HTMLItem } from "shared/ts/utils/html";

export interface IModalHTMLTemplate {
    /**
     * Overall container for the modal. The container will include attributes for role, aria-label, aria-labelledby and or aria-describedby
     */
    container: HTMLElement;
    /**
     * Direct child of the container and sibling of the backdrop. The viewport controls the scrollable content.
     */
    viewport: HTMLElement;
    /**
     * The stage reserves the space for the content, the close button and focus trap boundaries.
     */
    stage: HTMLElement;
    /**
     * The content reserves the default background color of the inside content.
     */
    content: HTMLElement;
    /**
     * The visual background obscuring the inaccessible content.
     */
    backdrop: HTMLElement;
    /**
     * The default close button above the content.
     */
    closeButton: HTMLElement;
}

export default interface IModalConfig {
    /**
     * Represents the value of a valid HTML element identity.
     */
    id?: string;
    name?: HTMLItem | string;
    /**
     * Represents the type of modal required for the content. Available roles are "dialog" or "alertdialog". The default role is "dialog".
     */
    role?: "dialog" | "alertdialog";
    /**
     * Represents the description of the modal by reference identity. A warning will be reported to the browser if the reference isn't applied to a valid HTML identity.
     */
    ariaDescribedBy?: string;
    /**
     * Represents the label of the modal by reference identity. A warning will be reported to the browser if the reference isn't applied to a valid HTML identity.
     */
    ariaLabelledBy?: string;
    /**
     * Represents the label of the modal directly.
     */
    ariaLabel?: string;
}
