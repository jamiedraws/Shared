// components
import Nav from "Shared/ts/components/nav";

// utils
import Flyout from "Shared/ts/utils/flyout";

declare global {
    interface Window {
        flyoutRepository: WeakMap<HTMLElement, Flyout>;
    }
}

export const initializeGlobalFlyoutRepository = (): WeakMap<
    HTMLElement,
    Flyout
> => {
    const flyoutRepository = new WeakMap<HTMLElement, Flyout>();

    window.flyoutRepository = flyoutRepository;

    return flyoutRepository;
};

export const initializeFlyouts = (selector: string): void => {
    const elements = Array.from(
        document.querySelectorAll(selector)
    ) as HTMLElement[];

    elements.forEach((element) => {
        const flyout = new Flyout(element);

        if ("flyoutRepository" in window) {
            window.flyoutRepository.set(element, flyout);
        }
    });
};

export const initializeNavById = (id: string): Nav | undefined => {
    const element = document.getElementById(id);
    if (!element) return;

    return new Nav(element.id);
};

export const initializeFlyoutsThenNav = (
    selector: string,
    id: string
): void => {
    initializeFlyouts(selector);
    initializeNavById(id);
};
