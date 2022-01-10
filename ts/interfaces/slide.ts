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
    handleRotation: (status: boolean) => void;
    goto: (index: number) => void;
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

declare global {
    interface Window {
        Slide?: Slide;
    }
}
