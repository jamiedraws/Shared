import * as Data from "Shared/ts/utils/data";

export type HTMLList =
    | Element
    | NodeList
    | NodeListOf<HTMLElement>
    | NodeListOf<Element>
    | HTMLCollectionOf<Element>;

export type HTMLItem = HTMLElement | Node;

const div: HTMLElement = document.createElement("div");

/**
 * createElement takes a string tag name along with an optional object of attributes and returns a new HTMLElement.
 * @param tag string
 * @param attributes object
 * @return HTMLElement
 */
export const createElement = <T extends {}>(
    tag: string,
    attributes?: T
): HTMLElement => {
    const element = document.createElement(tag);

    return setElementAttributes(element, attributes);
};

/**
 * Takes an object representing an attribute key-value pair and assigns it to an HTMLElement. The HTMLElement will be returned.
 * @param element HTMLElement
 * @param attributes T
 * @returns HTMLElement
 */
export const setElementAttributes = <T extends { [key: string]: any }>(
    element: HTMLElement,
    attributes?: T
): HTMLElement => {
    if (attributes && Data.isObject(attributes)) {
        Object.keys(attributes).forEach((attribute) => {
            element.setAttribute(attribute, attributes[attribute]);
        });
    }

    return element;
};

/**
 * Takes a string representing an HTML template and converts it into a document fragment. The document fragment is returned.
 * @param template string
 * @returns DocumentFragment
 */
export const renderTemplate = (template: string): DocumentFragment => {
    const range = document.createRange();

    return range.createContextualFragment(template);
};

/**
 * Takes a document fragment and converts it into an HTML element. The Element is returned.
 * @param fragment DocumentFragment
 * @returns Element | null
 */
export const convertFragmentToHTMLElement = (
    fragment: DocumentFragment
): Element | null => {
    div.appendChild(fragment);

    return div.lastElementChild;
};

/**
 * appendElement takes an HTMLElement and appends it to the document body. The same element is then returned.
 * @param element HTMLElement
 * @return HTMLElement
 */
export const appendElement = (element: HTMLElement): HTMLElement => {
    document.body.appendChild(element);

    return element;
};

/**
 * elementExists takes an HTMLItem and will return true if the item exists either in the document body or in the document head.
 * @param element HTMLItem
 * @return boolean
 */
export const elementExists = (element: HTMLItem | null): boolean => {
    return document.body.contains(element) || document.head.contains(element);
};

/**
 * enumerateElements takes an HTMLList and returns an element array.
 * @param elements HTMLList
 * @return Element[]
 */
export const enumerateElements = (elements: HTMLList): Element[] => {
    let ar = [].slice.call(elements);

    return ar;
};

/**
 * Attempts to convert a JSON string value of an HTML attribute into JSON format.
 * @param element Element | null
 * @param attribute string
 * @returns JSON object
 */
export const getJSONByElementAttribute = <T>(
    element: Element | null,
    attribute: string
): T => {
    let json = {} as any;

    if (!element || !attribute) return json;

    try {
        const value = element.getAttribute(attribute);
        json = value !== null ? JSON.parse(value) : json;
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.debug(message);
    }

    return json;
};
