import CaptureElement from "Shared/ts/utils/capture-element";

export default class ElementController {
    /**
     * Represents the root that will contain all elements and controllers as descedent elements
     */
    public root: Element | null | undefined;

    /**
     * Represents an array of controller elements where each controller is responsible for managing the state of the elements through the `aria-controls` attribute
     */
    public controllers: Element[] = [];

    /**
     * Represents an array of elements where each element can be controlled by a controller element through the `id` attribute
     */
    public elements: (Element | undefined | null)[];

    /**
     * Enables the ability for controller elements that are equipped with the `aria-controls` attribute to control the state of other elements by a reference to it's `id` attribute.
     * @param root Element | null | undefined
     */
    constructor(root?: Element | null | undefined) {
        this.root = root ?? document.querySelector(".element-controller");

        if (!this.root?.classList.contains("element-controller")) {
            this.root?.classList.add("element-controller");
        }

        if (this.root) {
            this.controllers = Array.from(
                this.root.querySelectorAll("[aria-controls]")
            ).filter(
                (controller) =>
                    controller.closest(".element-controller") === this.root
            );
        }

        this.elements = [];

        ElementController.initialize(this);
    }

    /**
     * Initializes the process
     * @param context ElementController
     */
    private static initialize(context: ElementController): void {
        this.setElementsByContext(context);

        if (context.root) {
            const captureElement = new CaptureElement(context.root);

            captureElement.subscribe("attributes", (record) => {
                if (record.attributeName === "aria-controls") {
                    this.setElementsByContext(context);
                }

                const controller = context.controllers.find(
                    (controller) => controller === record.target
                );
                if (!controller) return;

                if (
                    record.attributeName ===
                    ElementController.getControllerExpandedAttribute(controller)
                ) {
                    context.initializeController(context, controller);
                }
            });
        }

        this.initializeControllers(context);
    }

    /**
     * Initializes all controllers
     * @param context ElementController
     */
    protected static initializeControllers(context: ElementController): void {
        context.controllers.forEach((controller) => {
            context.initializeController(context, controller);

            context.isControllerExpanded(controller)
                ? context.addControllerState(controller)
                : context.removeControllerState(controller);
        });
    }

    /**
     * Initializes a controller
     * @param context ElementController
     * @param controller Element
     */
    protected initializeController(
        context: ElementController,
        controller: Element
    ): void {
        const relatedElements =
            context.getRelatedElementsByController(controller);
        const unrelatedElements =
            context.getUnrelatedElementsByController(controller);

        const isExpanded = context.isControllerExpanded(controller);

        if (isExpanded) {
            ElementController.updateControllerStatesByContext(
                context,
                controller
            );
            ElementController.addElementStateByElements(
                relatedElements,
                controller
            );

            ElementController.removeElementStateByElements(unrelatedElements);
        }
    }

    /**
     * Iterates through an array of elements and assigns the controller `id` as a value to the `data-element-controller-name` attribute, then sets the `aria-hidden` attribute to `false`
     * @param elements (Element | undefined | null)[]
     * @param controller Element
     */
    protected static addElementStateByElements(
        elements: (Element | undefined | null)[],
        controller: Element
    ): void {
        elements.forEach((element) => {
            element?.setAttribute(
                "data-element-controller-name",
                controller.id
            );
            element?.setAttribute("aria-hidden", "false");
        });
    }

    /**
     * Takes the controller and sets the `aria-expanded` attribute to `true`
     * @param controller Element
     */
    public addControllerState(controller: Element): void {
        controller.setAttribute(
            ElementController.getControllerExpandedAttribute(controller),
            "true"
        );
    }

    /**
     * Takes the controller and sets the `aria-expanded` attribute to `false`
     * @param controller Element
     */
    public removeControllerState(controller: Element): void {
        controller.setAttribute(
            ElementController.getControllerExpandedAttribute(controller),
            "false"
        );
    }

