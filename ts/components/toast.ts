import { elementExists, renderTemplate } from "Shared/ts/utils/html";
import {
    IToastHTMLTemplate,
    IToastConfig,
    IToastEventManager
} from "Shared/ts/interfaces/toast";

export default class Toast {
    /**
     * Represents the HTML template of the toast
     */
    private static template: WeakMap<Toast, IToastHTMLTemplate> = new WeakMap();

    /**
     * Represents the current message
     */
    private static message: WeakMap<Toast, string> = new WeakMap();

    /**
     * Represents a collection of callback functions that can be added and removed from the event stack
     */
    private static eventManager: WeakMap<Toast, IToastEventManager> =
        new WeakMap();

    /**
     * Represents the active element that initialized the toast
     */
    private static initializer: WeakMap<Toast, Element> = new WeakMap();

    /**
     * Represents a map collection of Toast instances where the unique identifier can access the current Toast instance
     */
    private static context: Map<string, Toast> = new Map();

    /**
     * Represents the body element
     */
    private static body: HTMLElement = document.body;

    /**
     * Toast is a popup container that contains a message and doesn't require any user action when it is displayed on screen. A unique identifier is required to generate a toast and a configuration interface is optional.
     * @param id string
     * @param config IToastConfig
     */
    constructor(id: string, config?: IToastConfig) {
        Toast.context.set(id, this);

        Toast.eventManager.set(this, {
            stage: Toast.setToInert.bind(Toast, this),
            dismissButton: Toast.dismissToast.bind(Toast, this)
        });

        if (config?.message) {
            Toast.message.set(this, config.message);
        }

        const template = Toast.createTemplate(id, config ?? {});

        Toast.template.set(this, template);
        Toast.renderTemplate(template);
    }

    /**
     * Inserts the template container into the document
     * @param template IToastTemplate
     */
    private static renderTemplate(template: IToastHTMLTemplate): void {
        if (!template.container) return;

        this.body.appendChild(template.container);

        template.container.classList.add("toast--is-ready");
    }

    /**
     * Create a HTML fragment of the toast template and return an object containing access to each of the elements within the toast
     * @param id string
     * @param config IToastConfig
     * @returns IToastHTMLTemplate
     */
    private static createTemplate(
        id: string,
        config: IToastConfig
    ): IToastHTMLTemplate {
        const liveRegion = config?.role === "alert" ? "assertive" : "polite";

        const toast =
            renderTemplate(`<div class="toast toast--alert toast--polite toast--hidden ${
                config?.theme ?? ""
            }">
            <div class="toast toast__stage">
                <div class="toast toast__group toast__text">
                    <output role="${
                        config?.role ?? "status"
                    }" aria-live="${liveRegion}" aria-atomic="true">
                        <p id="${id}">${config?.message ?? ""}</p>
                    </output>
                    <button hidden type="button" class="toast__close" aria-label="Dismiss"></button>
                </div>
            </div>
        </div>`);

        return {
            container: toast.querySelector(".toast--alert"),
            stage: toast.querySelector(".toast__stage"),
            group: toast.querySelector(".toast__group"),
            dismissButton: toast.querySelector(".toast__close"),
            liveRegion: toast.querySelector("[role]"),
            textContainer: toast.querySelector(`#${id}`)
        };
    }

    /**
     * Hide the toast and handle the initializer
     * @param context Toast
     * @param event MouseEvent
     */
    private static dismissToast(context: Toast, event: MouseEvent): void {
        context.hide();

        this.handleInitializer(context);
    }

    /**
     * If the target element reported on the transition event interface is the same as the stage element, then remove the message.
     * @param context Toast
     * @param event TransitionEvent
     */
    private static setToInert(context: Toast, event: TransitionEvent): void {
        const template = Toast.template.get(context);

        if (template && event.target === template.stage) {
            template.dismissButton?.setAttribute("hidden", "true");

            if (template.textContainer) {
                template.textContainer.innerHTML = "";
            }
        }
    }

    /**
     * Stores the active element if it exists in the document and if it is not the body element
     * @param context Toast
     */
    private static setInitializer(context: Toast): void {
        if (
            document.activeElement &&
            elementExists(document.activeElement) &&
            document.activeElement !== this.body
        ) {
            this.initializer.set(context, document.activeElement);
        }
    }

    /**
     * Determines whether the active element can be focused upon dismissal of the toast
     * @param context Toast
     */
    private static handleInitializer(context: Toast): void {
        if (this.initializer.has(context)) {
            const initializer = this.initializer.get(context) as HTMLElement;

            if (initializer !== this.body) {
                initializer.focus();
            }
        }
    }

    private static notifyToasts(id: string): void {
        const toast = this.context.get(id);

        this.context.forEach((context) => {
            const template = this.template.get(context);

            if (context === toast) {
                template?.container?.classList.add("toast--active");
            }

            if (context !== toast) {
                template?.container?.classList.remove("toast--active");
                context.hide();
            }
        });
    }

    /**
     * This updates the title with a new message. The message can accept HTML Phrasing content as well.
     * @param message string
     */
    public post(message: string): void {
        Toast.message.set(this, message);

        const template = Toast.template.get(this);

        if (template?.textContainer) {
            template.textContainer.innerHTML = message;
        }
    }

    /**
     * Displays the toast onscreen
     */
    public show() {
        const template = Toast.template.get(this);
        if (!template) return;

        const message = Toast.message.get(this);
        if (!message) return;

        const event = Toast.eventManager.get(this);
        if (!event) return;

        const id = template.textContainer?.id;
        if (!id) return;

        if (template.textContainer) {
            template.textContainer.innerHTML = message;
        }

        template.dismissButton?.removeAttribute("hidden");
        template.dismissButton?.addEventListener("click", event.dismissButton);

        template.container?.removeEventListener("transitionend", event.stage);

        requestAnimationFrame((callback) => {
            template.container?.classList.remove("toast--hidden");
        });

        Toast.setInitializer(this);
        Toast.notifyToasts(id);
    }

    /**
     * Hides the toast offscreen
     */
    public hide() {
        const template = Toast.template.get(this);
        if (!template) return;

        const event = Toast.eventManager.get(this);
        if (!event) return;

        template.container?.classList.add("toast--hidden");

        template.container?.addEventListener("transitionend", event.stage);

        template.dismissButton?.removeEventListener(
            "click",
            event.dismissButton
        );
    }
}
