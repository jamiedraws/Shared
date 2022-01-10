import { elementExists, enumerateElements } from "shared/ts/utils/html";

export default class FocusManager {
    /**
     * Represents the internal root WeakMap interface that communicates with the public root accessor.
     */
    protected static root: WeakMap<FocusManager, HTMLElement> = new WeakMap();

    /**
     * Uses the FocusManager instance as a key to return the root HTMLElement.
     * @param key FocusManager
     * @returns HTMLElement
     */
    protected static getRoot(key: FocusManager): HTMLElement {
        return this.root.get(key);
    }

    /**
     * Represents all focusable elements within the root context.
     */
    public focusElements: Element[];

    /**
     * Uses a root element to determine all of the focusable elements that exist within the root context. All focusable elements are returned as a new array and can be accessed. Support includes operations to enable and disable focus trap navigation.
     * @param root HTMLElement
     */
    constructor(root: HTMLElement = document.querySelector("body")) {
        if (!elementExists(root)) {
            throw new Error(
                `FocusManager failed to determine if the passed element exists.`
            );
        }

        FocusManager.root.set(this, root);
        this.updateElements();
    }

    /**
     * Queries the document to fetch all focusable elements within the root context. The returned NodeList will be converted into an array and be accessible through the "focusElements" property.
     */
    public updateElements(): void {
        const root = FocusManager.root.get(this);

        this.focusElements = enumerateElements(
            root.querySelectorAll(
                "button, [href]:not(link):not(base), input, select, textarea, [tabindex]:not([data-root-boundary])"
            )
        );
    }

    /**
     * Returns the first focusable element within the root context.
     * @returns Element
     */
    public firstElement(): Element {
        return this.focusElements[0];
    }

    /**
     * Returns the last focusable element within the root context.
     * @returns Element
     */
    public lastElement(): Element {
        return this.focusElements[this.focusElements.length - 1];
    }
}
