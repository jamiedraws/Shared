import IModalConfig from "shared/ts/interfaces/modal";
import { IModalHTMLTemplate } from "shared/ts/interfaces/modal";
import FocusTrap from "shared/ts/utils/focus-trap";
import enableInertSupport from "../utils/inert";
import {
    setElementAttributes,
    createElement,
    enumerateElements,
    elementExists
} from "shared/ts/utils/html";

enableInertSupport();

export default class Modal {
    /**
     * Represents the key-value relationship between a string (representing the root element id) and it's associated Modal instance.
     */
    protected static context: Map<string, Modal> = new Map();

    /**
     * Represents the key-value relationship between a Modal instance and it's associated actor element.
     */
    protected static actor: WeakMap<Modal, HTMLElement> = new WeakMap();

    /**
     * Represents the key-value relationship between a Modal instance and it's associated root element.
     */
    protected static root: WeakMap<Modal, HTMLElement> = new WeakMap();

    /**
     * Represents the key-value relationship between a Modal instance and it's associated HTML template.
     */
    protected static template: WeakMap<Modal, IModalHTMLTemplate> =
        new WeakMap();

    /**
     * Represents the key-value relationship between a Modal instance and a FocusTrap instance.
     */
    protected static focus: WeakMap<Modal, FocusTrap> = new WeakMap();

    /**
     * Represents the body element.
     */
    private static body: HTMLElement = document.body;

    /**
     * Represents status whether the click event listener on the body element has already been registered.
     */
    private static eventListenerStatus: boolean = false;

    /**
     * Represents status whether there are any open modals on the screen.
     */
    private static anyOpenModalsStatus: boolean = false;

    /**
     * Allows an HTMLElement to operate as a modal dialog. Buttons equipped with the data-modal-dialog-id="{RootId}" and data-modal-dialog-actor="{open|close}" attributes will be able to communicate with the modal and control it's visibility state. Programmatic communication with the modal is also accessible through the open and close methods.
     * @param root HTMLElement
     */
    constructor(
        root: HTMLElement = document.getElementById("#modal"),
        userConfig?: IModalConfig
    ) {
        if (elementExists(root) && Modal.isRootChildOfBody(root)) {
            const config = userConfig ?? {};
            const template = Modal.createHTMLTemplate(root, config);

            Modal.template.set(this, template);
            Modal.root.set(this, template.container);
            Modal.focus.set(this, new FocusTrap(template.stage));
            Modal.context.set(config.id ?? root.id, this);

            Modal.processAriaAttributes(template.container, config);
            Modal.manageModalEvents(this);
        }
    }

    /**
     * Determines if the root is a direct child of the document body. This relationship is required for a modal to operate appropriately as to ensure all of the other children in the document body are inert when a modal is active.
     * @param root HTMLElement
     * @returns boolean
     */
    private static isRootChildOfBody(root: HTMLElement): boolean {
        const result = root.parentElement === this.body;

        if (!result) {
            console.error(
                `A modal must be a direct child of the document body. Aborting support for this element.`,
                {
                    root
                }
            );
        }

        return result;
    }

    /**
     * Iterates through the body element's children and determines if all obscure elements will be inert.
     */
    private static manageInertState(): void {
        const children = enumerateElements(this.body.children);

        if (this.anyOpenModalsStatus) {
            children
                .filter((child) =>
                    child.classList.contains("modal-dialog--is-active")
                )
                .forEach(this.removeInertState);
            children
                .filter(
                    (child) =>
                        !child.classList.contains("modal-dialog--is-active")
                )
                .forEach(this.addInertState);
        } else {
            children.forEach(this.removeInertState);
        }
    }

    /**
     * Iterates through the body element's children and removes the inert attribute.
     * @param children Element
     */
    private static removeInertState(child: Element): void {
        child.removeAttribute("inert");
        child.removeAttribute("aria-hidden");

        const actors = enumerateElements(
            child.querySelectorAll("[data-modal-dialog-actor]")
        );
        actors.forEach((actor) => actor.removeAttribute("disabled"));
    }

    /**
     * Iterates through the body element's children and adds the inert attribute.
     * @param children Element
     */
    private static addInertState(child: Element): void {
        child.setAttribute("inert", "true");
        child.setAttribute("aria-hidden", "true");

        const actors = enumerateElements(
            child.querySelectorAll("[data-modal-dialog-actor]")
        );
        actors.forEach((actor) => actor.setAttribute("disabled", "true"));
    }

