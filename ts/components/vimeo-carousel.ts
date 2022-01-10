import Player from "@vimeo/player";
import VimeoManager from "shared/ts/utils/vimeo-manager";

import Carousel from "shared/ts/components/carousel";
import IVimeoCarousel from "shared/ts/interfaces/carousel/vimeo-carousel";

import { createElement, elementExists } from "shared/ts/utils/html";

interface IVimeoCarouselRepository {
    /**
     * Represents the initialization status of the Vimeo Carousel as a whole
     */
    isInitialized: boolean;
    /**
     * Represents the relationship between a slide's Vimeo iframe element and it's process state that indicates whether event listeners have been registered
     */
    isIframeProcessed: WeakMap<Element, boolean>;
    /**
     * Represents whether the current Vimeo iframe has been predicted as a background video
     */
    isAutoplay: boolean;
}

export default class VimeoCarousel extends Carousel {
    /**
     * Represents the VimeoManager instance
     */
    protected static vimeoManager: VimeoManager = new VimeoManager();

    /**
     * Represents the relationship between the IVimeoCarousel interface and it's connected IVimeoCarouselRepository interface
     */
    private static vimeoRepository: WeakMap<
        IVimeoCarousel,
        IVimeoCarouselRepository
    > = new WeakMap();

    /**
     * Represents the endpoint URL for the Vimeo Player
     */
    private static vimeoPlayerIframeEndpoint: string =
        'iframe[src^="https://player.vimeo.com/video/"]';

    /**
     * Extends the Carousel's base functionality by allowing Vimeo background video to automatically advance to the next slide once the video finishes.
     * @param elements HTMLList
     */
    constructor(context: IVimeoCarousel) {
        super(context);

        VimeoCarousel.initialize(context);
    }

    /**
     * Takes the IVimeoCarousel interface and creates a connection to a new Vimeo Repository interface and then establishes a watch operation for each rotation
     * @param context VimeoCarousel
     */
    private static initialize(context: IVimeoCarousel): void {
        VimeoCarousel.connectCarouselApiToVimeoRepository(context);
        VimeoCarousel.createWatch(context);
    }

    /**
     * Takes the IVimeoCarousel interface and sets it as a key to create a new Vimeo Repository interface
     * @param context IVimeoCarousel
     */
    private static connectCarouselApiToVimeoRepository(
        context: IVimeoCarousel
    ): void {
        this.vimeoRepository.set(context, {
            isInitialized: false,
            isIframeProcessed: new WeakMap(),
            isAutoplay: false
        });
    }

    /**
     * Takes the IVimeoCarousel interface context and establishes a watch callback for each rotation. For each rotation, the previous and next slide's Vimeo iframe should pause while the current slide should determine if there is a Vimeo iframe element that can be interacted with.
     * @param context IVimeoCarousel
     */
    private static createWatch(context: IVimeoCarousel): void {
        const repo = VimeoCarousel.vimeoRepository.get(context);

        context.watch((currentIndex, previousIndex, nextIndex) => {
            VimeoCarousel.push(context, "rotation");

            const previousSlide = context.children.item(previousIndex);
            VimeoCarousel.pauseVimeo(previousSlide).catch((error) =>
                console.info(error)
            );

            const currentSlide = context.children.item(currentIndex);
            VimeoCarousel.processPosterImage(currentSlide)
                .then(() =>
                    VimeoCarousel.initializeCarouselVimeoApi(context, repo)
                )
                .catch((error) => console.info(error));
            VimeoCarousel.processCurrentVimeoIframe(
                currentSlide,
                context,
                repo
            ).catch(() =>
                VimeoCarousel.initializeCarouselVimeoApi(context, repo)
            );

            const nextSlide = context.children.item(nextIndex);
            VimeoCarousel.processPosterImage(nextSlide).catch((error) =>
                console.info(error)
            );
            VimeoCarousel.pauseVimeo(nextSlide).catch((error) =>
                console.info(error)
            );
        });
    }

