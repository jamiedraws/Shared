import { isFunction } from "Shared/ts/utils/data";
import { enumerateElements } from "Shared/ts/utils/html";

/**
 * IntersectionObserverConfig allows an optional inRange callback function to execute when an element intersects inside the viewport, allows an optional outRange callback function to execute when an element intersects outside the viewport, an optional boolean to unobserve elements and an optional configuration object to customize the Intersection Observer API behavior.
 */
export interface IntersectionObserverConfig {
    /**
     * Callback fires when an element intersects the viewport
     */
    inRange?: (record: Element, observer?: IntersectionObserverEntry) => void;
    /**
     * Callback fires when an element leaves the viewport
     */
    outRange?: (record: Element, observer?: IntersectionObserverEntry) => void;
    /**
     * Determines whether the element should be unobserved immediately after it's been observed the first time. Defaults to true.
     */
    unObserve?: boolean;
    /**
     * Represents the Intersection Observer initialization object that will be provided through a new Intersection Observer instance. Note that this object will not apply on browsers that do not support the Intersection Observer Api.
     */
    options?: IntersectionObserverInit;
}

/**
 * Handles observation of load items through the bounding client rectangle interface. This process will be used if the current browser does not support the Intersection Observer Api.
 * @param loadItems Element[]
 * @param config IntersectionObserverConfig
 */
const observeByBoundingClientRect = (
    loadItems: Element[],
    config: IntersectionObserverConfig
) => {
    let active = false;

    const process = () => {
        if (active === false) {
            active = true;

            setTimeout(() => {
                loadItems.forEach((loadItem) => {
                    if (inView(loadItem as HTMLElement)) {
                        config?.inRange?.(loadItem);

                        if (config?.unObserve ?? true) {
                            loadItems = loadItems.filter((image) => {
                                return image !== loadItem;
                            });

                            if (loadItems.length === 0) {
                                document.removeEventListener("scroll", process);
                                window.removeEventListener("resize", process);
                                window.removeEventListener(
                                    "orientationchange",
                                    process
                                );
                            }
                        }
                    } else {
                        config?.outRange?.(loadItem);
                    }
                });

                active = false;
            }, 200);
        }
    };

    document.addEventListener("scroll", process);
    window.addEventListener("resize", process);
    window.addEventListener("orientationchange", process);
    window.addEventListener("DOMContentLoaded", process);
};

/**
 * Determines if the element is in the viewport and is visible based on it's display state and it's bounding client rectangle coordinates.
 * @param loadItem HTMLElement
 * @returns boolean
 */
const inView = (loadItem: HTMLElement): boolean => {
    return (
        loadItem.getBoundingClientRect().top <= window.innerHeight &&
        loadItem.getBoundingClientRect().bottom >= 0 &&
        loadItem.style.display !== "none"
    );
};

/**
 * Handles observeration of load item elements through the Intersection Observer Api
 * @param loadItems Element[]
 * @param config IntersectionObserverConfig
 */
const observeByApi = (
    loadItems: Element[],
    config: IntersectionObserverConfig
) => {
    const loadItemObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio > 0 && entry.isIntersecting) {
                config?.inRange?.(entry.target, entry);
                if (config?.unObserve ?? true) {
                    loadItemObserver.unobserve(entry.target);
                }
            } else {
                config?.outRange?.(entry.target, entry);
            }
        });
    }, config?.options);

    loadItems.forEach(function (loadItem) {
        loadItemObserver.observe(loadItem);
    });
};

/**
 * Observer applies a string that represents a Document Element and observes when the element intersects in and out of the browser viewport. Optional configuration is provided through the IntersectionObserverConfig interface.
 * @param selector string = "[data-observe]"
 * @param config IntersectionObserverConfig
 */
export const observer = (
    selector: string = "[data-observe]",
    config?: IntersectionObserverConfig
): void => {
    let loadItems = enumerateElements(document.querySelectorAll(selector));

    if (!config) return;

    if ("IntersectionObserver" in window) {
        observeByApi(loadItems, config);
    } else {
        observeByBoundingClientRect(loadItems, config);
    }
};