    /**
     * Creates a new HTMLElement container that provides appropriate accessibility attributes and CSS class identifiers.
     * @returns HTMLElement
     */
    private static createContainer(
        id: string,
        role: string = "dialog"
    ): HTMLElement {
        return createElement("div", {
            role: role,
            hidden: "hidden",
            tabindex: "-1",
            "aria-modal": "true",
            "data-modal-dialog-parent-id": id,
            class: "modal-dialog modal-dialog--container modal-dialog--is-hidden"
        });
    }

    /**
     * Creates a new HTMLElement backdrop that provides appropriate accessibility attributes and CSS class identifiers.
     * @returns HTMLElement
     */
    private static createBackdrop(id: string): HTMLElement {
        return this.registerCloseAttributes(
            createElement("div", {
                role: "presentation",
                class: "modal-dialog__backdrop",
                "aria-hidden": "true"
            }),
            id
        );
    }

    /**
     * Takes an HTMLElement and provides essential attributes to enable the element to close a modal.
     * @param element HTMLElement
     * @param id string
     * @returns HTMLElement
     */
    private static registerCloseAttributes(
        element: HTMLElement,
        id: string
    ): HTMLElement {
        return setElementAttributes(element, {
            "data-modal-dialog-actor": "close",
            "data-modal-dialog-id": id,
            "aria-label": "Close dialog"
        });
    }

    /**
     * Creates an HTMLElement button and provides appropriate accessibility attributes and CSS class identifiers.
     * @param id string
     * @returns HTMLElement
     */
    private static createCloseButton(id: string): HTMLElement {
        return this.registerCloseAttributes(
            createElement("button", {
                type: "button",
                class: "modal-dialog__close"
            }),
            id
        );
    }

    /**
     * Creates an element to represent the modal dialog stage.
     * @returns HTMLElement
     */
    private static createStage(): HTMLElement {
        return createElement("div", {
            // role: "document",
            class: "modal-dialog__stage"
        });
    }

    private static createContent(): HTMLElement {
        return createElement("div", {
            class: "modal-dialog__content"
        });
    }

    private static createViewport(): HTMLElement {
        return createElement("div", {
            class: "modal-dialog__viewport"
        });
    }

    /**
     * Takes the root element and encloses it within a new container element that is equipped with appropriate accessibility attributes and CSS class identifiers.
     * @param root HTMLElement
     * @returns HTMLElement
     */
    private static createHTMLTemplate(
        root: HTMLElement,
        config: IModalConfig
    ): IModalHTMLTemplate {
        const id = config.id ?? root.id;
        const container = this.createContainer(id, config.role);
        const viewport = this.createViewport();
        const content = this.createContent();
        const stage = this.createStage();
        const backdrop = this.createBackdrop(id);
        const closeButton = this.createCloseButton(id);

        root.insertAdjacentElement("afterend", container);

        container.insertAdjacentElement("beforeend", backdrop);
        container.insertAdjacentElement("afterbegin", viewport);

        viewport.insertAdjacentElement("afterbegin", stage);

        stage.insertAdjacentElement("beforeend", closeButton);
        stage.insertAdjacentElement("afterbegin", content);

        content.insertAdjacentElement("beforeend", root);

        return { container, viewport, content, stage, backdrop, closeButton };
    }

    /**
     * Determines if user-provided ARIA attributes are referencing elements within the modal's scope. An error message will be reported for any mismatches between the reference and the element.
     * @param container HTMLElement
     * @param config IModalConfig
     */
    private static processAriaAttributes(
        container: HTMLElement,
        config: IModalConfig
    ): void {
        if (config.ariaLabelledBy) {
            this.connectAriaReferenceToElementId(
                container,
                "aria-labelledby",
                config.ariaLabelledBy
            );
        }

        if (config.ariaDescribedBy) {
            this.connectAriaReferenceToElementId(
                container,
                "aria-describedby",
                config.ariaDescribedBy
            );
        }

        if (config.ariaLabel) {
            container.setAttribute("aria-label", config.ariaLabel);
        }

        if (!config.ariaLabel && !config.ariaLabelledBy) {
            console.error(`There is no label for this modal.`, {
                container
            });
        }
    }

    /**
     * Determines if an element representing the ARIA value exists in the document. If an element exists, the container will reference the element via ARIA attribute; otherwise, an error will be reported of the disconnect.
     * @param container HTMLElement
     * @param attribute string
     * @param value string
     */
    private static connectAriaReferenceToElementId(
        container: HTMLElement,
        attribute: string,
        value: string
    ): void {
        if (elementExists(container.querySelector(`#${value}`))) {
            container.setAttribute(attribute, value);
        } else {
            console.error(
                `There is no element id that matches ${attribute} value ${value}.`,
                { container }
            );
        }
    }

