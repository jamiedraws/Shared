import Player from "@vimeo/player";
import { IVimeoManagerPosterImageSpecification } from "Shared/ts/interfaces/vimeo-manager";
import IVimeoPosterPlayerConfig, {
    IVimeoPosterPlayerInitializationResponseTask,
    IVimeoPosterPlayerPlaceholder
} from "Shared/ts/interfaces/vimeo-poster-player";
import { observer } from "Shared/ts/observers/intersection";
import CaptureElement from "Shared/ts/utils/capture-element";
import {
    createElement,
    elementExists,
    enumerateElements
} from "Shared/ts/utils/html";
import VimeoManager from "Shared/ts/utils/vimeo-manager";

export default class VimeoPosterPlayer {
    /**
     * Represents the document query selector name that will be used to capture any potential placeholders
     */
    public selector: string;

    /**
     * Represents a data-attribute namespace that will be used to extract the Vimeo Player iframe URL source
     */
    public attribute: string;

    /**
     * Represents the namespace that will be used to control the GUI elements through CSS class names
     */
    public namespace: string;

    /**
     * Represents a map of image specifications for the width, height and quality
     */
    public imageSpecs: IVimeoManagerPosterImageSpecification | undefined;

    /**
     * Represents a new VimeoManager instance
     */
    private static vimeoManager: VimeoManager = new VimeoManager();

    /**
     * Takes a document query selector name along with a data-attribute namespace to append a Vimeo poster image to the captured placeholder element and connect the Vimeo Player iframe element to a new Vimeo Player instance.
     * @param config IVimeoPosterPlayerConfig
     */
    constructor(config?: IVimeoPosterPlayerConfig) {
        this.selector = config?.selector ?? ".vimeo-poster-player";
        this.attribute = config?.attribute ?? "data-src-iframe";
        this.namespace = config?.namespace ?? "vimeo-poster-player";
        this.imageSpecs = config?.imageSpecs;
    }

    /**
     * Takes an placeholder element and the current context and determines if the Vimeo Player iframe element exists within the current placeholder element. A promise is returned where the Vimeo Player iframe is resolved.
     * @param placeholder Element
     * @param context VimeoPosterPlayer
     * @returns Promise<HTMLIFrameElement>
     */
    private static captureVimeoIframe(
        placeholder: Element,
        context: VimeoPosterPlayer
    ): Promise<HTMLIFrameElement> {
        return new Promise<HTMLIFrameElement>((resolve, reject) => {
            const iframe = placeholder.querySelector(
                `iframe[src="${placeholder.getAttribute(context.attribute)}"]`
            ) as HTMLIFrameElement;

            elementExists(iframe)
                ? resolve(iframe)
                : reject({
                      message:
                          "The Vimeo iframe element could not be found within the current placeholder",
                      for: placeholder
                  });
        });
    }

    /**
     * Registers the selector through the intersection observer web Api. Upon capture, a new Vimeo poster image is created and appended to the captured placeholder. A callback function is executed where the Vimeo Player iframe element is captured by the placeholder. An object containing the Vimeo Player instance along with the captured placeholder element is returned through the promise resolve state.
     */
    public initializeOnCapture(
        task: IVimeoPosterPlayerInitializationResponseTask
    ): void {
        observer(this.selector, {
            inRange: (placeholder) => {
                this.createVimeoPoster(placeholder);

                VimeoPosterPlayer.captureVimeoIframe(placeholder, this)
                    .then((iframe) => {
                        task({
                            placeholder,
                            player: this.connectVimeoPlayerByIframe(iframe)
                        });
                    })
                    .catch((error) => {
                        this.captureVimeoIframe(placeholder)
                            .then((iframe) =>
                                task({
                                    placeholder,
                                    player: this.connectVimeoPlayerByIframe(
                                        iframe
                                    )
                                })
                            )
                            .catch((error) => console.warn(error));
                    });
            }
        });
    }

    /**
     * Takes the placeholder element and updates the CSS class name state to show the poster image
     * @param placeholder Element
     */
    public showPoster(placeholder: Element): void {
        if (elementExists(placeholder)) {
            placeholder.classList.remove(`${this.namespace}--is-ready`);
        }
    }

    /**
     * Takes the placeholder element and updates the CSS class name state to hide the poster image
     * @param placeholder Element
     */
    public hidePoster(placeholder: Element): void {
        if (elementExists(placeholder)) {
            placeholder.classList.add(`${this.namespace}--is-ready`);
        }
    }

    /**
     * Registers the selector through the intersection observer web Api. Upon capture, a new Vimeo poster image is created and appended to the captured placeholder. A callback function is executed where the Vimeo Player iframe element exists within the placeholder. An object containing the Vimeo Player instance along with the captured placeholder element is returned through the promise resolve state. Otherwise, an error message is reported to the console screen stating that the Vimeo iframe element could not be found within the current placeholder.
     */
    public initialize(
        task: IVimeoPosterPlayerInitializationResponseTask
    ): void {
        observer(this.selector, {
            inRange: (placeholder) => {
                this.createVimeoPoster(placeholder);

                VimeoPosterPlayer.captureVimeoIframe(placeholder, this)
                    .then((iframe) =>
                        task({
                            placeholder,
                            player: this.connectVimeoPlayerByIframe(iframe)
                        })
                    )
                    .catch((error) => console.warn(error));
            }
        });
    }

    /**
     * Returns a new promise where the Vimeo Iframe element is captured by the provided placeholder element.
     * @param placeholder Element
     * @returns Promise<HTMLIFrameElement>
     */
    public captureVimeoIframe(
        placeholder: Element
    ): Promise<HTMLIFrameElement> {
        return new Promise<HTMLIFrameElement>((resolve, reject) => {
            const capture = new CaptureElement(placeholder);

            capture.subscribe("childList", (record) => {
                const elements = enumerateElements(record.addedNodes);
                const iframe = elements.find(
                    (element) =>
                        element.getAttribute("src") ===
                        placeholder.getAttribute(this.attribute)
                );

                if (iframe) {
                    capture.disconnect();

                    resolve(iframe as HTMLIFrameElement);
                }
            });

            capture.subscribe("attributes", (record) => {
                if (record.attributeName === "src") {
                    const element = record.target as HTMLElement;

                    if (
                        element.getAttribute("src") ===
                        placeholder.getAttribute(this.attribute)
                    ) {
                        capture.disconnect();

                        resolve(element as HTMLIFrameElement);
                    }
                }
            });
        });
    }

    /**
     * Takes a placeholder element and retrieves the Vimeo Player iframe URL source. This URL is used to create the Vimeo poster image and is then appended to the placeholder element.
     * @param placeholder Element
     */
    public createVimeoPoster(placeholder: Element): void {
        const id = VimeoPosterPlayer.vimeoManager.getIdByUrl(
            placeholder.getAttribute(this.attribute) ?? ""
        );

        if (!id) return;

        VimeoPosterPlayer.vimeoManager
            .generatePosterImage(id, this.imageSpecs)
            .then((poster) => {
                const image = createElement("img", {
                    src: poster,
                    alt: ""
                });

                placeholder.insertAdjacentElement("beforeend", image);
            });
    }

    /**
     * Takes a Vimeo Player iframe element and creates a new Vimeo Player instance. The Vimeo Player instance is returned.
     * @param iframe HTMLIFrameElement
     * @returns Player
     */
    public connectVimeoPlayerByIframe(iframe: HTMLIFrameElement): Player {
        return VimeoPosterPlayer.vimeoManager.createPlayerByIframe(iframe);
    }
}
