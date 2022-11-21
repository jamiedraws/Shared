import ElementController from "Shared/ts/utils/element-controller";
import { renderTemplate } from "Shared/ts/utils/html";
import { getSettingByCode } from "../campaign-manager/settings-manager";

export default class ExpressCheckout {
    /**
     * Represents the root element
     */
    public root: HTMLElement | null | undefined;

    /**
     * Represents an array of elements that are associated with a controller
     */
    public elements: Element[] = [];

    /**
     * Represents an array of elements containing the `orderType` radio
     */
    public checkoutOptions: Element[] = [];

    /**
     * Represents an array of controller elements
     */
    public controllers: HTMLInputElement[] = [];

    /**
     * Represents an instance of the `ExpressCheckout` interface
     */
    public get elementController() {
        return ExpressCheckout.elementController.get(this);
    }

    /**
     * Represents a key-value pair between a controller element and a string array of element ids
     */
    private static controllerRepository: WeakMap<Element, string[]> =
        new WeakMap();

    /**
     * Represents a key-value pair between an `ExpressCheckout` instance and an `ElementController` instance
     */
    private static elementController: WeakMap<
        ExpressCheckout,
        ElementController
    > = new WeakMap();

    /**
     * Utilizes `ElementController` to toggle elements based on a certain `orderType` value. Controller elements are mapped to a radio group containing the `orderType` id.
     * @param root HTMLElement
     */
    constructor(root?: HTMLElement) {
        this.root = root ?? document.querySelector("form");

        if (this.root) {
            this.root.classList.add("element-controller");
            this.root.classList.add("express-checkout");

            this.elements = Array.from(
                this.root.querySelectorAll("[data-express-checkout-order-type]")
            );

            this.checkoutOptions = Array.from(
                this.root.querySelectorAll(".checkout-option")
            );

            this.controllers = Array.from(
                this.root.querySelectorAll('[name="OrderType"]')
            );
        }

        ExpressCheckout.initialize(this);
    }

    /**
     * Iterates through controllers and assigns a new array, iterates through elements and adds the `orderType` to the appropriate controller, iterates through controllers and updates the `aria-controls` attribute based on the element id list.
     * @param context ExpressCheckout
     */
    private static initialize(context: ExpressCheckout): void {
        context.controllers.forEach((controller) => {
            this.controllerRepository.set(controller, []);
        });

        context.elements.forEach((element) => {
            context.addOrderTypeToControllerByElement(element);
        });

        context.controllers.forEach((controller) => {
            context.updateControllerByOrderType(controller.id);
        });

        context.checkoutOptions.forEach((checkoutOption) => {
            this.addRadioGUIByCheckoutOption(checkoutOption);
        });

        this.processElementControllerByContext(context);
    }

    /**
     * Creates a new instance of the `ElementController` and assigns the click event to update the element states by the active controller.
     * @param context ExpressCheckout
     */
    private static processElementControllerByContext(
        context: ExpressCheckout
    ): void {
        const elementController = new ElementController(context.root);

        elementController.controllers.forEach((controller) => {
            controller.addEventListener("click", () => {
                elementController.toggleElementsByController(controller);
            });
        });

        elementController.controllers
            .filter((controller) => controller.getAttribute("checked"))
            .forEach((controller) => {
                elementController.toggleElementsByController(controller);
            });

        this.elementController.set(context, elementController);
    }

    /**
     * Takes the `orderType` and the `elementId` and adds it to the element Id list repository.
     * @param orderType string
     * @param elementId string
     * @returns void
     */
    public addElementIdByOrderType(orderType: string, elementId: string): void {
        const controller = this.getControllerByOrderType(orderType);
        if (!controller) return;

        const elementIds = this.getElementIdListByOrderType(orderType);
        if (!elementIds) return;

        elementIds.push(elementId);

        ExpressCheckout.controllerRepository.set(controller, elementIds);
    }

