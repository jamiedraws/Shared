import ICarousel from "shared/ts/interfaces/carousel/carousel";
import {
    ICarouselEvent,
    ICarouselConfig,
    ICarouselControls
} from "shared/ts/interfaces/carousel/carousel";
import { observer } from "shared/ts/observers/intersection";
import { enumerateElements } from "../utils/html";

export default class Carousel {
    /**
     * Represents the CSS class name for the selected thumbnail button
     */
    private static currentThumbnailCSSClassName: string =
        "slide__thumbnail--is-selected";

    /**
     * Represents the relationship between the carousel's container element and it's connected Carousel interface
     */
    protected static context: WeakMap<Element, ICarousel> = new WeakMap();

    /**
     * Represents the relationship between the carousel's container element and it's connected event interface
     */
    private static events: WeakMap<Element, ICarouselEvent[]> = new WeakMap();

    /**
     * Represents the relationship between the carousel's container element and it's connected control interface
     */
    protected static controls: WeakMap<Element, ICarouselControls> =
        new WeakMap();

    private static thumbnails: WeakMap<Element, Element[]> = new WeakMap();

    /**
     * Represents the element containing the carousel along with other user-interface components
     */
    public container: Element;

    /**
     * Represents the user-interface status that can be overridden by specific user-actions
     */
    private static UIStatus: WeakMap<Element, string> = new WeakMap();

    /**
     * Takes a carousel interface and integrates it with basic play controls
     * @param context ICarousel
     */
    constructor(context: ICarousel) {
        this.container = context.container;

        Carousel.baseInitialize(context, this);
        Carousel.observeContainer(context, this);
    }

    /**
     * Takes the ICarousel interface and uses the container element as a key to establish a new context to the interface. Next, a new watch callback is established that will notify observers on each rotation.
     * @param context ICarousel
     */
    private static baseInitialize(context: ICarousel, carousel: Carousel) {
        Carousel.context.set(context.container, context);
        Carousel.events.set(context.container, []);

        context.watch(() => {
            Carousel.push(context, "rotation");
        });
    }

    /**
     * Sets the user-interface status to "play". Represents the result of activating a play button.
     * @param container Element
     */
    private static setUIStatusToPlay(container: Element): void {
        this.UIStatus.set(container, "play");
    }

    /**
     * Sets the user-interface status to "pause". Represents the result of activating a pause button.
     * @param container Element
     */
    private static setUIStatusToPause(container: Element): void {
        this.UIStatus.set(container, "pause");
    }

    /**
     * Returns whether the current user-interface status is "play".
     * @param container Element
     * @returns boolean
     */
    private static isUIStatusPlay(container: Element): boolean {
        return this.UIStatus.get(container) === "play";
    }

    /**
     * Returns whether the current user-interface status is "pause".
     * @param container Element
     * @returns boolean
     */
    private static isUIStatusPause(container: Element): boolean {
        return this.UIStatus.get(container) === "pause";
    }

    /**
     * Filters through all events matching a specified name and invokes the handler callback function
     * @param context ICarousel
     * @param name string
     */
    protected static push(context: ICarousel, name: string): void {
        const events = Carousel.events.get(context.container);

        events
            .filter((event) => event.name === name)
            .forEach((event) =>
                event.handler(
                    context.currentIndex(),
                    context.prevIndex(),
                    context.nextIndex()
                )
            );
    }

    /**
     * Adds an event to be captured where a handler callback function can be invoked
     * @param name string
     * @param handler function
     */
    public on(
        name: string,
        handler: (
            currentIndex: number,
            prevIndex: number,
            nextIndex: number
        ) => void
    ): void {
        const events = Carousel.events.get(this.container);

        events.push({
            name: name,
            handler: handler
        });
    }

