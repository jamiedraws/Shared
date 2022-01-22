import FocusManager from "Shared/ts/utils/focus-manager";

export default class FocusTrap extends FocusManager {
    /**
     * Represents the current FocusTrap interface. It should be noted that one FocusTrap should be accessible where it's properties can be mapped to the active user-interface.
     */
    private static context: FocusTrap;

    /**
     * Extends the base functionality of the FocusManager interface by providing support to enable/disable focus trap navigation.
     * @param root HTMLElement
     */
    constructor(root: HTMLElement | null = document.querySelector("body")) {
        super(root);

        FocusTrap.setRootBoundaries(this);
    }

    /**
     * Fetches the root boundary element by an id.
     * @param id string
     * @returns HTMLElement
     */
    private static getRootBoundaryElement(
        id: string,
        context: FocusTrap
    ): HTMLElement | null {
        const root = this.getRoot(context);

        return root ? root.querySelector(`[data-root-boundary="${id}"]`) : null;
    }

    /**
     * Manages the focus event listeners based on a switch. The switch defaults to true meaning, the first and last focusable elements will add an event listener. Switching to false will remove the event listeners from the first and last focusable elements.
     * @param self FocusTrap
     * @param eventOn boolean
     */
    private static manageFocusEvents(
        context: FocusTrap,
        eventOn: boolean = true
    ) {
        this.context = context;

        const first = this.getRootBoundaryElement("first", context);
        const last = this.getRootBoundaryElement("last", context);

        if (first && eventOn) {
            first.addEventListener("focus", this.handleFirstFocusEvent);
        }

        if (last && eventOn) {
            last.addEventListener("focus", this.handleLastFocusEvent);
        }

        if (first && !eventOn) {
            first.removeEventListener("focus", this.handleFirstFocusEvent);
        }

        if (last && !eventOn) {
            last.removeEventListener("focus", this.handleLastFocusEvent);
        }
    }

    /**
     * Signature event listener callback function that handles the first focusable element. This will set focus back to the last focusable element.
     * @param event FocusEvent
     */
    private static handleFirstFocusEvent(event: FocusEvent): void {
        const focusElement = FocusTrap.context.lastElement() as HTMLElement;

        focusElement.focus();
    }

    /**
     * Signature event listener callback function that handles the last focusable element. This will set focus back to the first focusable element.
     * @param event FocusEvent
     */
    private static handleLastFocusEvent(event: FocusEvent): void {
        const focusElement = FocusTrap.context.firstElement() as HTMLElement;

        focusElement.focus();
    }

    /**
     * Creates a tabindex boundary within the modal to manage focus trap.
     * @param root HTMLElement
     */
    private static setRootBoundaries(context: FocusTrap): void {
        const root = FocusTrap.root.get(context);

        if (root) {
            root.insertAdjacentElement(
                "afterbegin",
                this.createBoundaryElement("first")
            );
            root.insertAdjacentElement(
                "beforeend",
                this.createBoundaryElement("last")
            );
        }
    }

    /**
     * Creates a new focusable element that can be provided to Modal.setRootBoundaries.
     * @returns HTMLElement
     */
    private static createBoundaryElement(id: string = ""): HTMLElement {
        const element = document.createElement("div");

        element.setAttribute("data-root-boundary", id);
        element.setAttribute("aria-hidden", "true");
        element.setAttribute("tabindex", "0");

        return element;
    }

    /**
     * Enables support for focus trap navigation between the first and last focusable elements.
     */
    public on(): void {
        FocusTrap.manageFocusEvents(this, true);
    }

    /**
     * Disables support for focus trap navigation between the first and last focusable elements.
     */
    public off(): void {
        FocusTrap.manageFocusEvents(this, false);
    }
}