    /**
     * Makes the modal dialog visible on screen by removing the "modal-dialog--is-hidden" class.
     * @param root HTMLElement
     */
    private static makeRootVisible(root: HTMLElement): void {
        root.classList.remove("modal-dialog--is-hidden");
        root.removeAttribute("hidden");
    }

    /**
     * Makes the modal dialog invisible on screen by adding the "modal-dialog--is-hidden" class.
     * @param root HTMLElement
     */
    private static makeRootInvisible(root: HTMLElement): void {
        root.classList.add("modal-dialog--is-hidden");
        root.setAttribute("hidden", "hidden");
    }

    /**
     * Determines if the modal dialog is visible through the "modal-dialog--is-hidden" class.
     * @param root HTMLElement
     * @returns boolean
     */
    private static isRootVisible(root: HTMLElement): boolean {
        return !root.classList.contains("modal-dialog--is-hidden");
    }

    /**
     * Takes an actor element and extracts the value from the "data-modal-dialog-actor" attribute.
     * @param actor HTMLElement
     * @returns string
     */
    private static getActionByActor(actor: HTMLElement): string {
        return (
            actor.getAttribute("data-modal-dialog-actor") ?? ""
        ).toLowerCase();
    }

    /**
     * Captures the element that contains the ".modal-dialog--is-active" class and retrieves the Modal instance that is associated with the modal dialog element.
     * @returns Modal
     */
    private static getContextByActiveRoot(): Modal {
        const root = document.querySelector(
            ".modal-dialog--is-active"
        ) as HTMLElement;

        return this.getContextByActorParentId(root);
    }

    /**
     * Takes an actor element as the keyword to retrieve its associated Modal instance.
     * @param actor HTMLElement
     * @returns Modal
     */
    private static getContextByActorId(actor: HTMLElement): Modal {
        return this.context.get(
            actor.getAttribute("data-modal-dialog-id") ?? ""
        );
    }

    /**
     * Takes an actor element as the keyword to retrieve its associated Modal instance.
     * @param actor HTMLElement
     * @returns Modal
     */
    private static getContextByActorParentId(actor: HTMLElement): Modal {
        return this.context.get(
            actor.getAttribute("data-modal-dialog-parent-id") ?? ""
        );
    }

    /**
     * Takes an actor element to retrieve its associated Modal instance, opens the modal and sets focus to the first focusable element within that modal.
     * @param actor HTMLElement
     */
    private static handleOpenEvent(actor: HTMLElement) {
        const context = this.getContextByActorId(actor);

        this.handleOpenState(context, actor);
    }

    /**
     * Takes an actor element to retrieve its associated Modal instance, retrieves the actor that opened the modal, closes the modal, and sets focus back to the actor that opened the modal.
     * @param actor HTMLElement
     */
    private static handleCloseEvent(actor: HTMLElement) {
        const context = this.getContextByActorId(actor);

        this.handleCloseState(context);
    }

    /**
     * Closes the active modal dialog when the captured key command satifies the required keyboard name.
     * @param key string
     * @param event KeyboardEvent
     */
    private static handleCloseEventByKey(
        key: string,
        event: KeyboardEvent
    ): void {
        if (event.key.toLowerCase() === key.toLowerCase()) {
            const context = this.getContextByActiveRoot();
            this.handleCloseState(context);
        }
    }

    /**
     * Adds a click event listener on the body element to capture actor elements, process the action from that actor element and channel the actor into either the open event or close event. Adds keyup event listeners to capture the "escape" key and triggers the close event.
     */
    private static setGlobalEvents() {
        this.body.addEventListener("click", (event) => {
            const actor = event.target as HTMLElement;
            const action = Modal.getActionByActor(actor);

            switch (action) {
                case "open":
                    Modal.handleOpenEvent(actor);
                    break;
                case "close":
                    Modal.handleCloseEvent(actor);
                    break;
            }
        });

        addEventListener(
            "keyup",
            this.handleCloseEventByKey.bind(this, "escape")
        );
        addEventListener("keyup", this.handleCloseEventByKey.bind(this, "esc"));
    }

    /**
     * Adds a blur event to the modal dialog assigning the first focusable element as the next focusable element. Adds a click event to the modal dialog stage area to determine if pointer-device targets the backdrop area and will close the modal if true.
     * @param context Modal
     */
    private static setInstanceEvents(context: Modal) {
        const template = this.template.get(context);
        const root = this.root.get(context);
        const focus = this.focus.get(context);
        const firstElement = focus.firstElement() as HTMLElement;

        root.addEventListener("click", (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const stage = target.closest(".modal-dialog__stage");

            if (stage !== template.stage) {
                Modal.handleCloseState(context);
            }
        });

        root.addEventListener("blur", (event: FocusEvent) => {
            firstElement.focus();
        });
    }