    /**
     * Removes an event from being captured
     * @param name string
     * @param handler function
     */
    public off(
        name: string,
        handler: (
            currentIndex: number,
            prevIndex: number,
            nextIndex: number
        ) => void
    ): void {
        const events = Carousel.events.get(this.container);

        const result = events.find(
            (event) => event.name === name && event.handler === handler
        );

        const index = events.indexOf(result);

        events.splice(index, 1);
    }

    /**
     * Takes the carousel's container element as a key to look up it's connected carousel interface and returns the interface.
     * @param container Element
     * @returns ICarousel
     */
    protected static getContext(container: Element): ICarousel {
        return this.context.get(container);
    }

    /**
     * Takes the ICarousel interface and reads in any available key-value pairs from the "data-carousel-config" HTML attribute into an attribute processor.
     * @param context ICarousel
     */
    private static updateAttributes(
        context: ICarousel,
        carousel: Carousel
    ): void {
        const config = context.container.getAttribute("data-carousel-config");

        if (config) {
            try {
                carousel.processAttributes(JSON.parse(config), context);
            } catch (error) {
                console.warn(error);
            }
        }
    }

    /**
     * Takes the ICarouselConfig interface and converts key-value pairs into a string representation of the carousel configuration. This configuration replaces the previous configuration on data-carousel-config attribute.
     * @param config ICarouselConfig
     */
    public setAttributes(config: ICarouselConfig): void {
        const container = this.container as HTMLElement;

        try {
            container.dataset.carouselConfig = JSON.stringify(config);
        } catch (error) {
            console.warn(error);
        }
    }

    /**
     * Takes an ICarouselConfig interface along with an ICarousel interface and processes specific keys to operate using its values
     * @param config ICarouselConfig
     * @param context ICarousel
     */
    protected processAttributes(
        config: ICarouselConfig,
        context: ICarousel
    ): void {
        if (config.auto) {
            context.setAuto(config.auto);
        }

        if (config.delay) {
            context.setDelay(config.delay);
        }
    }

    /**
     * Takes the ICarousel interface, creates a new mutation observer on the container element and observes for attribute changes which will call the updateAttributes method
     * @param context ICarousel
     */
    private static observeContainer(context: ICarousel, carousel: Carousel) {
        this.updateAttributes(context, carousel);

        const observer = new MutationObserver((mutationRecords) => {
            Carousel.updateAttributes(context, carousel);
        });

        observer.observe(context.container, {
            attributes: true
        });
    }

    /**
     * Navigates to a designated slide.
     * @param index number
     */
    public goto(index: number): void {
        const context = Carousel.getContext(this.container);

        context.goto(index);
    }

    /**
     * Plays the carousel continuously.
     */
    public play(persistCurrentIndex?: boolean): void {
        const context = Carousel.getContext(this.container);

        context.play(persistCurrentIndex);
    }

    /**
     * Pauses the carousel
     */
    public pause(): void {
        const context = Carousel.getContext(this.container);

        context.pause();
    }

    /**
     * Advances the carousel to the next slide
     */
    public next(): void {
        const context = Carousel.getContext(this.container);

        context.next();
    }

    /**
     * Advances the carousel to the previous slide
     */
    public prev(): void {
        const context = Carousel.getContext(this.container);

        context.prev();
    }

    /**
     * Enables the carousel to play continuously when the carousel's container element intersects the viewport; otherwise, the carousel will automatically pause.
     */
    public autoplay(): void {
        const self = this;
        const context = Carousel.getContext(this.container);
        const id = context.parent.id;

        let controller = false;

        observer(`#${id}`, {
            inRange: (record) => {
                if (!controller) {
                    controller = true;

                    if (!Carousel.isUIStatusPause(this.container)) {
                        self.play(true);
                    }
                }
            },
            outRange: (record) => {
                if (controller) {
                    controller = false;

                    self.pause();
                }
            },
            unObserve: false,
            options: {
                threshold: [0.75]
            }
        });
    }