    /**
     * Takes an element and extracts the `OrderType` from the `data-express-checkout-order-type` attribute along with the element's id and assigns it to the appropriate controller.
     * @param element Element
     * @returns void
     */
    public addOrderTypeToControllerByElement(element: Element): void {
        const orderType = element.getAttribute(
            "data-express-checkout-order-type"
        );

        if (!orderType) {
            console.error({
                message: `The '[data-express-checkout-order-type] attribute is required on the element`,
                element
            });

            return;
        }

        if (element.id === "") {
            console.error({
                message: `The 'id' is requied on the element`,
                element
            });

            return;
        }

        element.classList.add("express-checkout__element");

        orderType
            .split(" ")
            .forEach((ot) => this.addElementIdByOrderType(ot, element.id));
    }

    /**
     * Takes an `orderType` and returns the controller based on a match between the `orderType` and the controller id. Otherwise, undefined is returned.
     * @param orderType string
     * @returns HTMLInputElement | undefined
     */
    public getControllerByOrderType(
        orderType: string
    ): HTMLInputElement | undefined {
        return this.controllers.find((controller) =>
            controller.id.match(new RegExp(orderType, "gi"))
        );
    }

    /**
     * Takes an `orderType` and returns the element id list associated with the controller. Otherwise, undefined is returned.
     * @param orderType string
     * @returns string[] | undefined
     */
    public getElementIdListByOrderType(
        orderType: string
    ): string[] | undefined {
        const controller = this.getControllerByOrderType(orderType);
        if (!controller) return;

        return this.getElementIdListByController(controller);
    }

    /**
     * Takes a controller element and returns the element id list associated with the controller. Otherwise, undefined is returned.
     * @param controller HTMLInputElement
     * @returns string[] | undefined
     */
    public getElementIdListByController(
        controller: HTMLInputElement
    ): string[] | undefined {
        return ExpressCheckout.controllerRepository.get(controller);
    }

    /**
     * Takes an `orderType` and retrieves the list of element id references and updates the appropriate controller's `aria-controls`
     * @param orderType string
     * @returns void
     */
    public updateControllerByOrderType(orderType: string): void {
        const controller = this.getControllerByOrderType(orderType);
        if (!controller) return;

        const elementIds = this.getElementIdListByController(controller);
        if (!elementIds) return;

        controller?.setAttribute("aria-controls", elementIds.join(" "));
    }

    /**
     * Using an element with the attribute `data-express-checkout-buttons`, all order types besides the card will attempt to pull for the appropriate checkout image from the campaign manager settings page and insert it into the HTML
     * @returns void
     */
    public createCheckoutButtonGUI(): void {
        const placeholder = this.root?.querySelector(
            "[data-express-checkout-buttons]"
        );
        if (!placeholder) return;

        const orderTypes = this.controllers
            .filter((controller) => controller.id !== "otCARD")
            .map((controller) => controller.id);

        orderTypes.forEach((orderType) => {
            const code = orderType.replace(/^ot/, "");

            getSettingByCode(`${code}.AcceptOfferButtonDownImageUrl`).then(
                (value) => {
                    placeholder.insertAdjacentHTML(
                        "beforeend",
                        `<span id="AcceptOffer${code}" data-express-checkout-order-type="${orderType}">
                            <img src="${value}" loading="lazy">
                        </span>`
                    );

                    const element = this.root?.querySelector(
                        `#AcceptOffer${code}`
                    );
                    if (!element) return;

                    this.addOrderTypeToControllerByElement(element);
                    this.updateControllerByOrderType(orderType);
                }
            );
        });
    }

    /**
     * Returns a new HTMLSpanElement with the `express-checkout__radio` class.
     * @returns HTMLSpanElement
     */
    private static createRadioGUI(): HTMLSpanElement {
        const radio = document.createElement("span");
        radio.classList.add("express-checkout__radio");

        return radio;
    }

    /**
     * Takes a `checkoutOption` element and adds an HTMLSpanElement representing the radio GUI to it.
     * @param checkoutOption Element
     */
    private static addRadioGUIByCheckoutOption(checkoutOption: Element): void {
        const radio = this.createRadioGUI();
        const label = checkoutOption.querySelector("label");

        checkoutOption.classList.add("express-checkout__checkout-option");

        label?.classList.add("express-checkout__label");
        label?.insertAdjacentElement("afterbegin", radio);
    }
}