    /**
     * Manages both global events and Modal instance events.
     * @param context Modal
     */
    private static manageModalEvents(context: Modal): void {
        this.setInstanceEvents(context);

        if (!this.eventListenerStatus) {
            this.eventListenerStatus = true;
            this.setGlobalEvents();
        }
    }

    /**
     * Takes a Modal instance to retrieve the root element, activates the modal on screen, sets focus to the first focusable element.
     * @param context Modal
     */
    private static handleOpenState(context: Modal, actor?: HTMLElement): void {
        const root = this.root.get(context);
        const focus = this.focus.get(context);

        this.makeRootVisible(root);
        this.makeActive(context);
        this.updateScrollBody();
        this.manageInertState();

        focus.on();
        this.addParentIdToActors(
            focus.focusElements,
            root.getAttribute("data-modal-dialog-parent-id")
        );

        const firstElement = focus.firstElement() as HTMLElement;

        requestAnimationFrame(() => {
            firstElement.focus();

            const openActor = actor ?? (document.activeElement as HTMLElement);
            Modal.updateOpenActor(context, openActor);
        });
    }

    /**
     * Takes a Modal instance to retrieve the root element and deactivates the modal on screen.
     * @param context Modal
     */
    private static handleCloseState(context: Modal): void {
        const root = this.root.get(context);
        const focus = this.focus.get(context);

        focus.off();

        const openActor = this.actor.get(context);

        this.makeRootInvisible(root);
        this.makeActive(this.getContextByActorParentId(openActor));

        this.updateFocusStateByActor(openActor);

        this.updateScrollBody();
        this.manageInertState();

        openActor.focus();
    }

    /**
     * Iterates through all Modal instances, determines the current Modal instance and adds the "modal-dialog--is-active" class to the modal dialog. Any other modal dialog will have the "modal-dialog--is-active" removed.
     * @param context Modal
     */
    private static makeActive(context: Modal): void {
        this.context.forEach((modal) => {
            const root = Modal.root.get(modal);
            const action = context === modal ? "add" : "remove";

            root.classList[action]("modal-dialog--is-active");
        });
    }

    /**
     * Determines if the actor communicating with a modal dialog is not related to the same modal dialog. If the condition is met, the actor is set as the open actor.
     * @param context Modal
     * @param actor HTMLElement
     */
    private static updateOpenActor(context: Modal, actor: HTMLElement): void {
        if (
            actor.getAttribute("data-modal-dialog-id") !==
            actor.getAttribute("data-modal-dialog-parent-id")
        ) {
            this.actor.set(context, actor);
        }
    }

    /**
     * Filters all focusable elements that contain the "data-modal-dialog-id" and assigns the "data-modal-dialog-parent-id" attribute to match the modal dialog id.
     * @param elements Element[]
     * @param id string
     */
    private static addParentIdToActors(elements: Element[], id: string): void {
        elements
            .filter(
                (element) =>
                    element.hasAttribute("data-modal-dialog-id") &&
                    !element.hasAttribute("data-modal-dialog-parent-id")
            )
            .forEach((element) =>
                element.setAttribute("data-modal-dialog-parent-id", id)
            );
    }

    /**
     * Takes an actor to retrieve the Modal instance. If any Modal instances are open, retrieve the FocusTrap instance and enable focus trap navigation.
     * @param actor HTMLElement
     */
    private static updateFocusStateByActor(actor: HTMLElement) {
        const context = this.getContextByActorParentId(actor);

        if (context && this.anyOpenModalsStatus) {
            const focus = this.focus.get(context);
            focus.on();
        }
    }

    /**
     * Iterates through all of the Modal instances and retrives each root element to determine if the modal dialog is visible.
     * @returns boolean
     */
    private static anyOpenModals(): boolean {
        Modal.anyOpenModalsStatus = false;

        this.context.forEach((context) => {
            const root = Modal.root.get(context);

            if (Modal.isRootVisible(root)) {
                Modal.anyOpenModalsStatus = true;
            }
        });

        return Modal.anyOpenModalsStatus;
    }

    /**
     * Applies the "modal-dialog--is-open" class to the body element to disable document scrolling when any modal is open.
     */
    private static updateScrollBody(): void {
        if (this.anyOpenModals()) {
            this.body.classList.add("modal-dialog--is-open");
        } else {
            this.body.classList.remove("modal-dialog--is-open");
        }
    }

    /**
     * Opens the modal
     */
    public open(): void {
        Modal.handleOpenState(this);
    }

    /**
     * Closes the modal
     */
    public close(): void {
        Modal.handleCloseState(this);
    }
}