    /**
     * Enables the carousel to activate the previous and next methods through user-interface components
     */
    public enablePrevNextControls(): void {
        const context = Carousel.getContext(this.container);

        const prevButton = context.container.querySelector(".slide__prev");
        const nextButton = context.container.querySelector(".slide__next");

        prevButton.addEventListener("click", () => {
            Carousel.setUIStatusToPause(this.container);
            this.prev();
        });

        nextButton.addEventListener("click", () => {
            Carousel.setUIStatusToPause(this.container);
            this.next();
        });
    }

    /**
     * Enables the carousel to activate the play and pause methods through user-interface components
     */
    public enablePlayPauseControls(): void {
        const context = Carousel.getContext(this.container);

        const playButton = context.container.querySelector(".slide__play");
        const pauseButton = context.container.querySelector(".slide__pause");

        playButton.addEventListener("click", () => {
            Carousel.setUIStatusToPlay(this.container);
            this.play();
        });

        pauseButton.addEventListener("click", () => {
            Carousel.setUIStatusToPause(this.container);
            this.pause();
        });
    }

    /**
     * Uses the array of thumbnail buttons to locate the previous button with the thumbnail CSS class name and removes it. Then, assigns the CSS class name to the current thumbnail button.
     * @param thumbnailButton Element
     * @param thumbnailButtons Element[]
     */
    protected static updateThumbnailNavigationMarker(
        thumbnailButton: Element,
        thumbnailButtons: Element[]
    ): void {
        const previousButton = thumbnailButtons.find((thumbnailButton) =>
            thumbnailButton.classList.contains(
                Carousel.currentThumbnailCSSClassName
            )
        );

        if (previousButton) {
            previousButton.classList.remove(
                Carousel.currentThumbnailCSSClassName
            );
        }

        if (thumbnailButton) {
            thumbnailButton.classList.add(
                Carousel.currentThumbnailCSSClassName
            );
        }
    }

    /**
     * Takes an thumbnailButton element and extracts the index value from it and navigates the carousel to the specified index
     * @param thumbnailButton Element
     * @param context ICarousel
     */
    protected static updateThumbnailNavigation(
        thumbnailButton: Element,
        context: Carousel
    ): void {
        const index = parseInt(
            thumbnailButton.getAttribute("data-slide-index")
        );

        context.goto(index);
    }

    /**
     * Uses an index number to target a specific thumbnailButton element and then updates the thumbnail navigation marker with that element
     * @param index number
     * @param context ICarousel
     */
    protected static updateThumbnailNavigationMarkerByIndex(
        index: number,
        context: ICarousel
    ): void {
        const hasThumbnailButtons = Carousel.thumbnails.has(context.container);

        if (hasThumbnailButtons) {
            const thumbnailButtons = Carousel.thumbnails.get(context.container);

            const currentButton = thumbnailButtons.find(
                (thumbnailButton) =>
                    parseInt(
                        thumbnailButton.getAttribute("data-slide-index")
                    ) === index
            );

            Carousel.updateThumbnailNavigationMarker(
                currentButton,
                thumbnailButtons
            );
        }
    }

    /**
     * Enables the carousel to activate thumbnail controls through user-interface components
     */
    public enableThumbnailControls(): void {
        const thumbnailButtons = enumerateElements(
            this.container.querySelectorAll(".slide__thumbnail")
        );

        Carousel.thumbnails.set(this.container, thumbnailButtons);

        thumbnailButtons.forEach((thumbnailButton) => {
            thumbnailButton.addEventListener("click", (event) => {
                const currentButton = event.target as Element;

                Carousel.updateThumbnailNavigation(currentButton, this);
                Carousel.updateThumbnailNavigationMarker(
                    currentButton,
                    thumbnailButtons
                );
            });
        });

        const context = Carousel.getContext(this.container);

        this.on("rotation", (currentIndex) =>
            Carousel.updateThumbnailNavigationMarkerByIndex(
                currentIndex,
                context
            )
        );
    }
}
