import { enumerateElements } from "../utils/html";

export default class Accordion {
    /**
     * Represents the root element containing both controllers and containers
     */
    public root: Element;

    /**
     * Represents an array of all button elements that would triger the container to expand/collapse
     */
    public controllers: HTMLButtonElement[];

    /**
     * Represents an array of all container elements that are controllable by controllers
     */
    public containers: HTMLElement[];

    /**
     * Accordion creates a relationship between a set of controls, referenced as "controllers", and a set of regions, referenced as "containers". Interacting with a control in the Accordion will communicate with it's related container and manage it's attributes.
     * @param root Element
     */
    constructor(root?: Element) {
        this.root = root ?? document.querySelector(".accordion");

        this.controllers = enumerateElements(
            this.root.querySelectorAll(".accordion__button")
        ) as HTMLButtonElement[];

        this.containers = enumerateElements(
            this.root.querySelectorAll(".accordion__section")
        ) as HTMLElement[];

        Accordion.initialize(this);
    }

    /**
     * Initializes the Accordion application by processing the controller events and managing the default containers
     * @param context Accordion
     */
    private static initialize(context: Accordion): void {
        this.processControllerEvents(context);
        this.defaultContainersByControllers(context);
    }

    /**
     * Filters through the controllers that either don't have the `aria-expanded` attribute or have the attribute marked as false and deactivates it's related containers.
     * @param context Accordion
     */
    private static defaultContainersByControllers(context: Accordion): void {
        context.controllers
            .filter(
                (controller) =>
                    !controller.hasAttribute("aria-expanded") ||
                    controller.getAttribute("aria-expanded") === "false"
            )
            .forEach((controller) =>
                this.deactivateContainerByController(controller, context)
            );
    }

    /**
     * Iterates the controllers and sets up event listeners for the root and the controller
     * @param context Accordion
     */
    private static processControllerEvents(context: Accordion): void {
        context.controllers.forEach((controller) => {
            Accordion.manageRootEvents(controller, context);
            Accordion.manageControllerEvents(controller, context);
        });
    }

    /**
     * Registers a `focus` event on the controller to activate the root and a `blur` event on the controller to deactivate the root
     * @param controller HTMLButtonElement
     * @param context Accordion
     */
    private static manageRootEvents(
        controller: HTMLButtonElement,
        context: Accordion
    ): void {
        controller.addEventListener(
            "focus",
            Accordion.activateRoot.bind(this, context)
        );

        controller.addEventListener(
            "blur",
            Accordion.deactivateRoot.bind(this, context)
        );
    }

    /**
     * Registers a `click` event on the controller to update it's related container and a `keydown` event on the controller to navigate through it's related controllers
     * @param controller HTMLButtonElement
     * @param context Accordion
     */
    private static manageControllerEvents(
        controller: HTMLButtonElement,
        context: Accordion
    ): void {
        controller.addEventListener(
            "click",
            context.updateContainerByController.bind(context, controller)
        );

        controller.addEventListener(
            "keydown",
            Accordion.navigateControllerEvent(controller, context)
        );
    }

