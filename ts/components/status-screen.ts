// utils
import CaptureElement from "Shared/ts/utils/capture-element";
import { renderTemplate } from "Shared/ts/utils/html";

export default class StatusScreen {
    /**
     * Represents the HTML scope
     */
    public scope: HTMLElement;

    /**
     * Represents the key-value relationship between the current StatusScreen context and the HTML element container
     */
    private static elementRepository: WeakMap<StatusScreen, HTMLElement> =
        new WeakMap<StatusScreen, HTMLElement>();

    /**
     * Presents a UI view to the user that represents the status of a background task and provides the ability to assign the view to states such as; busy, done and problem to represent the appropriate status of the task.
     * @param id string
     * @param scope HTMLElement
     */
    constructor(id: string = "default", scope: HTMLElement = document.body) {
        this.scope = scope;

        const element = StatusScreen.initializeTemplate(id, this);

        StatusScreen.captureElement(element);
        StatusScreen.initializeEvents(element, this);
    }

    /**
     * Manages which state method to execute
     * @param element HTMLElement
     */
    private static delegateState(element: HTMLElement): void {
        const state = element
            .getAttribute("data-status-screen-state")
            ?.toLowerCase();

        switch (state) {
            case "busy":
                this.handleBusyState(element);
                break;
            case "done":
                this.handleDoneState(element);
                break;
            case "problem":
                this.handleProblemState(element);
                break;
        }
    }

    /**
     * Manages the text attributes necessary to animate the output text
     * @param element HTMLElement
     * @param controller HTMLElement
     * @returns void
     */
    private static controlTextAttributes(
        element: HTMLElement,
        controller: HTMLElement
    ): void {
        const output = element.querySelector("output");
        if (!output) return;

        const text = output.textContent?.trim();

        if (!text) {
            output.textContent = controller.getAttribute(
                "data-status-screen-input"
            );

            return;
        }

        controller.setAttribute("data-status-screen-output", text);
        element.classList.add("status-screen--receive-text-input");
    }

    /**
     * Manages the output text
     * @param element HTMLElement
     * @returns void
     */
    private static controlOutputText(element: HTMLElement): void {
        const controller = element.querySelector(".status-screen__output");
        const output = element.querySelector("output");
        if (!output || !controller) return;

        output.textContent = controller.getAttribute(
            "data-status-screen-input"
        );

        element.classList.remove(
            "status-screen--update-output",
            "status-screen--receive-text-input"
        );
    }

    /**
     * Establishes a mutation observer on the status screen element and manages the visibility state, the task-flow state and the output text
     * @param element HTMLElement
     */
    private static captureElement(element: HTMLElement): void {
        const captureElement = new CaptureElement(element);

        captureElement.subscribe("attributes", (record) => {
            if (
                record.attributeName === "class" &&
                element.classList.contains("status-screen--update-output")
            ) {
                this.controlOutputText(element);
            }

            if (record.attributeName === "data-status-screen-input") {
                this.controlTextAttributes(
                    element,
                    record.target as HTMLElement
                );
            }

            if (record.attributeName === "data-status-screen-state") {
                this.delegateState(element);
            }

            if (record.attributeName === "hidden") {
                element.hasAttribute("hidden")
                    ? this.handleCloseState(element)
                    : this.handleOpenState(element);
            }
        });
    }

    /**
     * Initializes all of the events necessary for the status screen UI to operate
     * @param element HTMLElement
     */
    private static initializeEvents(
        element: HTMLElement,
        context: StatusScreen
    ): void {
        element
            .querySelector(".status-screen__screen")
            ?.addEventListener("transitionend", (event) => {
                if (!element.classList.contains("status-screen--is-hidden"))
                    return;

                element.setAttribute("hidden", "true");
            });

        element
            .querySelector(".status-screen__output")
            ?.addEventListener("animationend", (event: AnimationEventInit) => {
                if (
                    event.animationName?.toLowerCase() ===
                    "status-screen-fade-translate-text-out"
                ) {
                    element.classList.add("status-screen--update-output");
                }
            });

        addEventListener("keyup", (event) => {
            const escape = event.key?.toLowerCase() === "escape";
            if (!escape || !this.closeOnCondition(element)) return;

            context.close();
        });

        element
            .querySelector(".status-screen__close")
            ?.addEventListener("click", (event) => {
                if (!this.closeOnCondition(element)) return;

                context.close();
            });
    }

