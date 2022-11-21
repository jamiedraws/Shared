import ElementController from "Shared/ts/utils/element-controller";

export default class Disclosure extends ElementController {
    /**
     * An extension of the `ElementController` interface, `Disclosure` aims to provide an accessible user-interface where a `controller` can expand or collapse an array of `elements` based on an id list reference by the `aria-controls` attribute. This interface aims to meet the essential requirements provided by the W3C Aria best practices.
     *
     * https://w3c.github.io/aria-practices/#disclosure
     * @param root Element | null | undefined
     */
    constructor(root?: Element | null | undefined) {
        super(root);
    }

    /**
     * Initializes a controller
     * @param context Disclosure
     * @param controller Element
     */
    protected initializeController(
        context: Disclosure,
        controller: Element
    ): void {
        const relatedElements = this.getRelatedElementsByController(controller);
        const isExpanded = context.isControllerExpanded(controller);

        isExpanded
            ? Disclosure.addElementStateByElements(relatedElements, controller)
            : Disclosure.removeElementStateByElements(relatedElements);
    }

    /**
     * Takes a controller element and toggles the visibilty state towards all elements that are referenced in the controller
     * @param controller Element
     */
    public toggleElementsByController(controller: Element): void {
        this.isControllerExpanded(controller)
            ? this.removeControllerState(controller)
            : this.addControllerState(controller);
    }
}
