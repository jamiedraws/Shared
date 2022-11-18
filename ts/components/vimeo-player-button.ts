import { IVimeoManagerPosterImageSpecification } from "Shared/ts/interfaces/vimeo-manager";
import IVimeoPlayerButtonConfig, {
    VimeoPlayerButtonInitializationTask as VimeoPlayerButtonInitializationResponseTask
} from "Shared/ts/interfaces/vimeo-player-button";
import { IVimeoPosterPlayerPlaceholder } from "Shared/ts/interfaces/vimeo-poster-player";
import { isString } from "Shared/ts/utils/data";
import { elementExists } from "Shared/ts/utils/html";
import VimeoPosterPlayer from "Shared/ts/components/vimeo-poster-player";

export default class VimeoPlayerButton {
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
     * Represets the relationship between the VimeoPlayerButton instance and the VimeoPosterPlayer instance
     */
    private static vimeoPosterPlayer: WeakMap<
        VimeoPlayerButton,
        VimeoPosterPlayer
    > = new WeakMap();

    /**
     * Takes a namespace, a selector and an attribute to establish a GUI where a custom button is able to control the Vimeo Player iframe element.
     * @param config IVimeoPosterPlayerConfig
     */
    constructor(config?: IVimeoPlayerButtonConfig) {
        this.selector = config?.selector ?? `.vimeo-poster-player`;
        this.attribute = config?.attribute ?? "data-src-iframe";
        this.namespace = config?.namespace ?? "vimeo-player-button";
        this.imageSpecs = config?.imageSpecs;

        VimeoPlayerButton.vimeoPosterPlayer.set(
            this,
            new VimeoPosterPlayer({
                selector: this.selector,
                attribute: this.attribute,
                imageSpecs: this.imageSpecs
            })
        );
    }

    /**
     * Takes the current context and returns the current VImeoPosterPlayer instance
     * @param context VimeoPlayerButton
     * @returns VimeoPosterPlayer
     */
    private static getVimeoPosterPlayerByContext(
        context: VimeoPlayerButton
    ): VimeoPosterPlayer | undefined {
        return this.vimeoPosterPlayer.get(context);
    }

    /**
     * Takes the response object from the VimeoPosterPlayer instance and queries the button element and passes that into a controller.
     * @param response IVimeoPosterPlayerPlaceholder
     * @param context VimeoPlayerButton
     */
    private static processVimeoPlayerPlaceholderResponse(
        response: IVimeoPosterPlayerPlaceholder,
        context: VimeoPlayerButton
    ): void {
        const id = response.placeholder.id;

        if (!isString(id)) {
            console.warn({
                message: `A unique id is required to be assigned to the placeholder element in order for the button to control it.`,
                for: response.placeholder
            });
        }

        if (isString(id)) {
            const button = document.querySelector(
                `button[aria-controls="${response.placeholder.id}"]`
            );

            if (button && elementExists(button)) {
                this.controlVimeoByButton(button, response, context);
            } else {
                console.warn({
                    message: `A unique id reference through the aria-controls attribute is required to be assigned to the button element in order to control the placeholder.`,
                    for: response.placeholder
                });
            }
        }
    }

    /**
     * Takes the button element, the response object from the VimeoPosterPlayer instance and the current context to manage the necessary event listeners.
     * @param button Element
     * @param response IVimeoPosterPlayerPlaceholder
     * @param context VimeoPlayerButton
     */
    private static controlVimeoByButton(
        button: Element,
        response: IVimeoPosterPlayerPlaceholder,
        context: VimeoPlayerButton
    ): void {
        const vimeoPosterPlayer =
            VimeoPlayerButton.getVimeoPosterPlayerByContext(context);

        if (!vimeoPosterPlayer) return;

        let isPlaying = false;

        button.addEventListener("click", () => {
            vimeoPosterPlayer.hidePoster(response.placeholder);

            isPlaying ? response.player.pause() : response.player.play();
        });

        response.player.on("playing", () => {
            isPlaying = true;

            vimeoPosterPlayer.hidePoster(response.placeholder);

            button.setAttribute("aria-label", "Pause video");
            button.classList.add(`${context.namespace}__play--is-playing`);
        });

        response.player.on("pause", () => {
            isPlaying = false;

            button.setAttribute("aria-label", "Play video");
            button.classList.remove(`${context.namespace}__play--is-playing`);
        });

        response.player.on("loaded", () => {
            button.removeAttribute("disabled");
        });
    }

    /**
     * Uses the selector name to capture the Vimeo Player iframe element within the placeholder element and establishes the Vimeo poster image along with the Vimeo Player instance. Then, the button is registered through all of the necessary events.
     */
    public initializeOnCapture(
        task?: VimeoPlayerButtonInitializationResponseTask
    ): void {
        const vimeoPosterPlayer =
            VimeoPlayerButton.getVimeoPosterPlayerByContext(this);

        if (!vimeoPosterPlayer) return;

        vimeoPosterPlayer.initializeOnCapture((response) => {
            VimeoPlayerButton.processVimeoPlayerPlaceholderResponse(
                response,
                this
            );

            if (!task) return;

            task(response);
        });
    }

    /**
     * Uses the selector name to query the Vimeo Player iframe element within the placeholder element and establishes the Vimeo poster image along with the Vimeo Player instance. Then, the button is registered through all of the necessary events.
     */
    public initialize(
        task?: VimeoPlayerButtonInitializationResponseTask
    ): void {
        const vimeoPosterPlayer =
            VimeoPlayerButton.getVimeoPosterPlayerByContext(this);

        if (!vimeoPosterPlayer) return;

        vimeoPosterPlayer.initialize((response) => {
            VimeoPlayerButton.processVimeoPlayerPlaceholderResponse(
                response,
                this
            );

            if (!task) return;

            task(response);
        });
    }
}
