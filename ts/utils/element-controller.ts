import { elementExists } from "./html";

export default class ElementController {
    /**
     * Represents the root that will contain all elements and controllers as descedent elements
     */
    public root: Element;

    /**
     * Represents an array of controller elements where each controller is responsible for managing the state of the elements through the `aria-controls` attribute
     */
    public controllers: Element[];

    /**
     * Represents an array of elements where each element can be controlled by a controller element through the `id` attribute
     */
    public elements: Element[];

    /**
     * Enables the ability for controller elements that are equipped with the `aria-controls` attribute to control the state of other elements by a reference to it's `id` attribute.
     * @param root Element
     */
    constructor(root?: Element) {
        this.root = root ?? document.querySelector(".element-controller");

        this.controllers = Array.from(
            this.root.querySelectorAll("[aria-controls]")
        );

        this.elements = [];

        ElementController.initialize(this);
    }

    /**
     * Initializes the process
     * @param context ElementController
     */
    private static initialize(context: ElementController): void {
        this.setElementsByContext(context);
    }

    /**
     * Iterates through all controllers and attempts to capture and store all matching elements that can be controlled
     * @param context ElementController
     */
    private static setElementsByContext(context: ElementController) {
        context.controllers.forEach((controller) => {
            const elements = this.getContainersByControllerIds(
                this.getIdsByController(controller),
                controller,
                context
            );

            elements.forEach((element) => {
                if (!context.elements.includes(element)) {
                    context.elements.push(element);
                }
            });
        });
    }

    /**
     * Takes a controller element and returns a string array of all id references
     * @param controller Element
     * @returns string[]
     */
    private static getIdsByController(controller: Element): string[] {
        return controller.getAttribute("aria-controls").split(" ");
    }

    /**
     * Iterates through an array of id values and attempts to capture the DOM element by that id and returns each element into a new element array. If an element cannot be found in the document, an error message will be reported to the browser console informing the developer of a mismatch.
     * @param ids string[]
     * @param controller Element
     * @param context ElementController
     * @returns Element[]
     */
    private static getContainersByControllerIds(
        ids: string[],
        controller: Element,
        context: ElementController
    ): Element[] {
        return Array.from(ids, (id) => {
            const element =
                context.getElementById(id) ??
                context.root.querySelector(`#${id}`);

            if (!elementExists(element)) {
                console.error({
                    message: `The element id, ${id}, referenced within the current controller could not be found in the document.`,
                    controller
                });
            }

            return element;
        });
    }

    /**
     * Updates the root view completely by removing the stale-state from elements and adding a fresh-state to all elements that are referenced in the current controller element's `aria-controls` attribute
     * @param controller Element
     */
    public updateElementStatesByController(controller: Element): void {
        this.removeStateFromElementsByController(controller);
        this.addStateToElementsByController(controller);
    }

    /**
     * Adds a fresh-state to all elements that are referenced in the current controller element's `aria-controls` attribute
     * @param controller Element
     */
    public addStateToElementsByController(controller: Element): void {
        const ids = ElementController.getIdsByController(controller);

        const elements = this.elements.filter((element) =>
            ids.includes(element.id)
        );

        elements.forEach((element) =>
            element.setAttribute("data-element-controller-name", controller.id)
        );
    }

    /**
     * Removes the stale-state from all elements that are not referenced in the current controller element's `aria-controls` attribute
     * @param controller Element
     */
    public removeStateFromElementsByController(controller: Element): void {
        const ids = ElementController.getIdsByController(controller);

        const elements = this.elements.filter(
            (element) => !ids.includes(element.id)
        );

        elements.forEach((element) =>
            element.removeAttribute("data-element-controller-name")
        );
    }

    /**
     * Returns a matching element from the elements array by a given id
     * @param id string
     * @returns Element
     */
    public getElementById(id: string): Element {
        return this.elements.find((element) => element.id === id);
    }
}
