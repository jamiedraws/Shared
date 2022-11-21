import { renderTemplate } from "Shared/ts/utils/html";

declare global {
    interface Window {
        HTMLTemplateRenderingEngine: HTMLTemplateRenderingEngine;
    }
}

interface ITemplateTokenKeyValue {
    token: string;
    key: string;
    value: string;
}

export default class HTMLTemplateRenderingEngine {
    /**
     * Represents an element that can take an encoded HTML string and decode it.
     */
    private static textarea: HTMLTextAreaElement =
        document.createElement("textarea");

    /**
     * Provides the ability to process HTML templates along with tokens using an object of data where each key represents the token name, expressed in double-curly braces. For example, `{{Key}}` in the HTML template will match with the data object `{ Key: "" }`.
     */
    constructor() {}

    /**
     * Represents a key-value pair between the string html text with an array of token strings
     */
    private static elementTokensRepository: Map<
        string,
        ITemplateTokenKeyValue[]
    > = new Map<string, ITemplateTokenKeyValue[]>();

    /**
     * Takes an HTML element to create a new document fragment, then performs a token-matching operation using the provided data. The fragment undergoes a string encoding-to-decoding conversion and string to fragment conversion. The fragment is returned.
     * @param template HTMLElement | null
     * @param data Record<string, string>
     * @returns DocumentFragment | undefined
     */
    public renderViewByTemplate<T extends Record<string, any>>(
        template: HTMLTemplateElement | null | undefined,
        data: T
    ): DocumentFragment | undefined {
        if (!template) return;

        const html = template.innerHTML;
        let fragment = renderTemplate(html);

        const treeWalker = document.createTreeWalker(
            fragment,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        let currentNode = treeWalker.nextNode();

        while (currentNode) {
            const textContentReference = currentNode.textContent?.trim() ?? "";
            const matches = textContentReference?.matchAll(/{{(\w*)}}/g);

            let textContentGenerator = textContentReference;

            for (const match of matches) {
                const token = match[0];
                const key = match[1];
                const value = data[key];

                const tag = `<span data-template-key="${key}">${value}</span>`;

                textContentGenerator = textContentGenerator?.replace(
                    token,
                    tag
                );
            }

            currentNode.textContent = textContentGenerator;

            currentNode = treeWalker.nextNode();
        }

        fragment
            .querySelectorAll("*:not([data-template-key])")
            .forEach((element) => {
                const html = element.outerHTML;
                const matches = html?.matchAll(/{{(\w*)}}/g);

                let currentHtml = html;

                const tokens: ITemplateTokenKeyValue[] = [];

                for (const match of matches) {
                    const token = match[0];
                    const key = match[1];
                    const value = data[key];

                    currentHtml = currentHtml?.replace(token, value);

                    tokens.push({
                        token,
                        key,
                        value
                    });
                }

                const node = renderTemplate(currentHtml);

                element.replaceWith(node);

                HTMLTemplateRenderingEngine.elementTokensRepository.set(
                    currentHtml,
                    tokens
                );
            });

        return HTMLTemplateRenderingEngine.processFragmentWithEncodedHTML(
            fragment
        );
    }

    /**
     * Takes a document fragment and performs an encoding-to-decoding conversion and returns a new document fragment.
     * @param fragment DocumentFragment
     * @returns DocumentFragment
     */
    private static processFragmentWithEncodedHTML(
        fragment: DocumentFragment
    ): DocumentFragment {
        const encodedHTMLString =
            HTMLTemplateRenderingEngine.convertFragmentToEncodedString(
                fragment
            );

        const decodedHTMLString =
            HTMLTemplateRenderingEngine.decodeHTMLString(encodedHTMLString);

        return renderTemplate(decodedHTMLString);
    }

    /**
     * Takes a document fragment and converts it into an HTML string. The encoded HTML string is returned.
     * @param fragment DocumentFragment
     * @returns string
     */
    private static convertFragmentToEncodedString(
        fragment: DocumentFragment
    ): string {
        const div = document.createElement("div");

        div.appendChild(fragment);

        return div.innerHTML;
    }

    /**
     * Takes an encoded HTML string and decodes it into an HTML string. The decoded HTML string is returned.
     * @param encodedString string
     * @returns string
     */
    private static decodeHTMLString(encodedString: string): string {
        this.textarea.innerHTML = encodedString;

        return this.textarea.value;
    }

    /**
     * Takes either an HTML element or a document fragment, pulls all elements matching the `data-template-key` attribute and updates each elements contents with the provided data. The same element is returned.
     * @param element HTMLElement | DocumentFragment
     * @param data Record<string, string>
     * @returns HTMLElement | DocumentFragment
     */
    private static mapAttributeKeysToDataKeys<
        T extends HTMLElement | DocumentFragment
    >(element: T, data: Record<string, string>): T {
        const elements = Array.from(
            element.querySelectorAll("[data-template-key]")
        );

        elements.forEach((element) => {
            const key = element.getAttribute("data-template-key");
            if (!key) return;

            const value = data[key];
            if (!value || value === "") return;

            element.innerHTML = value;
        });

        element.querySelectorAll("*:not([data-template-key])").forEach((e) => {
            const key = Array.from(
                HTMLTemplateRenderingEngine.elementTokensRepository.keys()
            ).find((key) => e.outerHTML === key);
            if (!key) return;

            const dictionary =
                HTMLTemplateRenderingEngine.elementTokensRepository.get(key);
            if (!dictionary || dictionary.length === 0) return;

            let currentHtml = e.outerHTML;

            dictionary.forEach((definition) => {
                const value = data[definition.key];
                if (value === undefined || value === null) return;

                currentHtml = currentHtml.replace(definition.value, value);

                definition.value = value;
            });

            const node = renderTemplate(currentHtml);

            e.replaceWith(node);

            HTMLTemplateRenderingEngine.elementTokensRepository.delete(key);
            HTMLTemplateRenderingEngine.elementTokensRepository.set(
                currentHtml,
                dictionary
            );
        });

        return element;
    }

    /**
     * Takes a document fragment and updates the contents using the provided data. The same fragment is returned; otherwise undefined is returned given the document fragment isn't available.
     * @param fragment DocumentFragment | null
     * @param data Record<string, string>
     * @returns DocumentFragment | undefined
     */
    public renderViewByFragment(
        fragment: DocumentFragment | null,
        data: Record<string, string>
    ): DocumentFragment | undefined {
        if (!fragment) return;

        return HTMLTemplateRenderingEngine.mapAttributeKeysToDataKeys(
            fragment,
            data
        );
    }

    /**
     * Takes an HTML element and updates the contents using the provided data. The same element is returned; otherwise undefined is returned given the element isn't available.
     * @param element HTMLElement | null
     * @param data Record<string, string>
     * @returns HTMLElement | undefined
     */
    public renderViewByElement<T extends Record<string, any>>(
        element: HTMLElement | null,
        data: T
    ): HTMLElement | undefined {
        if (!element) return;

        return HTMLTemplateRenderingEngine.mapAttributeKeysToDataKeys(
            element,
            data
        );
    }
}

/**
 * Creates a new instance of the HTMLTemplateRenderingEngine object and assigns it to the window object. The same object is returned.
 * @returns HTMLTemplateRenderingEngine
 */
export const initializeGlobalHTMLTemplateRenderingEngine =
    (): HTMLTemplateRenderingEngine => {
        const htmlTemplateRenderingEngine = new HTMLTemplateRenderingEngine();

        window.HTMLTemplateRenderingEngine = htmlTemplateRenderingEngine;

        return htmlTemplateRenderingEngine;
    };
