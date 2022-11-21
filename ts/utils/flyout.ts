import CaptureElement from "Shared/ts/utils/capture-element";
import Disclosure from "Shared/ts/utils/disclosure";
import FocusNavigator from "Shared/ts/utils/focus-navigator";

interface IFlyoutEventManager {
    addControllerState: (event: MouseEvent) => void;
    removeControllerState: (event: MouseEvent) => void;
}

export default class Flyout {
    /**
     * Represents the root container of the flyout user-interface
     */
    public root: HTMLElement;

    /**
     * Represents the content container that can accept a CSS transition to control the visibility phase
     */
    public content: HTMLElement | null;

    /**
     * Represents a repository assigning a new instance of the `FocusNavigator` class to the root container of the flyout user-interface
     */
    private static focusNavigatorRepository: WeakMap<Element, FocusNavigator> =
        new WeakMap<Element, FocusNavigator>();

    private static disclosureMap: Map<Flyout, Disclosure> = new Map<
        Flyout,
        Disclosure
    >();

    /**
     * Represents a repository managing event-based methods that are associated with the `Flyout` instance
     */
    private static eventManager: WeakMap<Flyout, IFlyoutEventManager> =
        new WeakMap<Flyout, IFlyoutEventManager>();

    /**
     * Represents the CSS class namespace used for styling-hooks
     */
    private namespace: string;

    /**
     * Applies the link + disclosure pattern to a user-interface where a controller can toggle an element containing a list of focusable content that can be navigated using keys such as the arrow keys, can be dismissed with the `escape` key, etc.
     * @param root HTMLElement
     * @param namespace string
     */
    constructor(root: HTMLElement, namespace?: string) {
        this.namespace = namespace ?? "flyout";

        this.root = root ?? document.querySelector(`.${this.namespace}`);

        this.content = this.root.querySelector(`.${this.namespace}__content`);

        Flyout.initializeDisclosure(this);
        Flyout.manageContextEvents(this);
        Flyout.captureContextRoot(this);
    }

    public on(): void {
        const disclosure = Flyout.disclosureMap.get(this);
        if (!disclosure) return;

        const focusNavigator = Flyout.focusNavigatorRepository.get(this.root);
        if (!focusNavigator) return;

        const controller = focusNavigator.firstElement();
        if (!controller) return;

        disclosure.addControllerState(controller);
    }

    public off(): void {
        const disclosure = Flyout.disclosureMap.get(this);
        if (!disclosure) return;

        const focusNavigator = Flyout.focusNavigatorRepository.get(this.root);
        if (!focusNavigator) return;

        const controller = focusNavigator.firstElement();
        if (!controller) return;

        disclosure.removeControllerState(controller);
    }

    /**
     * Handles dismissing the user-interface on the `escape` key and intercepting the CSS transition on the content container to assign the `disabled` state on the user-interface
     * @param context Flyout
     * @param disclosure Disclosure
     */
    private static initializeVisibilityState(
        context: Flyout,
        disclosure: Disclosure
    ): void {
        const focusNavigator = this.focusNavigatorRepository.get(context.root);
        if (!focusNavigator) return;

        Flyout.eventManager.set(context, {
            addControllerState: (event: MouseEvent) => {
                const controller = focusNavigator.firstElement();
                if (!controller) return;

                this.manageDisclosureMap(disclosure);

                disclosure.addControllerState(controller);

                controller.focus();
            },
            removeControllerState: (event: MouseEvent) => {
                const controller = focusNavigator.firstElement();
                if (!controller) return;

                this.manageDisclosureMap(disclosure);

                disclosure.removeControllerState(controller);
            }
        });

        addEventListener("keydown", (event) => {
            const controller = focusNavigator.firstElement();
            if (!controller) return;

            const key = event.key?.toLowerCase();

            if (
                (key === "escape" || key === "esc") &&
                context.root.contains(event.target as HTMLElement)
            ) {
                disclosure.removeControllerState(controller);

                controller.focus();
            }
        });

        if (!context.content) return;

        context.content.addEventListener(
            "transitionend",
            (event: TransitionEventInit) => {
                disclosure.controllers.forEach((controller) => {
                    if (!disclosure.isControllerExpanded(controller)) {
                        context.root.classList.add(
                            `${context.namespace}--is-disabled`
                        );
                    }
                });
            }
        );
    }

