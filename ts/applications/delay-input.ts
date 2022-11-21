import "element-closest";

// patterns
import PubSub from "Shared/ts/patterns/pubsub";

// utils
import CaptureElement from "Shared/ts/utils/capture-element";

const pubsub = new PubSub();

const captureBody = new CaptureElement(document.body);

captureBody.subscribe("childList", (record) => {
    const nodes = Array.from(record.addedNodes).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
    ) as Element[];

    captureBody.disconnect();

    pubsub.publish("captureBody", nodes);

    captureBody.connect();
});

export const initializeModalDialogUI = (
    handleModalDialogContainer: (container: HTMLElement) => void
): void => {
    pubsub.subscribe("captureBody", (elements: Element[]) => {
        const hasModalDialogContainer = elements.find((element) =>
            element.hasAttribute("data-modal-dialog-container")
        );

        if (!hasModalDialogContainer) return;

        handleModalDialogContainer(hasModalDialogContainer as HTMLElement);
    });
};

export const initializeReviewTableUI = (): void => {
    const buttons = Array.from(
        document.querySelectorAll(".delay-input--for-review-table")
    );

    pubsub.subscribe("captureBody", (elements: Element[]) => {
        const hasReviewTable = elements.find(
            (element) => element.id === "orderReview"
        );

        if (hasReviewTable) {
            buttons.forEach((button) =>
                button.classList.add("delay-input--is-ready")
            );
        }
    });
};

export const initializeMikMakUI = (): void => {
    const buttons = Array.from(
        document.querySelectorAll(".delay-input--for-mikmak")
    );

    pubsub.subscribe("captureBody", (elements: Element[]) => {
        const hasMikmak = elements.find((element) =>
            element.querySelector("#mikmak_embed__wrapper-main")
        );

        if (hasMikmak) {
            buttons.forEach((button) =>
                button.classList.add("delay-input--is-ready")
            );
        }
    });
};

export const initializeBazaarVoiceUI = (): void => {
    const candidates = Array.from(
        document.querySelectorAll(".delay-input--for-bazaarvoice")
    );

    pubsub.subscribe("captureBody", (elements: Element[]) => {
        const bazaarVoice = elements.find((element) =>
            element.closest("[data-bv-ready]")
        );

        if (bazaarVoice) {
            const candidate = candidates.find(
                (candidate) =>
                    candidate ===
                    bazaarVoice.closest(".delay-input--for-bazaarvoice")
            );

            candidate?.classList.add("delay-input--is-ready");
        }
    });
};
