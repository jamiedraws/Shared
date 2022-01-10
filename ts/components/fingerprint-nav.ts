import { observer } from "shared/ts/observers/intersection";
import { isString } from "shared/ts/utils/data";
import { elementExists } from "shared/ts/utils/html";

export default class FingerPrintNav {
    /**
     * Represents the root fingerprint nav element
     */
    public root: HTMLElement;

    /**
     * Represents the CSS class name for the invisible state to the fingerprint nav element
     */
    public name: string;

    /**
     * Takes an HTMLElement to represent the fingerprint nav root element and a CSS class name to represent the invisible state of the element. Support includes abilities to control visibility state on observable elements and direct access to control visibility state.
     * @param root HTMLElement
     * @param name string
     */
    constructor(
        root: HTMLElement = document.querySelector(".fp-nav"),
        name: string = "fp-nav--is-hidden"
    ) {
        this.root = root;
        this.name = name;
    }

    /**
     * Establishes an observer on all elements matching the selector and connects the inRange and outRange callback functions to control the root element's visibility state.
     * @param selector string
     * @param inRange () => void
     * @param outRange () => void
     * @param self FingerPrintNav
     */
    private static updateWhenElementsInView<T extends () => void>(
        selector: string,
        inRange: T,
        outRange: T,
        self: FingerPrintNav
    ): void {
        if (isString(selector)) {
            observer(selector, {
                inRange: inRange.bind(self),
                outRange: outRange.bind(self),
                unObserve: false
            });
        }
    }

    /**
     * Queries the document to find all elements that match the selector and shows the fingerprint nav element when any element has intersected the viewport.
     * @param selector string
     */
    public showWhenElementsInView(selector: string): void {
        FingerPrintNav.updateWhenElementsInView(
            selector,
            this.show,
            this.hide,
            this
        );
    }

    /**
     * Queries the document to find all elements that match the selector and hides the fingerprint nav element when any element has intersected the viewport.
     * @param selector string
     */
    public hideWhenElementsInView(selector: string): void {
        FingerPrintNav.updateWhenElementsInView(
            selector,
            this.hide,
            this.show,
            this
        );
    }

    /**
     * Removes the invisible state from the fingerprint nav element
     */
    public show(): void {
        if (elementExists(this.root)) {
            this.root.classList.remove(this.name);
        }
    }

    /**
     * Adds the invisible state to the fingerprint nav element
     */
    public hide(): void {
        if (elementExists(this.root)) {
            this.root.classList.add(this.name);
        }
    }
}
