// components
import Modal from "Shared/ts/components/modal";
import {
    convertFragmentToHTMLElement,
    renderTemplate
} from "Shared/ts/utils/html";
import { initializeModalDialogUI } from "./delay-input";

declare global {
    interface Window {
        modalDialogRepository: WeakMap<HTMLElement, Modal>;
    }
}

const modalRepository: WeakMap<HTMLElement, Modal> = new WeakMap<
    HTMLElement,
    Modal
>();

const modalInitializerStatus: WeakMap<HTMLElement, boolean> = new WeakMap<
    HTMLElement,
    boolean
>();

export const allowGlobalAccessModalDialogRepository = (): WeakMap<
    HTMLElement,
    Modal
> => {
    if (!("modalDialogRepospitory" in window)) {
        window.modalDialogRepository = modalRepository;
    }

    return modalRepository;
};

export const initializeDocumentModalDialogsByControllers = (): void => {
    const controllers: Element[] = Array.from(
        document.querySelectorAll(
            `[data-modal-dialog-type=document][data-modal-dialog-actor=open][data-modal-dialog-id][data-modal-dialog-title]`
        )
    ).filter(
        (controller, index, controllers) =>
            controllers.indexOf(controller) === index
    );

    const containers = controllers
        .map((controller) =>
            document.querySelector(
                `#${controller.getAttribute("data-modal-dialog-id")}`
            )
        )
        .filter((container) => container !== null) as HTMLElement[];

    containers.forEach((container) => {
        const label = controllers.find(
            (controller) =>
                container.id ===
                controller?.getAttribute("data-modal-dialog-id")
        );

        if (!label || modalInitializerStatus.has(container)) return;

        modalInitializerStatus.set(container, true);

        const modal = new Modal(container as HTMLElement, {
            ariaLabel: label.getAttribute("data-modal-dialog-title") ?? ""
        });

        modalRepository.set(container, modal);
    });
};

export const initializeDocumentModalDialogsByContainers = (): void => {
    const containers: HTMLElement[] = Array.from(
        document.querySelectorAll(
            "[data-modal-dialog-container][data-modal-dialog-title]"
        )
    );

    containers.forEach((container) => {
        if (modalInitializerStatus.has(container)) return;

        modalInitializerStatus.set(container, true);

        const modal = new Modal(container, {
            ariaLabel: container.getAttribute("data-modal-dialog-title") ?? ""
        });

        modalRepository.set(container, modal);
    });
};

export const initializeDocumentModalDialogsByTemplates = (): void => {
    const templates: HTMLElement[] = Array.from(
        document.querySelectorAll("[data-modal-dialog-template]")
    );

    const containers = templates
        .map((template) => {
            const fragment = renderTemplate(template.innerHTML);
            return convertFragmentToHTMLElement(fragment);
        })
        .filter((container) => container !== null) as HTMLElement[];

    containers
        .filter((container) => !modalInitializerStatus.has(container))
        .forEach((container) => document.body.appendChild(container));

    initializeDocumentModalDialogsByContainers();
};

export const initalizeDocumentModalDialogsByDOMMutation = (): void => {
    initializeModalDialogUI((container) => {
        if (modalInitializerStatus.has(container)) return;

        modalInitializerStatus.set(container, true);

        const modal = new Modal(container, {
            ariaLabel: container.getAttribute("data-modal-dialog-title") ?? ""
        });

        modalRepository.set(container, modal);
    });
};
