import {
    ILoadItemConfig,
    ILoadItemController,
    LoadItemTask
} from "Shared/ts/interfaces/load-item";
import {
    createElement,
    elementExists,
    setElementAttributes
} from "Shared/ts/utils/html";

export default class LoadItem {
    /**
     * Represents the placeholder element
     */
    public placeholder: HTMLElement;

    /**
     * Represents the name of the HTML element
     */
    public tag: string;

    /**
     * Represents the name of the source value
     */
    public src: string | null;

    /**
     * Represents the name of the loading strategy
     */
    public onloadname: string;

    /**
     * Represents the name of the error handling strategy
     */
    public onerrorname: string;

    /**
     * Represents the key-value pair of attribute names and values that will be mapped to the current element
     */
    public attributes: {};

    /**
     * Represents the key-value pair collection of additional HTML elements and attributes
     */
    public tagsGroup: { [key: string]: any };

    /**
     * Represents the key-value pair relationship between the LoadItem instance and the controller task array
     */
    private static controller: WeakMap<LoadItem, ILoadItemController[]> =
        new WeakMap();

    /**
     * Using an existing HTML element as a placeholder container, a new HTML element can be created and customized through the config interface. The new element will be inserted into the placeholder afterwards. Depending on the network response, either a success or failure status will be assigned to the placeholder and the new element.
     * @param placeholder Element
     * @param config ILoadItemConfig
     */
    constructor(placeholder: Element, config?: ILoadItemConfig) {
        this.placeholder = placeholder as HTMLElement;

        this.tag = config?.tag ?? "img";
        this.src = placeholder.getAttribute(config?.src ?? "data-src-img");

        this.onloadname = config?.onloadname ?? "onload";
        this.onerrorname = config?.onerrorname ?? "onerror";

        this.attributes =
            JSON.parse(placeholder.getAttribute("data-attr") ?? "{}") ?? {};
        this.tagsGroup =
            JSON.parse(placeholder.getAttribute("data-tag") ?? "{}") ?? {};

        if (!LoadItem.isRendered(this)) {
            LoadItem.initalize(this);
        }
    }

    private static isRendered(context: LoadItem): boolean {
        return context.placeholder.classList.contains("load-item--success");
    }

    /**
     * Gets the current element and performs the setup work on the placeholder, the element and optionally other elements defined in the 'data-tag' attribute
     * @param context LoadItem
     */
    private static initalize(context: LoadItem): void {
        let element = this.getElement(context);

        this.processPlaceholder(context);
        this.processElement(element, context.attributes, context);
        this.processTags(context);

        this.controller.set(context, []);
    }

    /**
     * Returns the controller's task array
     * @param context LoadItem
     * @returns ILoadItemController[]
     */
    private static getController(
        context: LoadItem
    ): ILoadItemController[] | undefined {
        return this.controller.get(context);
    }

    /**
     * Determines if the current element already exists and applies additional attributes defined in the 'data-attr' attribute. Otherwise, the current element will be created along with the attributes. The current element is returned.
     * @param context LoadItem
     * @returns HTMLElement
     */
    private static getElement(context: LoadItem): HTMLElement {
        let element = this.getElementByPlaceholder(context);

        element = elementExists(element)
            ? setElementAttributes(element as HTMLElement, {
                  src: context.src,
                  class: "load-item__progress"
              })
            : this.addElement(this.preloadElement(context), context);

        return element;
    }

    /**
     * Takes the element and loads it into the document. Depending on the network response, the element is rendered on screen or error handling is applied.
     * @param element HTMLElement
     * @param attributes {}
     * @param context LoadItem
     */
    private static processElement(
        element: HTMLElement,
        attributes: {},
        context: LoadItem
    ) {
        element = setElementAttributes(element, attributes);

        this.loadElement(element, context)
            .then(() => this.renderElement(element, context))
            .catch((error) => this.handleError(element, context));
    }