    /**
     * Determines if the status screen UI is in the problem or done state
     * @param element HTMLElement
     * @returns boolean
     */
    private static closeOnCondition(element: HTMLElement): boolean {
        const state = element
            .getAttribute("data-status-screen-state")
            ?.toLowerCase();

        return state === "problem" || state === "done";
    }

    /**
     * Updates the status screen UI to render the open state view
     * @param element HTMLElement
     */
    private static handleOpenState(element: HTMLElement): void {
        element.classList.remove("status-screen--is-hidden");
    }

    /**
     * Updates the status screen UI to render the close state view
     * @param element HTMLElement
     */
    private static handleCloseState(element: HTMLElement): void {
        element.classList.add("status-screen--is-hidden");
    }

    /**
     * Updates the status screen UI to render the busy state view
     * @param element HTMLElement
     */
    private static handleBusyState(element: HTMLElement): void {
        element.classList.remove(
            "status-screen--is-hidden",
            "status-screen--is-done",
            "status-screen--is-problem"
        );
        element.classList.add("status-screen--is-busy");

        element
            .querySelector(".status-screen__close")
            ?.setAttribute("disabled", "true");
    }

    /**
     * Updates the status screen UI to render the done state view
     * @param element HTMLElement
     */
    private static handleDoneState(element: HTMLElement): void {
        element.classList.remove(
            "status-screen--is-hidden",
            "status-screen--is-busy",
            "status-screen--is-problem"
        );
        element.classList.add("status-screen--is-done");

        element
            .querySelector(".status-screen__close")
            ?.removeAttribute("disabled");
    }

    /**
     * Updates the status screen UI to render the problem state view
     * @param element HTMLElement
     */
    private static handleProblemState(element: HTMLElement): void {
        element.classList.remove(
            "status-screen--is-hidden",
            "status-screen--is-busy",
            "status-screen--is-done"
        );
        element.classList.add("status-screen--is-problem");

        element
            .querySelector(".status-screen__close")
            ?.removeAttribute("disabled");
    }

    /**
     * Returns the HTML element
     * @param id string
     * @returns HTMLElement | null
     */
    private static getElementById(id: string): HTMLElement | null {
        return document.getElementById(id);
    }

    /**
     * Attempts to retrieve the HTML element that is associated with the StatusScreen context
     * @param context StatusScreen
     * @returns HTMLElement | null | undefined
     */
    private static getElementByContext(
        context: StatusScreen
    ): HTMLElement | null | undefined {
        return this.elementRepository.get(context);
    }

    /**
     * Elects an HTML template as the status screen Ui
     * @param id string
     * @param context StatusScreen
     * @returns HTMLElement
     */
    private static initializeTemplate(
        id: string,
        context: StatusScreen
    ): HTMLElement {
        let element = this.getElementByContext(context);
        if (element) return element;

        element = this.getElementById(id);

        if (!element) {
            const template = this.createTemplate(id);

            context.scope.appendChild(template);

            element = this.getElementById(id);
        }

        if (element) {
            this.elementRepository.set(context, element);
        }

        return element as HTMLElement;
    }

    /**
     * Creates an HTML template of the status screen UI. The document fragment of that template is returned.
     * @param id string
     * @returns DocumentFragment
     */
    private static createTemplate(id: string): DocumentFragment {
        return renderTemplate(`<div id="${id}" class="status-screen status-screen--is-hidden status-screen--${id}" hidden>
            <div class="status-screen__screen">
                <div class="status-screen__status">
                    <div class="status-screen__status-positive">
                        <div class="status-screen__circle-icon">
                            <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="25"></circle><path d="M14.1 27.2l7.1 7.2 16.7-16.8"></path></svg>
                        </div>
                    </div>
                    <div class="status-screen__status-negative">
                        <div class="status-screen__cross"></div>
                    </div>
                </div>
                <div class="status-screen__output" data-status-screen-output="">
                    <output role="status"></output>
                </div>
            </div>
            <button type="button" class="status-screen__close status-screen__cross" aria-label="Close"></button>
        </div>`);
    }