    /**
     * Navigates through the controllers on keyboard commands such as: Up, Down, Home and End
     * @param controller HTMLButtonElement
     * @param context Accordion
     * @returns (event: KeyboardEvent) => void
     */
    private static navigateControllerEvent(
        controller: HTMLButtonElement,
        context: Accordion
    ) {
        return (event: KeyboardEvent) => {
            if (Accordion.isKeyup(event)) {
                event.preventDefault();
                Accordion.getPrevController(controller, context).focus();
            }

            if (Accordion.isKeydown(event)) {
                event.preventDefault();
                Accordion.getNextController(controller, context).focus();
            }

            if (event.key.match(/home/i)) {
                event.preventDefault();
                Accordion.getFirstController(context).focus();
            }

            if (event.key.match(/end/i)) {
                event.preventDefault();
                Accordion.getLastController(context).focus();
            }
        };
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
     * Returns the first controller
     * @param context Accordion
     * @returns HTMLButtonElement
     */
    private static getFirstController(context: Accordion): HTMLButtonElement {
        return context.controllers[0];
    }

    /**
     * Returns the last controller
     * @param context Accordion
     * @returns HTMLButtonElement
     */
    private static getLastController(context: Accordion): HTMLButtonElement {
        return context.controllers[context.controllers.length - 1];
    }

    /**
     * Returns the next controller in the navigation flow. If the last controller is focused, the first controller will be the next controller.
     * @param controller HTMLButtonElement
     * @param context Accordion
     * @returns HTMLButtonElement
     */
    private static getNextController(
        controller: HTMLButtonElement,
        context: Accordion
    ): HTMLButtonElement {
        const index = context.controllers.indexOf(controller) + 1;

        return index <= context.controllers.length - 1
            ? context.controllers[index]
            : this.getFirstController(context);
    }

    /**
     * Returns the previous controller in the navigation flow. If the first controller is focused, the last controller will be the previous controller.
     * @param controller HTMLButtonElement
     * @param context Accordion
     * @returns HTMLButtonElement
     */
    private static getPrevController(
        controller: HTMLButtonElement,
        context: Accordion
    ): HTMLButtonElement {
        const index = context.controllers.indexOf(controller) - 1;

        return index >= 0
            ? context.controllers[index]
            : this.getLastController(context);
    }

    /**
     * Adds the `accordion--is-focused` CSS class name to the root
     * @param context Accordion
     */
    private static activateRoot(context: Accordion): void {
        context.root.classList.add("accordion--is-focused");
    }

    /**
     * Removes the `accordion--is-focused` CSS class name from the root
     * @param context Accordion
     */
    private static deactivateRoot(context: Accordion): void {
        context.root.classList.remove("accordion--is-focused");
    }

    /**
     * Takes a potential controller and validates it along with it's related container. If valid, the controller will activate the container.
     * @param controller HTMLButtonElement
     * @param context Accordion
     */
    private static activateContainerByController(
        controller: HTMLButtonElement,
        context: Accordion
    ): void {
        if (context.isController(controller)) {
            const container = context.getContainerByController(controller);

            if (context.isContainer(container)) {
                controller.setAttribute("aria-expanded", "true");

                container.removeAttribute("hidden");

                if (!context.willToggle()) {
                    controller.setAttribute("aria-disabled", "true");
                }
            }
        }
    }

    /**
     * Takes a potential controller and validates it along with it's related container. If valid, the controller will deactivate the container.
     * @param controller HTMLButtonElement
     * @param context Accordion
     */
    private static deactivateContainerByController(
        controller: HTMLButtonElement,
        context: Accordion
    ): void {
        if (context.isController(controller)) {
            const container = context.getContainerByController(controller);

            if (context.isContainer(container)) {
                controller.setAttribute("aria-expanded", "false");

                container.setAttribute("hidden", "");

                if (!context.willToggle()) {
                    controller.removeAttribute("aria-disabled");
                }
            }
        }
    }

    /**
     * Takes an HTMLButtonElement as a controller and updates its container's visibility state. If `data-accordion-many-containers` is not set on the root HTMLElement, then only the current container will be targeted. If `data-accordion-toggle` is not set on the root HTMLElement, then only the current container will only be visible.
     * @param controller HTMLButtonElement
     */
    public updateContainerByController(controller: HTMLButtonElement): void {
        if (!this.allowManyContainers()) {
            this.getActiveControllers()
                .filter((activeController) => activeController !== controller)
                .forEach((controller) =>
                    Accordion.deactivateContainerByController(controller, this)
                );
        }

        if (!this.isControllerExpanded(controller)) {
            Accordion.activateContainerByController(controller, this);
        } else if (this.willToggle() && this.isControllerExpanded(controller)) {
            Accordion.deactivateContainerByController(controller, this);
        }
    }

    /**
     * Reports the controller's `aria-expanded` state
     * @param controller HTMLButtonElement
     * @returns boolean
     */
    public isControllerExpanded(controller: HTMLButtonElement): boolean {
        return controller.getAttribute("aria-expanded") === "true";
    }

    /**
     * Reports the controller's `aria-disabled` state
     * @param controller HTMLButtonElement
     * @returns boolean
     */
    public isControllerDisabled(controller: HTMLButtonElement): boolean {
        return controller.getAttribute("aria-disabled") === "true";
    }

    /**
     * Returns an array of active containers that are not hidden
     * @returns HTMLElement[]
     */
    public getActiveContainers(): HTMLElement[] {
        return this.containers.filter(
            (container) => !container.hasAttribute("hidden")
        );
    }

    /**
     * Returns an array of active controllers that are expanded
     * @returns HTMLButtonElement[]
     */
    public getActiveControllers(): HTMLButtonElement[] {
        return this.controllers.filter((controller) =>
            this.isControllerExpanded(controller)
        );
    }

    /**
     * Reports if `data-accordion-toggle` is set on the root HTMLElement
     * @returns boolean
     */
    public willToggle(): boolean {
        const manyContainers = this.allowManyContainers();

        return manyContainers
            ? manyContainers
            : this.root.hasAttribute("data-accordion-toggle");
    }

    /**
     * Reports if `data-accordion-many-containers` is set on the root HTMLElement
     * @returns boolean
     */
    public allowManyContainers(): boolean {
        return this.root.hasAttribute("data-accordion-many-containers");
    }

    /**
     * Returns the container that matches the controller's `aria-controls` value
     * @param controller HTMLButtonElement
     * @returns HTMLElement
     */
    public getContainerByController(
        controller: HTMLButtonElement
    ): HTMLElement {
        return this.containers.find(
            (container) =>
                container.id === controller.getAttribute("aria-controls")
        );
    }

    /**
     * Takes a potential container and validates `aria-labelledby` against all controllers. If invalid, an error will report to the browser console.
     * @param container HTMLElement
     * @returns boolean
     */
    public isContainer(container: HTMLElement): boolean {
        const result = this.controllers.some(
            (controller) =>
                controller.id === container.getAttribute("aria-labelledby")
        );

        if (!result) {
            console.error(
                `Accordion container does not contain a match between aria-labelledby and the controller id`,
                {
                    container
                }
            );
        }

        return result;
    }

    /**
     * Takes a potential controller and validates `aria-controls` against all containers. If invalid, an error will report to the browser console.
     * @param controller HTMLButtonElement
     * @returns boolean
     */
    public isController(controller: HTMLButtonElement): boolean {
        const result = this.containers.some(
            (container) =>
                container.id === controller.getAttribute("aria-controls")
        );

        if (!result) {
            console.error(
                `Accordion controller does not contain a match between aria-controls and the container id`,
                {
                    controller
                }
            );
        }

        return result;
    }
}