    /**
     * Uses the tag property as a selector from the placeholder and returns the element.
     * @param context LoadItem
     * @returns HTMLElement
     */
    private static getElementByPlaceholder(
        context: LoadItem
    ): HTMLElement | null {
        return context.placeholder.querySelector(context.tag);
    }

    /**
     * A new element is created using the tag property along with the source property. The element is returned.
     * @param context LoadItem
     * @returns HTMLElement
     */
    private static preloadElement(context: LoadItem): HTMLElement {
        return createElement(context.tag, {
            src: context.src,
            alt: "",
            class: "load-item__progress"
        });
    }

    /**
     * Assigns the failure status to the placeholder and the element. A warning will be reported to the browser console providing the source that triggered the network response along with the HTML element that it would be applied to.
     * @param element HTMLElement
     * @param context LoadItem
     */
    private static handleError(element: HTMLElement, context: LoadItem): void {
        context.placeholder.classList.add("load-item--failure");
        element.classList.remove("load-item__progress");

        console.error("Cound not load the resource", {
            src: context.src,
            for: element
        });

        const controller = this.getController(context);

        if (controller) {
            const response = controller.find(
                (control) => control.name === "error"
            );

            response?.task();
        }
    }

    /**
     * Inserts the current element into the placeholder in the document.
     * @param element HTMLElement
     * @param context LoadItem
     * @returns HTMLElement
     */
    private static addElement(
        element: HTMLElement,
        context: LoadItem
    ): HTMLElement {
        context.placeholder.insertAdjacentElement("afterbegin", element);

        return element;
    }

    /**
     * Takes the current element and assigns the loading strategy properties to it. A promise is returned where it will resolve on a successful network response and it will reject on a failed network response.
     * @param element HTMLElement
     * @param context LoadItem
     * @returns Promise<HTMLElement>
     */
    private static loadElement(
        element: HTMLElement,
        context: LoadItem
    ): Promise<HTMLElement> {
        return new Promise<HTMLElement>((resolve, reject) => {
            element.onload = () => resolve(element);
            element.onerror = () => reject(element);
        });
    }

    /**
     * Assigns the success status on the placeholder element and the current element
     * @param element HTMLElement
     * @param context LoadItem
     */
    private static renderElement(
        element: HTMLElement,
        context: LoadItem
    ): void {
        context.placeholder.classList.add("load-item--success");
        element.classList.add("load-item__success");

        const controller = this.getController(context);

        if (controller) {
            const response = controller.find(
                (control) => control.name === "load"
            );

            response?.task(element);
        }
    }

    /**
     * Constructs a new object and pushes it into the controller's task array
     * @param name string
     * @param task LoadItemTask
     * @param context LoadItem
     */
    private static pushTask(
        name: string,
        task: LoadItemTask,
        context: LoadItem
    ): void {
        const controller = this.getController(context);

        if (controller) {
            controller.push({
                name: name,
                task: task
            });
        }
    }

    /**
     * The load-item class is assigned to the placeholder element
     * @param context LoadItem
     */
    private static processPlaceholder(context: LoadItem): void {
        context.placeholder.classList.add("load-item");
    }

    /**
     * Reads through the 'data-tag' attribute and generates new HTML elements along with attributes. Each new element will then be prepended into the placeholder element.
     * @param context LoadItem
     */
    private static processTags(context: LoadItem): void {
        Object.keys(context.tagsGroup).forEach((tags) => {
            const tag = context.tagsGroup[tags];

            tag.forEach((attributes: {}) =>
                this.processElement(
                    this.addElement(createElement(tags), context),
                    attributes,
                    context
                )
            );
        });
    }

    /**
     * Adds a new task to the queue stack to be called when the item has succeeded to load
     * @param task LoadItemTask
     * @returns LoadItem
     */
    public load(task: LoadItemTask): LoadItem {
        LoadItem.pushTask("load", task, this);

        return this;
    }

    /**
     * Adds a new task to the "error" queue stack to be called when the item has failed to load
     * @param task LoadItemTask
     * @returns LoadItem
     */
    public error(task: LoadItemTask): LoadItem {
        LoadItem.pushTask("error", task, this);

        return this;
    }
}