    /**
     * Captures the root HTML element of the flyout and observes changes to the `data-flyout-allow-hover` attribute to either add or remove the event handlers responsible for toggling the flyout controllers
     * @param context Flyout
     * @returns void
     */
    private static captureContextRoot(context: Flyout): void {
        const captureElement = new CaptureElement(context.root);

        captureElement.subscribe("attributes", (record) => {
            if (record.attributeName !== "data-flyout-allow-hover") return;

            this.manageContextEvents(context);
        });
    }

    /**
     * Adds or removes the event handlers responsible for toggling the flyout controllers based on the `data-flyout-allow-hover` attribute
     * @param context Flyout
     * @returns void
     */
    private static manageContextEvents(context: Flyout): void {
        const event = this.eventManager.get(context);
        if (!event) return;

        switch (context.root.hasAttribute("data-flyout-allow-hover")) {
            case true:
                context.root.addEventListener(
                    "mouseover",
                    event.addControllerState
                );
                context.root.addEventListener(
                    "mouseleave",
                    event.removeControllerState
                );

                break;
            case false:
                context.root.removeEventListener(
                    "mouseover",
                    event.addControllerState
                );
                context.root.removeEventListener(
                    "mouseleave",
                    event.removeControllerState
                );

                break;
        }
    }

    /**
     * Creates a new `Disclosure` instance and initializes several events through each available controller
     * @param context Flyout
     */
    private static initializeDisclosure(context: Flyout): void {
        const disclosure = new Disclosure(context.root);

        this.disclosureMap.set(context, disclosure);

        disclosure.controllers.forEach((controller) => {
            this.setElementEventsByController(context, controller, disclosure);

            this.initializeEventListeners(
                controller as HTMLElement,
                disclosure
            );

            this.initializeControllerCapture(context, controller, disclosure);

            this.initializeFocusNavigation(context);
        });

        this.initializeVisibilityState(context, disclosure);
    }

    /**
     * Assigns a new `FocusNavigator` instance to the root container
     * @param context Flyout
     */
    private static initializeFocusNavigation(context: Flyout): void {
        this.focusNavigatorRepository.set(
            context.root,
            new FocusNavigator(context.root)
        );
    }

    /**
     * Allows the controller to toggle the container's visibility state with the `click` event
     * @param controller HTMLElement
     * @param disclosure Disclosure
     */
    private static initializeEventListeners(
        controller: HTMLElement,
        disclosure: Disclosure
    ): void {
        controller.addEventListener("click", (event) => {
            this.manageDisclosureMap(disclosure);

            disclosure.toggleElementsByController(controller);
        });
    }

    /**
     * Manages the state of all available `Disclosure` references in order to remove the controller states from all except the current `Disclosure` instance.
     * @param disclosure Disclosure
     */
    private static manageDisclosureMap(disclosure: Disclosure): void {
        this.disclosureMap.forEach((reference) => {
            if (reference === disclosure) return;

            reference.controllers.forEach((controller) => {
                reference.removeControllerState(controller);
            });
        });
    }

    /**
     * Captures the controller element for the `aria-expanded` attribute change and processes the element events based on the controller's expanded state
     * @param context Flyout
     * @param controller HTMLElement
     * @param disclosure Disclosure
     */
    private static initializeControllerCapture(
        context: Flyout,
        controller: Element,
        disclosure: Disclosure
    ): void {
        const captureController = new CaptureElement(controller);

        captureController.subscribe("attributes", (record) => {
            if (record.attributeName !== "aria-expanded") return;

            this.setElementEventsByController(context, controller, disclosure);
        });
    }

    /**
     * Controls the focus navigation and visibility of the container based on the controller's expanded state
     * @param context Flyout
     * @param controller Element
     * @param disclosure Disclosure
     */
    private static setElementEventsByController(
        context: Flyout,
        controller: Element,
        disclosure: Disclosure
    ): void {
        const isExpanded = disclosure.isControllerExpanded(controller);
        const focusNavigator = this.focusNavigatorRepository.get(context.root);

        if (focusNavigator) {
            focusNavigator.updateElements();

            isExpanded ? focusNavigator.on() : focusNavigator.off();
        }

        if (isExpanded) {
            context.root.classList.remove(`${context.namespace}--is-disabled`);
        }

        if (!context.content && !isExpanded) {
            context.root.classList.add(`${context.namespace}--is-disabled`);
        }

        isExpanded
            ? context.root.classList.remove(`${context.namespace}--is-hidden`)
            : context.root.classList.add(`${context.namespace}--is-hidden`);
    }
}
