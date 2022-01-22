export interface ICarouselEvent {
    /**
     * Represents the event name that is associated with the event of the carousel
     */
    name: string;
    /**
     * Represents the handler callback that will invoke when the carousel event emits
     */
    handler: (
        currentIndex: number | undefined,
        previousIndex: number | undefined,
        nextIndex: number | undefined
    ) => void;
}

/**
 * A collection of key-value pairs representing carousel interface controls
 */
export interface ICarouselControls {
    /**
     * Represents the current play status
     */
    play: boolean;
}

/**
 * A collection of key-value pairs representing carousel configuration settings
 */
export interface ICarouselConfig {
    /**
     * Represents the autoplay status
     */
    auto?: boolean;
    /**
     * Represents the delay number
     */
    delay?: number;
}

/**
 * A contract representing the properties and methods that must conform to the Carousel application
 */
export default interface ICarousel {
    /**
     * Represents the element containing the carousel along with other user-interface components
     */
    container: Element | undefined;
    /**
     * Represents the parent carousel element
     */
    parent: Element | undefined;
    /**
     * Represents the HTMLCollection list of carousel slides
     */
    children: HTMLCollection | undefined;
    /**
     * Returns the carousel's autoplay status
     */
    isAuto: () => boolean;
    /**
     * Overrides the carousel's autoplay status
     */
    setAuto: (status: boolean) => void;
    /**
     * Watches for changes in the carousel's behavior and invokes a callback function that provides access to the carousel's current index, previous index and next index
     */
    watch: (
        task: (
            currentIndex: number,
            previousIndex: number,
            nextIndex: number
        ) => void
    ) => void;
    /**
     * Returns the total number of slides in the carousel
     */
    countChildren: () => number | undefined;
    /**
     * Returns the current carousel's delay time
     */
    getDelay: () => number | undefined;
    /**
     * Overrides the carousel's delay time
     */
    setDelay: (delay: number) => void;
    /**
     * Plays the carousel continuously. This effectively sets the autoplay mode to true.
     */
    play: (persistCurrentIndex?: boolean) => void;
    /**
     * Pauses the carousel. This effectively sets the autoplay mode to false.
     */
    pause: () => void;
    /**
     * Advances the carousel to it's previous slide
     */
    prev: () => void;
    /**
     * Advances the carousel to it's next slide
     */
    next: () => void;
    /**
     * Returns the carousel's previous index
     */
    prevIndex: () => number | undefined;
    /**
     * Returns the carousel's next index
     */
    nextIndex: () => number | undefined;
    /**
     * Returns the carousel's current index
     */
    currentIndex: () => number | undefined;
    /**
     * Returns the carousel's predicted index within it's boundary range based on a number
     */
    getIndex: (index: number) => number | undefined;
    /**
     * Sets the carousel's index number within it's boundary range based on a number
     */
    setIndex: (index: number) => void;
    /**
     * Advances the carousel to a specific index within it's boundary range based on a number
     */
    goto: (index: number) => void;
}
