export interface ISlideApi {
    parent: Element;
    children: HTMLCollection;
    isAuto: () => boolean;
    setAuto: (status: boolean) => void;
    watch: (
        task: (
            currentIndex: number,
            previousIndex: number,
            nextIndex: number
        ) => void
    ) => void;
    countChildren: () => number;
    getDelay: () => number;
    setDelay: (delay: number) => void;
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