    /**
     * If the Vimeo iframe has not been processed yet, initialize the Vimeo iframe and determine if the Vimeo Carousel is initialized. Otherwise, access the current Vimeo iframe and process playback events. The IVimeoCarousel interface will be returned through the Promise resolve state.
     * @param slide Element
     * @param context IVimeoCarousel
     * @param repo IVimeoCarouselRepository
     * @returns Promise<IVimeoCarousel>
     */
    private static processCurrentVimeoIframe(
        slide: Element,
        context: IVimeoCarousel,
        repo: IVimeoCarouselRepository
    ): Promise<IVimeoCarousel> {
        return new Promise<IVimeoCarousel>((resolve, reject) => {
            if (!repo.isIframeProcessed.has(slide)) {
                repo.isIframeProcessed.set(slide, true);

                VimeoCarousel.initializeVimeoIframe(slide, context, repo)
                    .then((context) => {
                        VimeoCarousel.manageAutoPlayEvent(slide, context, repo);

                        if (!repo.isInitialized) {
                            VimeoCarousel.initializeCarouselVimeoApi(
                                context,
                                repo
                            );
                            resolve(context);
                        }
                    })
                    .catch((error) => {
                        VimeoCarousel.fallbackAutoPlayEvent(context);
                        reject(error);
                    });
            } else {
                VimeoCarousel.getVimeoIframeOrCreate(slide)
                    .then((iframe) => {
                        VimeoCarousel.setVimeoAutoplayStatus(
                            iframe,
                            context,
                            repo
                        );
                        VimeoCarousel.manageAutoPlayEvent(slide, context, repo);
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    /**
     * Takes a placeholder element and attempts to retrieve the 9-digit Vimeo Id by either the `data-vimeo-carousel-id`, `data-vimeo-id`. If obtainable, the 9-digit Vimeo Id is returned; otherwise, null is returned.
     * @param placeholder Element
     * @returns string | null
     */
    private static getVimeoIdByPlaceholder(
        placeholder: Element
    ): string | null {
        if (placeholder.hasAttribute("data-vimeo-carousel-id")) {
            const match =
                placeholder
                    .getAttribute("data-vimeo-carousel-id")
                    .match(/^\d{9}/i) ?? [];

            if (match.length === 1) {
                return match.shift();
            }
        }

        if (placeholder.hasAttribute("data-vimeo-id")) {
            return this.vimeoManager.getIdByUrl(
                placeholder.getAttribute("data-vimeo-id")
            );
        }

        if (placeholder.hasAttribute("data-vimeo-url")) {
            return this.vimeoManager.getIdByUrl(
                placeholder.getAttribute("data-vimeo-url")
            );
        }
    }

    /**
     * Takes a slide element and returns the Vimeo placeholder element.
     * @param slide Element
     * @returns Element
     */
    private static getVimeoPlaceholderBySlide(slide: Element): Element {
        return (
            slide.querySelector("[data-vimeo-carousel-id]") ??
            slide.querySelector("[data-vimeo-id]") ??
            slide.querySelector("[data-vimeo-url]")
        );
    }

    /**
     * Takes a slide element and determines if a poster image element hasn't been inserted into the document. If determined, a new image element will be created and referenced to the poster thumbnail image that is associated with the Vimeo Id. The created image will then be inserted into the document next to the Vimeo Iframe element.
     * @param slide Element
     */
    private static processPosterImage(slide: Element): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!elementExists(slide.querySelector("img"))) {
                const placeholder = this.getVimeoPlaceholderBySlide(slide);
                const iframe = slide.querySelector("iframe");

                const id =
                    this.vimeoManager.getIdByIframe(iframe) ??
                    this.getVimeoIdByPlaceholder(placeholder);

                this.vimeoManager
                    .generatePosterImage(id)
                    .then((image) => {
                        const img = createElement("img", {
                            src: image,
                            alt: ""
                        });

                        if (elementExists(iframe)) {
                            iframe.insertAdjacentElement("beforebegin", img);
                        }

                        if (elementExists(placeholder)) {
                            placeholder.insertAdjacentElement(
                                "afterbegin",
                                img
                            );
                        }

                        img.onload = (event) => resolve();
                        img.onerror = (event) => reject(event);
                    })
                    .catch((error) =>
                        console.warn(
                            `The poster image could not be obtained for Vimeo Id ${id}`
                        )
                    );
            } else {
                resolve();
            }
        });
    }

    /**
     * Enables the autoplay status and attempts to play the current Vimeo iframe if the Vimeo iframe is a background video.
     * @param slide Element
     * @param context IVimeoCarousel
     * @param repo IVimeoCarouselRepository
     */
    private static manageAutoPlayEvent(
        slide: Element,
        context: IVimeoCarousel,
        repo: IVimeoCarouselRepository
    ) {
        if (repo.isAutoplay) {
            context.setAuto(true);
            VimeoCarousel.playVimeo(slide).catch((error) =>
                VimeoCarousel.fallbackAutoPlayEvent(context)
            );
        }
    }

    /**
     * Determines if the Slide auto play mode is enabled and invokes the play method while persisting the current index.
     * @param context IVimeoCarousel
     */
    private static fallbackAutoPlayEvent(context: IVimeoCarousel): void {
        if (context.isAuto()) {
            context.play(true);
        }
    }

    /**
     * Fetches the Vimeo iframe element along with the Vimeo Player and determines if the Vimeo iframe contains a background video; then, it processes the Vimeo Player event listeners. If a Vimeo iframe element could not be found, attempt to determine if a Vimeo iframe element will be available through the placeholder element. The IVimeoCarousel interface object will be returned through the Promise resolve state. Through the Promise reject state, an error response will be logged if the Vimeo iframe could not be loaded or if there is no placeholder for a Vimeo iframe element.
     * @param slide Element
     * @param context IVimeoCarousel
     * @returns Promise<IVimeoCarousel>
     */
    private static initializeVimeoIframe(
        slide: Element,
        context: IVimeoCarousel,
        repo: IVimeoCarouselRepository
    ): Promise<IVimeoCarousel> {
        return new Promise<IVimeoCarousel>((resolve, reject) => {
            VimeoCarousel.getVimeoIframeOrCreate(slide)
                .then((iframe) => {
                    VimeoCarousel.getVimeoPlayer(iframe).then((player) => {
                        VimeoCarousel.setVimeoAutoplayStatus(
                            iframe,
                            context,
                            repo
                        );
                        VimeoCarousel.processVimeoPlayerEvent(
                            player,
                            context,
                            repo
                        );
                    });

                    resolve(context);
                    iframe.onerror = () =>
                        reject({
                            message: `Vimeo iframe initialization failure`,
                            slide: slide
                        });
                })
                .catch((error) => {
                    VimeoCarousel.processPlaceholder(slide, context, repo);
                    reject(error);
                });
        });
    }

    /**
     * Creates a new Vimeo Player instance using the placeholder element [data-vimeo-id] attribute along with the element id. Afterwards, processes the Vimeo autoplay status and events.
     * @param slide Element
     * @param context IVimeoCarousel
     * @param repo IVimeoCarouselRepository
     */
    private static processPlaceholder(
        slide: Element,
        context: IVimeoCarousel,
        repo: IVimeoCarouselRepository
    ): void {
        const placeholder = this.getVimeoPlaceholderBySlide(slide);

        if (elementExists(placeholder)) {
            if (
                placeholder.hasAttribute("data-vimeo-id") ||
                placeholder.hasAttribute("data-vimeo-url")
            ) {
                const elementId = placeholder.id;
                const vimeoId =
                    this.vimeoManager.getIdByUrl(
                        placeholder.getAttribute("data-vimeo-id")
                    ) ??
                    this.vimeoManager.getIdByUrl(
                        placeholder.getAttribute("data-vimeo-url")
                    );
                const player = VimeoCarousel.vimeoManager.createPlayerById(
                    elementId,
                    vimeoId
                );

                VimeoCarousel.setVimeoAutoplayStatus(
                    placeholder,
                    context,
                    repo
                );
                VimeoCarousel.processVimeoPlayerEvent(player, context, repo);
            }
        }
    }

    /**
     * Takes an element, either a placeholder element or a Vimeo iframe element, and determines if the Vimeo Player is a background video.
     * @param element Element
     * @param context IVimeoCarousel
     * @param repo IVimeoCarouselRepository
     */
    private static setVimeoAutoplayStatus(
        element: Element,
        context: IVimeoCarousel,
        repo: IVimeoCarouselRepository
    ) {
        if (element.hasAttribute("src")) {
            const src = element.getAttribute("src");

            repo.isAutoplay = src.match("background=1") ? true : false;
            return;
        }

        if (element.hasAttribute("data-vimeo-background")) {
            const attr = element.getAttribute("data-vimeo-background");

            repo.isAutoplay = attr.match("true") ? true : false;
            return;
        }

        repo.isAutoplay = false;
    }

    /**
     * Takes the Vimeo Player and adds the "ended" event listener. When this event fires, access the next slide through the IVimeoCarousel interface object and attempt to restart the Vimeo iframe element. If a Vimeo iframe element is within the next slide and the Slide is in autoplay mode, advance the Slide by one; otherwise, if the Slide is in autoplay mode, enable autoplay.
     * @param player Player
     * @param context IVimeoCarousel
     * @param repo IVimeoCarouselRepository
     */
    private static processVimeoPlayerEvent(
        player: Player,
        context: IVimeoCarousel,
        repo: IVimeoCarouselRepository
    ) {
        player.on("play", (data) => {
            if (context.isAuto()) {
                context.pause();
                context.setAuto(true);
            }
        });

        player.on("ended", (data) => {
            const nextSlide = context.children.item(context.nextIndex());

            VimeoCarousel.restartVimeo(nextSlide)
                .then(() => {
                    if (context.isAuto()) {
                        context.play();
                    }
                })
                .catch(() => {
                    if (context.isAuto()) {
                        context.play();
                    }
                });
        });
    }

    /**
     * Takes the IVimeoCarousel interface object along with it's connected repository. The repository's initialization status is set to true and the slide's root element receives the "slide--ready-for-vimeo" CSS class name.
     * @param context IVimeoCarousel
     * @param repo IVimeoCarouselRepository
     */
    private static initializeCarouselVimeoApi(
        context: IVimeoCarousel,
        repo: IVimeoCarouselRepository
    ) {
        if (!repo.isInitialized) {
            repo.isInitialized = true;
            context.container.classList.add("slide--ready-for-vimeo");
        }
    }

    /**
     * Takes a slide element and returns the Vimeo iframe element. Either the existing Vimeo iframe element will be returned or a new Vimeo iframe element will be created. The Vimeo iframe element will be returned through the Promise resolve state. Through the Promise reject state, an error response will be logged either when the Vimeo iframe element could not be created or when the placeholder doesn't contain the [data-vimeo-carousel-id] attribute.
     * @param slide Element
     * @returns Promise<HTMLIFrameElement>
     */
    private static getVimeoIframeOrCreate(
        slide: Element
    ): Promise<HTMLIFrameElement> {
        return new Promise<HTMLIFrameElement>((resolve, reject) => {
            VimeoCarousel.getVimeoIframe(slide)
                .then((iframe) => resolve(iframe))
                .catch((error) => {
                    const placeholder = slide.querySelector(
                        "[data-vimeo-carousel-id]"
                    );

                    if (elementExists(placeholder)) {
                        VimeoCarousel.createIframe(placeholder)
                            .then((iframe) => {
                                VimeoCarousel.setIframeByPlaceholder(
                                    placeholder,
                                    iframe
                                );
                                resolve(iframe);
                            })
                            .catch((error) =>
                                reject(
                                    `A Vimeo iframe could not be created. Reason: ${error}`
                                )
                            );
                    } else {
                        reject({
                            message:
                                "[data-vimeo-carousel-id] was not found within the current slide",
                            slide: slide
                        });
                    }
                });
        });
    }

    /**
     * Takes a slide element and returns a Vimeo iframe element if the element exists.
     * @param slide Element
     * @returns Promise<HTMLIFrameElement>
     */
    private static getVimeoIframe(slide: Element): Promise<HTMLIFrameElement> {
        return new Promise<HTMLIFrameElement>((resolve, reject) => {
            const iframe = slide.querySelector(
                VimeoCarousel.vimeoPlayerIframeEndpoint
            ) as HTMLIFrameElement;

            elementExists(iframe)
                ? resolve(iframe)
                : reject({
                      message:
                          "Vimeo iframe element was not found within the current slide",
                      slide: slide
                  });
        });
    }

    /**
     * Takes a Vimeo iframe element and returns it's connected player either from the Vimeo Player WeakMap repository or by new creation. The Vimeo Player is returned through the Promise resolve state. Through the Promise reject state, an error response, indicating the Vimeo Player could not be created, will be returned.
     * @param iframe HTMLIFrameElement
     * @returns Promise<Player>
     */
    private static getVimeoPlayer(iframe: HTMLIFrameElement): Promise<Player> {
        return new Promise<Player>((resolve, reject) => {
            const player =
                VimeoCarousel.vimeoManager.getPlayerByIframe(iframe) ??
                VimeoCarousel.vimeoManager.createPlayerByIframe(iframe);

            if (player) {
                resolve(player);
            } else {
                reject("A Vimeo Player instance could not be created.");
            }
        });
    }

    /**
     * Takes a slide element and attempts to play a Vimeo video. If the Vimeo iframe is found, the video will restart before it plays. The Player will be returned through the Promise resolve state. Through the Promise reject state, the error response will be returned either when the Vimeo video could not be restarted or when the Vimeo video could not play.
     * @param slide
     * @returns Promise<Player>
     */
    private static playVimeo(slide: Element): Promise<Player> {
        return new Promise<Player>((resolve, reject) => {
            VimeoCarousel.restartVimeo(slide)
                .then((player) => {
                    player
                        .play()
                        .then(() => resolve(player))
                        .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Takes a slide element and attempts to restart a Vimeo video. The Player will be returned through the Promise resolve state. Through the Promise reject state, an error response will be returned either when the Vimeo iframe element could not be returned, when the Vimeo Player could not be returned or when the Vimeo video could not be restarted.
     * @param slide Element
     * @returns Promise<Player>
     */
    private static restartVimeo(slide: Element): Promise<Player> {
        return new Promise<Player>((resolve, reject) => {
            VimeoCarousel.getVimeoIframeOrCreate(slide)
                .then((iframe) => {
                    VimeoCarousel.getVimeoPlayer(iframe)
                        .then((player) => {
                            player
                                .setCurrentTime(0)
                                .catch((error) => reject(error));
                            resolve(player);
                        })
                        .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Takes a slide element and attempts to pause a Vimeo video. If the Vimeo iframe is found, the video will restart before it pauses. The Player will be returned through the Promise resolve state. Through the Promise reject state, an error response will be returned either when the Vimeo video could not be restarted or when the Vimeo video could not be paused.
     * @param slide HTMLElement
     * @returns Promise<Player>
     */
    private static pauseVimeo(slide: Element): Promise<Player> {
        return new Promise<Player>((resolve, reject) => {
            this.restartVimeo(slide)
                .then((player) => {
                    player.pause().catch((error) => reject(error));
                    resolve(player);
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Create a method that takes a placeholder element with the [data-vimeo-carousel-id] attribute and creates a new Vimeo iframe element and Vimeo Player object using an Vimeo Id number extraction. The Vimeo iframe element is returned through the Promise resolve state. Through the Promise reject state, an error response is logged when the Vimeo iframe element could not be created.
     * @param element HTMLElement
     * @returns Promise<HTMLIFrameElement>
     */
    private static createIframe(element: Element): Promise<HTMLIFrameElement> {
        return new Promise<HTMLIFrameElement>((resolve, reject) => {
            const id = element.getAttribute("data-vimeo-carousel-id");

            VimeoCarousel.vimeoManager
                .createIframeById(id)
                .then((iframe) => {
                    VimeoCarousel.vimeoManager.createPlayerByIframe(iframe);

                    resolve(iframe);
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Takes a Vimeo iframe element and appends it to the placeholder element.
     * @param element HTMLElement
     * @param iframe HTMLIFrameElement
     */
    private static setIframeByPlaceholder(
        element: Element,
        iframe: HTMLIFrameElement
    ): void {
        if (elementExists(element)) {
            element.appendChild(iframe);
        }
    }

    /**
     * Resumes playing the Vimeo video and then advances to the next slide.
     */
    public play(persistCurrentIndex?: boolean): void {
        const context = VimeoCarousel.getContext(
            this.container
        ) as IVimeoCarousel;

        context.setAuto(true);

        const currentSlide = context.children.item(context.currentIndex());

        VimeoCarousel.getVimeoIframe(currentSlide)
            .then((iframe) => {
                VimeoCarousel.getVimeoPlayer(iframe).then((player) => {
                    player.play().catch((error) => console.warn(error));
                });
            })
            .catch((error) => {
                context.play(persistCurrentIndex);
            });
    }

    /**
     * Pauses the Vimeo video and the carousel
     */
    public pause(): void {
        const context = VimeoCarousel.getContext(
            this.container
        ) as IVimeoCarousel;

        context.pause();

        const currentSlide = context.children.item(context.currentIndex());

        VimeoCarousel.getVimeoIframe(currentSlide).then((iframe) => {
            VimeoCarousel.getVimeoPlayer(iframe).then((player) => {
                player.pause().catch((error) => console.warn(error));
            });
        });
    }
}
