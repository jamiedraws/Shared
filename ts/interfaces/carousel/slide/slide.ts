export interface ISlideDefault {
    delay: number;
    noScroll: string;
    error: string;
}

export interface ISlideOrganization {
    defaults: ISlideDefault;
    docs: Record<string, string>;
    errors: Record<string, string>;
    team: ISlideWorker[];
    request: (id: string) => ISlideWorker;
    observer: (
        parent: Element,
        children: NodeList,
        cb: (index: number) => void
    ) => void;
    manager: ISlideManager;
    interface: Slide;
}

export interface ISlideManager {
    config: (options: Record<string, any>) => void;
    create: (api: ISlideApi, id: string, parent: Element, config: {}) => void;
    assign: () => ISlideWorker;
    observer: (parent: Element, children: HTMLCollection) => void;
    getIndex: (index: number) => number;
    setIndex: (index: number) => void;
    setRotation: () => void;
    isValidNumber: (index: number) => boolean;
    setDelay: (delay: string) => void;
    setCallback: () => void;
    setTimer: () => void;
    routeCallback: () => void;
    setTask: (index: number) => void;
}

export interface ISlideWorker {
    index: number;
    shim: boolean;
    auto: boolean;
    handleRotation: boolean;
    timer: number;
    delay: number;
    scrollIntoViewOptions: ScrollIntoViewOptions;
}

export interface ISlideApi {
    parent: Element;
    validateNodeElement: (element: Element) => boolean;
    toArray: (collection: HTMLCollection) => HTMLCollection[];
    children: HTMLCollection;
    isAuto: () => boolean;
    setAuto: (status: boolean) => void;
    setScrollIntoView: (options: ScrollIntoViewOptions) => void;
    watch: (
        task: (
            currentIndex: number,
            previousIndex: number,
            nextIndex: number
        ) => void
    ) => void;
    countChildren: () => number;
    getDelay: () => number;
    setDelay: (delay: number | string) => void;
    setError: (code: string, message: string) => void;
    getError: (code: string) => void;
    hasError: (code: string) => boolean;
    config: (options: {}) => void;
    setShim: (status: boolean) => void;
    play: (persistCurrentIndex?: boolean) => void;
    pause: () => void;
    prev: () => void;
    next: () => void;
    prevIndex: () => number;
    nextIndex: () => number;
    currentIndex: () => number;
    getIndex: (index: number) => number;
    setIndex: (index: number) => void;
    handleRotation: (status: boolean) => void;
    goto: (index: number) => void;
}

export interface ISlide extends ISlideApi {
    /**
     * Represents the root container element with the ".slide" base CSS class name
     */
    root?: HTMLElement;
    /**
     * Represents the unique id number associated with the current ".slide" element
     */
    id?: number;
}

export interface ISlideProto {}

export interface Slide {
    into: (
        parent: Element,
        config?: {},
        callback?: (api: ISlideApi) => ISlideApi
    ) => ISlideApi;
    proto: (api: ISlideProto) => void;
}