    private static getControllerExpandedAttribute(controller: Element): string {
        return ElementController.isControllerRoleCheckboxOrRadio(controller)
            ? "aria-checked"
            : "aria-expanded";
    }

    private static isControllerRoleCheckboxOrRadio(
        controller: Element
    ): boolean {
        const isInput = controller.nodeName.toLowerCase() === "input";
        const type = (controller.getAttribute("type") ?? "").toLowerCase();

        return isInput && (type === "checkbox" || type === "radio");
    }

    /**
     * Iterates through an array of elements and removes the `data-element-controller-name` attribute and sets the `aria-hidden` attribute to `true`
     * @param elements (Element | undefined | null)[]
     */
    protected static removeElementStateByElements(
        elements: (Element | undefined | null)[]
    ): void {
        elements.forEach((element) => {
            element?.removeAttribute("data-element-controller-name");
            element?.setAttribute("aria-hidden", "true");
        });
    }

    /**
     * Iterates through all controllers and attempts to capture and store all matching elements that can be controlled
     * @param context ElementController
     */
    private static setElementsByContext(context: ElementController) {
        context.controllers.forEach((controller) => {
            const elements = this.getContainersByControllerIds(
                context.getIdsByController(controller),
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
    ): (Element | undefined | null)[] {
        const filterIds = ids.filter((id) => id !== "");

        return Array.from(filterIds, (id) => {
            const element =
                context.getElementById(id) ??
                context.root?.querySelector(`#${id}`);

            if (!element) {
                console.error({
                    message: `The element id, ${id}, referenced within the current controller could not be found in the document.`,
                    controller
                });
            }

            return element;
        });
    }

    /**
     * Filters out all controllers from the controller context and sets the `aria-expanded` state to `false`.
     * @param context ElementController
     * @param controllerContext Element
     */
    protected static updateControllerStatesByContext(
        context: ElementController,
        controllerContext: Element
    ): void {
        context.controllers
            .filter((controller) => controller !== controllerContext)
            .forEach((controller) =>
                controller.setAttribute(
                    this.getControllerExpandedAttribute(controller),
                    "false"
                )
            );
    }

    /**
     * Determines if the controller is expanded through the `aria-expanded` attribute
     * @param controller Element
     * @returns boolean
     */
    public isControllerExpanded(controller: Element): boolean {
        return (
            controller.getAttribute(
                ElementController.getControllerExpandedAttribute(controller)
            ) === "true"
        );
    }

    /**
     * Returns a new array of elements that are related to the id list referenced by the controller
     * @param controller Element
     * @returns (Element | undefined | null)[]
     */
    public getRelatedElementsByController(
        controller: Element
    ): (Element | undefined | null)[] {
        const ids = this.getIdsByController(controller);

        return this.elements.filter((element) =>
            ids.includes(element?.id ?? "")
        );
    }

    /**
     * Returns a new array of elements that aren't related to the id list referenced by the controller
     * @param controller Element
     * @returns (Element | undefined | null)[]
     */
    public getUnrelatedElementsByController(
        controller: Element
    ): (Element | undefined | null)[] {
        const ids = this.getIdsByController(controller);

        return this.elements.filter(
            (element) => !ids.includes(element?.id ?? "")
        );
    }

    /**
     * Takes a controller element and returns a string array of all id references
     * @param controller Element
     * @returns string[]
     */
    public getIdsByController(controller: Element): string[] {
        return (controller.getAttribute("aria-controls") ?? "").split(" ");
    }

    /**
     * Returns a matching element from the elements array by a given id
     * @param id string
     * @returns Element
     */
    public getElementById(id: string): Element | undefined | null {
        return this.elements.find((element) => element?.id === id);
    }

    /**
     * Takes a controller element, adds the controller state and updates the elements on the view
     * @param controller Element
     */
    public toggleElementsByController(controller: Element): void {
        this.addControllerState(controller);
    }
}
