import * as Html from "shared/ts/utils/html";

interface ISource {
    src: string;
}

interface ILink {
    href: string;
}

export const createStylesheet = (src: string): HTMLElement => {
    return Html.createElement<ILink>("link", { href: src });
};

export const createScript = (src: string): HTMLElement => {
    return Html.createElement<ISource>("script", { src: src });
};

export const createAppendStylesheet = (src: string): HTMLElement => {
    const element = createStylesheet(src);

    return Html.appendElement(element);
};

export const createAppendScript = (src: string): HTMLElement => {
    const element = createScript(src);

    return Html.appendElement(element);
};
