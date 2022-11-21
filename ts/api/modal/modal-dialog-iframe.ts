// components
import Modal from "Shared/ts/components/modal";

// observers
import { observer } from "Shared/ts/observers/intersection";

// utils
import { renderTemplate } from "Shared/ts/utils/html";

export default class ModalDialogIframe {
    private static containerControllerRepository: WeakMap<Element, Element[]> =
        new WeakMap<Element, Element[]>();

    constructor() {}

    public initializeObserver(): void {
        observer("[data-modal-dialog-iframe][data-modal-dialog-actor=open]", {
            inRange: (controller) => {
                controller.addEventListener("click", (event) => {
                    event.preventDefault();

                    ModalDialogIframe.processModalDialogIframeByController(
                        controller
                    );
                });
            }
        });
    }

    private static hasContainerInRepository(controller: Element): boolean {
        let result = false;

        const id = this.getModalDialogControllerId(controller);
        if (!id) return result;

        const container = document.getElementById(id);
        if (!container) return result;

        return this.containerControllerRepository.has(container);
    }

    private static processModalDialogIframeByController(
        controller: Element
    ): void {
        if (!this.hasContainerInRepository(controller)) {
            const id = this.getModalDialogControllerId(controller);
            const title = this.getModalDialogControllerTitle(controller);
            const source = this.getModalDialogControllerSource(controller);

            if (id && title && source) {
                const fragment = this.createModalDialogIframeContainerFragment(
                    id,
                    title,
                    source
                );

                document.body.appendChild(fragment);

                const container = document.getElementById(id);
                if (!container) return;

                const controllers =
                    this.containerControllerRepository.get(container) ?? [];
                controllers.push(controller);

                this.containerControllerRepository.set(container, controllers);

                const modal = new Modal(container, {
                    ariaLabel: container.getAttribute("aria-label") ?? "",
                    templateModifier: controller.getAttribute(
                        "data-modal-dialog-template-modifier"
                    )
                });

                addEventListener("message", (event) => {
                    try {
                        const message = JSON.parse(event.data);

                        if (
                            message.id === id &&
                            message.title === title &&
                            message.source === source &&
                            message.actor === "close"
                        ) {
                            modal.close();
                        }
                    } catch (e: unknown) {
                        if (e instanceof Error) {
                            console.warn(e.message);
                        }
                    }
                });
            }
        }
    }

    private static getModalDialogControllerId(
        controller: Element
    ): string | null {
        const id = controller.getAttribute("data-modal-dialog-id");

        if (!id) {
            console.error({
                message: `An id value was not found for the attribute [data-modal-dialog-id].`,
                controller
            });
        }

        return id;
    }

    private static getModalDialogControllerTitle(
        controller: Element
    ): string | null {
        const title = controller.getAttribute("data-modal-dialog-title");

        if (!title) {
            console.error({
                message: `A title value was not found for the attribute [data-modal-dialog-title].`,
                controller
            });
        }

        return title;
    }

    private static getModalDialogControllerSource(
        controller: Element
    ): string | null {
        let source = controller.getAttribute("data-modal-dialog-iframe") ?? "";

        source = source === "" ? controller.getAttribute("href") ?? "" : source;

        if (!source) {
            console.error({
                message: `A src value was not found for the attribute [href] or [data-modal-dialog-iframe].`,
                controller
            });
        }

        return source;
    }

    private static createModalDialogIframeContainerFragment(
        id: string,
        title: string,
        source: string
    ): DocumentFragment {
        return renderTemplate(`
            <section id="${id}" aria-label="${title}" class="view modal-dialog modal-dialog--iframe section">
                <div class="view__in modal-dialog__in section__in">
                    <div class="defer modal-dialog__iframe">
                        <iframe src="${source}" title="${title}" tabindex="0"></iframe>
                    </div>
                </div>
            </section>
        `);
    }
}
