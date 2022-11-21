import { elementExists } from "Shared/ts/utils/html";

export default class FocusManager {
    /**
     * Represents the internal root WeakMap interface that communicates with the public root accessor.
     */
    protected static root: WeakMap<FocusManager, HTMLElement | null> =
        new WeakMap();

    /**
     * Uses the FocusManager instance as a key to return the root HTMLElement.
     * @param key FocusManager
     * @returns HTMLElement
     */
    protected static getRoot(
        key: FocusManager
    ): HTMLElement | undefined | null {
        return this.root.get(key);
    }

    /**
     * Represents all focusable elements within the root context.
     */
    public focusElements: HTMLElement[] = [];

    /**
     * Uses a root element to determine all of the focusable elements that exist within the root context. All focusable elements are returned as a new array and can be accessed. Support includes operations to enable and disable focus trap navigation.
     * @param root HTMLElement
     */
    constructor(root: HTMLElement | null = document.querySelector("body")) {
        if (!elementExists(root)) {
            throw new Error(
                `FocusManager failed to determine if the passed element exists.`
            );
        }

        FocusManager.root.set(this, root);
        this.updateElements();
    }

    /**
     * Queries the document to fetch all focusable elements within the root context. The returned NodeList will be converted into an array and be accessible through the "HTMLElements" property.
     */
    public updateElements(): void {
        const root = FocusManager.root.get(this);

        if (root) {
            this.focusElements = this.getElements();
        }
    }

    public getElements(): HTMLElement[] | [] {
        const root = FocusManager.root.get(this);

        return root
            ? Array.from(
                  root.querySelectorAll(
                      "button, [href]:not(link):not(base):not(use), input, select, textarea, [tabindex]:not([data-root-boundary])"
                  )
              )
            : [];
    }

    /**
     * Returns the first focusable element within the root context.
     * @returns Element
     */
    public firstElement(): HTMLElement {
        return this.focusElements[0];
    }

    /**
     * Returns the last focusable element within the root context.
     * @returns Element
     */
    public lastElement(): HTMLElement {
        return this.focusElements[this.focusElements.length - 1];
    }

    /**
     * Returns the next element or the first element from the focus element array
     * @param element HTMLElement
     * @returns HTMLElement
     */
    public nextElement(element: HTMLElement): HTMLElement {
        const index = this.focusElements.indexOf(element) + 1;

        return index <= this.focusElements.length - 1
            ? this.focusElements[index]
            : this.firstElement();
    }

    /**
     * Returns the previous element or the last element from the focus element array
     * @param element HTMLElement
     * @returns HTMLElement
     */
    public previousElement(element: HTMLElement): HTMLElement {
        const index = this.focusElements.indexOf(element) - 1;

        return index >= 0 ? this.focusElements[index] : this.lastElement();
    }
}
