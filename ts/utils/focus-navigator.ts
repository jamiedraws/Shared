import FocusManager from "Shared/ts/utils/focus-manager";
import CaptureElement from "Shared/ts/utils/capture-element";

export default class FocusNavigator extends FocusManager {
    /**
     * Bounding function to the `navigateElementEvent` method.
     */
    private handleNavigateElementEvent: (event: KeyboardEvent) => void;

    public considerElements: () => HTMLElement[] = () => [];

    /**
     * An extension of the `FocusManager` class where the `focusElements` available can be accessed using the `UP`, `DOWN`, `LEFT`, `RIGHT`, `HOME` and `END` keys
     * @param root HTMLElement | null
     */
    constructor(root?: HTMLElement | null) {
        super(root);

        if (root) {
            root.setAttribute("data-focus-navigator", root.id ?? "default");
        }

        this.handleNavigateElementEvent = this.navigateElementEvent.bind(this);

        FocusNavigator.updateElementsByAttributeModification(this);
    }

    /**
     *
     * @param context FocusNavigator
     * @returns void
     */
    private static updateElementsByAttributeModification(
        context: FocusNavigator
    ): void {
        const root = this.root.get(context);
        if (!root) return;

        const captureElement = new CaptureElement(root);

        captureElement.subscribe("attributes", (record) => {
            requestAnimationFrame(() => {
                context.off();

                context.updateElements();

                context.on();
            });
        });
    }

    /**
     * Queries the document to fetch all focusable elements within the root context. The returned NodeList will be converted into an array and be accessible through the "HTMLElements" property.
     */
    public updateElements(): void {
        const root = FocusNavigator.root.get(this);

        if (root) {
            this.focusElements = this.getElements().filter((element) => {
                let candidate = element;

                while (candidate && candidate.nodeType === 1) {
                    if (this.isElementInvisible(candidate)) {
                        return false;
                    }

                    candidate = candidate.parentNode as HTMLElement;
                }

                const closestRoot = element.closest("[data-focus-navigator]");

                return closestRoot === root;
            }) as HTMLElement[];
        }
    }

    /**
     * Determines if an element is considered an invisible element
     * @param element HTMLElement
     * @returns boolean
     */
    public isElementInvisible(element: HTMLElement): boolean {
        const style = window.getComputedStyle(element);

        return (
            element.hasAttribute("hidden") ||
            element.getAttribute("aria-hidden") === "true" ||
            style.display === "none" ||
            style.visibility === "hidden"
        );
    }

    /**
     * Adds the `keydown` event listener to all focusable elements
     */
    public on(): void {
        this.focusElements.forEach((element) => {
            element.addEventListener(
                "keydown",
                this.handleNavigateElementEvent
            );
        });
    }

    /**
     * Removes the `keydown` event listener from all focusable elements
     */
    public off(): void {
        this.focusElements.forEach((element) => {
            element.removeEventListener(
                "keydown",
                this.handleNavigateElementEvent
            );
        });
    }

    /**
     * Controls the navigation order based on the key. For example, the `UP` or `LEFT` keys will advance to the previous element while the `DOWN` or `RIGHT` keys will advance to the next element. The `HOME` key will advance to the first element and the `END` key will advance to the last element.
     * @param event KeyboardEvent
     */
    private navigateElementEvent(event: KeyboardEvent): void {
        const element = event.target as HTMLElement;

        if (FocusNavigator.isKeyup(event) || FocusNavigator.isKeyleft(event)) {
            event.preventDefault();
            this.previousElement(element).focus();
        }

        if (
            FocusNavigator.isKeydown(event) ||
            FocusNavigator.isKeyright(event)
        ) {
            event.preventDefault();
            this.nextElement(element).focus();
        }

        if (event.key.match(/home/i)) {
            event.preventDefault();
            this.firstElement().focus();
        }

        if (event.key.match(/end/i)) {
            event.preventDefault();
            this.lastElement().focus();
        }
    }

    /**
     * Determines if the key pressed was either the Up key or Control Key + Page Up
     * @param event KeyboardEvent
     * @returns boolean
     */
    private static isKeyup(event: KeyboardEvent): boolean {
        const key = event.key.toLowerCase();

        return (
            (event.ctrlKey && key === "pageup") ||
            key === "arrowup" ||
            key === "up"
        );
    }

    /**
     * Determines if the key pressed was either the Down key or Control Key + Page Down
     * @param event KeyboardEvent
     * @returns boolean
     */
    private static isKeydown(event: KeyboardEvent): boolean {
        const key = event.key.toLowerCase();

        return (
            (event.ctrlKey && key === "pagedown") ||
            key === "arrowdown" ||
            key === "down"
        );
    }

    /**
     * Determines if the key pressed was the left key
     * @param event KeyboardEvent
     * @returns boolean
     */
    private static isKeyleft(event: KeyboardEvent): boolean {
        const key = event.key.toLowerCase();

        return key === "arrowleft" || key === "left";
    }

    /**
     * Determines if the key pressed was the left key
     * @param event KeyboardEvent
     * @returns boolean
     */
    private static isKeyright(event: KeyboardEvent): boolean {
        const key = event.key.toLowerCase();

        return key === "arrowright" || key === "right";
    }
}