    /**
     * Reports a debug-error to the developer
     * @param message string
     */
    private static reportUIDebug(message: string): void {
        console.debug({
            message,
            for: "StatusScreen Api"
        });
    }

    /**
     * Updates the text in the status screen UI
     * @param text string
     * @returns void
     */
    public update(text: string): void {
        const element = StatusScreen.getElementByContext(this);
        if (!element) return;

        if (!text) {
            return StatusScreen.reportUIDebug(
                `A text message must be provided when calling the 'update' method so that the status may be accessible to the user. Aborting task.`
            );
        }

        const controller = element.querySelector("[data-status-screen-output]");
        if (!controller) return;

        controller.setAttribute("data-status-screen-input", text);
    }

    /**
     * Renders the status screen UI visible in the viewport
     * @returns void
     */
    public open(): void {
        const element = StatusScreen.getElementByContext(this);
        if (!element) return;

        const text = element.textContent?.trim();
        if (!text) {
            return StatusScreen.reportUIDebug(
                `An output element must contain a text node when calling the 'open' method so that the status may be accessible to the user. Aborting task.`
            );
        }

        const state = element.hasAttribute("data-status-screen-state");
        if (!state) {
            return StatusScreen.reportUIDebug(
                `A state must be assigned when calling the 'open' method. Aborting task.`
            );
        }

        element.removeAttribute("hidden");
    }

    /**
     * Renders the status screen UI invisible in the viewport
     * @returns void
     */
    public close(): void {
        const element = StatusScreen.getElementByContext(this);
        if (!element) return;

        element.classList.add("status-screen--is-hidden");
    }

    /**
     * Assigns a "busy" state to the status screen UI and provides a status message to inform the user of the reason
     * @param text string
     * @returns void
     */
    public busy(text: string): void {
        const element = StatusScreen.getElementByContext(this);
        if (!element) return;

        if (!text) {
            return StatusScreen.reportUIDebug(
                `A text message must be provided when calling the 'busy' method so that the status may be accessible to the user. Aborting task.`
            );
        }

        element.setAttribute("data-status-screen-state", "busy");

        this.update(text);

        requestAnimationFrame(this.open.bind(this));
    }

    /**
     * Assigns a "done" state to the status screen UI and provides a status message to inform the user of the reason
     * @param text string
     * @returns void
     */
    public done(text: string): void {
        const element = StatusScreen.getElementByContext(this);
        if (!element) return;

        if (!text) {
            return StatusScreen.reportUIDebug(
                `A text message must be provided when calling the 'done' method so that the status may be accessible to the user. Aborting task.`
            );
        }

        element.setAttribute("data-status-screen-state", "done");

        this.update(text);

        requestAnimationFrame(this.open.bind(this));
    }

    /**
     * Assigns a "problem" state to the status screen UI and provides a status message to inform the user of the reason
     * @param text string
     * @returns void
     */
    public problem(text: string): void {
        const element = StatusScreen.getElementByContext(this);
        if (!element) return;

        if (!text) {
            return StatusScreen.reportUIDebug(
                `A text message must be provided when calling the 'problem' method so that the status may be accessible to the user. Aborting task.`
            );
        }

        element.setAttribute("data-status-screen-state", "problem");

        this.update(text);

        requestAnimationFrame(this.open.bind(this));
    }
}

declare global {
    interface Window {
        statusScreen: StatusScreen;
    }
}

/**
 * Establishes global access to the default StatusScreen Api
 * @returns StatusScreen
 */
export const initializeGlobalStatusScreen = (): StatusScreen => {
    const statusScreen = new StatusScreen();

    window.statusScreen = statusScreen;

    return statusScreen;
};
