// utils
import CaptureElement from "Shared/ts/utils/capture-element";
import Disclosure from "Shared/ts/utils/disclosure";

/**
 * Assigns a click event to controllers where each controller is not also an element and toggles the associated elements. For each controller that is also an element, each element is captured for an attribute change on the `aria-hidden` value. The `aria-hidden` state will have direct control over the element's `aria-expanded` state.
 */
export const initializeDisclosureByElementControllers = (): void => {
    const disclosure = new Disclosure();

    disclosure.controllers
        .filter((controller) => !disclosure.elements.includes(controller))
        .forEach((controller) => {
            controller.addEventListener("click", (event) => {
                disclosure.toggleElementsByController(controller);
            });

            const ids = disclosure.getIdsByController(controller);

            disclosure.controllers
                .filter((controller) => ids.includes(controller.id))
                .forEach((controller) => {
                    const captureController = new CaptureElement(controller);

                    captureController.subscribe("attributes", (record) => {
                        if (record.attributeName !== "aria-hidden") return;

                        const isAriaHidden = /true/i.test(
                            controller.getAttribute("aria-hidden") ?? ""
                        );

                        isAriaHidden
                            ? controller.setAttribute("aria-expanded", "true")
                            : controller.setAttribute("aria-expanded", "false");
                    });
                });
        });
};
