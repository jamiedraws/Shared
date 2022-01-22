// https://www.npmjs.com/package/@types/youtube

// interfaces
import { YouTubePosterImageSize } from "Shared/ts/interfaces/youtube-manager";

// patterns
import PubSub from "Shared/ts/patterns/pubsub";

// utils
import { createElement, elementExists } from "Shared/ts/utils/html";
import { createAppendScript } from "Shared/ts/utils/resource";

declare global {
    function onYouTubeIframeAPIReady(): void;
}

export default class YouTubeManager {
    /**
     * Represents the network endpoint for the YouTube Player Api
     */
    private static youTubePlayerApiEndPoint: string =
        "https://www.youtube.com/iframe_api";

    /**
     * Represents the network endpoint for the YouTube Player Iframe Embed
     */
    private static youTubeIframeEmbedEndPoint: string =
        "http://www.youtube.com/embed/";

    /**
     * Represents the URL structure for a YouTube thumbnail image
     */
    private static youTubeThumbnailUrlFormat: string =
        "https://i.ytimg.com/vi/{{Id}}/{{Size}}.jpg";

    /**
     * Represents the relationship between the YouTube iframe element and the YouTube Player instance that it is connected to
     */
    protected static playerRepo: WeakMap<HTMLIFrameElement, YT.Player> =
        new WeakMap();

    /**
     * Represents the relationship between the YouTube Player instance and the YouTube iframe element that it is connected to
     */
    protected static iframeRepo: WeakMap<YT.Player, HTMLIFrameElement> =
        new WeakMap();

    /**
     * Represents a collection of subscribed tasks that can be published from the YouTube Api's initialization function
     */
    private static taskQueue: PubSub = new PubSub();

    /**
     * Creates a manager interface providing the ability to create, set and get a YouTube iframe and get a YouTube Player instance
     */
    constructor() {
        if (!this.hasPlayerInstalled()) {
            this.requestPlayer();
        }

        globalThis.onYouTubeIframeAPIReady = () => {
            YouTubeManager.taskQueue.publish("YouTubeIframeAPIReady", null);
        };
    }

    /**
     * Creates a new script element with a source pointing to the 3rd-party YouTube Player SDK file
     * @returns Promise
     */
    public requestPlayer(): Promise<string> {
        const context = this;

        return new Promise<string>((resolve, reject) => {
            if (!context.hasPlayerInstalled()) {
                const player = createAppendScript(
                    YouTubeManager.youTubePlayerApiEndPoint
                );
                player.onload = () => resolve(`success`);
                player.onerror = () =>
                    reject(
                        `The request to ${YouTubeManager.youTubePlayerApiEndPoint} could not be completed.`
                    );
            }
        });
    }

    /**
     * Determines if the 3rd-party YouTube Player Api file exists in the document
     * @returns boolean
     */
    public hasPlayerInstalled(): boolean {
        return elementExists(
            document.querySelector(
                `script[src^="${YouTubeManager.youTubePlayerApiEndPoint}"]`
            )
        );
    }

    /**
     * Reads in the YouTube iframe element's source value and determines if it contains the parameter key value pair of enablejsapi=1
     * @param iframe HTMLIFrameElement
     * @returns boolean
     */
    private static isJsApiEnabled(iframe: HTMLIFrameElement): boolean {
        const result = iframe.src.match(/enablejsapi=1/gi) ?? [];

        return result.length === 1;
    }

    /**
     * Takes the YouTube iframe element and ensures the parameter key value pair of enablejsabi=1 is present in the iframe's source value
     * @param iframe HTMLIFrameElement
     * @returns HTMLIFrameElement
     */
    private static enableJsApiToIframe(
        iframe: HTMLIFrameElement
    ): HTMLIFrameElement {
        if (!this.isJsApiEnabled(iframe)) {
            const parameters = iframe.src.match(/\?/g) ?? [];
            const operator = parameters.length === 1 ? "&" : "?";

            iframe.src += `${operator}enablejsapi=1`;
        }

        return iframe;
    }

    /**
     * Uses the YouTube video id to create a YouTube iframe element
     * @param id string
     * @returns HTMLIFrameElement
     */
    public createIframeById(id: string): HTMLIFrameElement {
        return createElement("iframe", {
            src: `${YouTubeManager.youTubeIframeEmbedEndPoint}${id}`
        }) as HTMLIFrameElement;
    }

    /**
     * Creates a new YouTube Player instance by using the YouTube iframe element. A promise is returned where the YT.Player is resolved; otherwise, an error status is rejected.
     * @param iframe HTMLElement
     * @returns Promise<YT.Player>
     */
    public createPlayerByIframe(iframe: HTMLElement): Promise<YT.Player> {
        const target = YouTubeManager.enableJsApiToIframe(
            iframe as HTMLIFrameElement
        );

        return new Promise<YT.Player>((resolve, reject) => {
            YouTubeManager.taskQueue.subscribe("YouTubeIframeAPIReady", () => {
                const player = new YT.Player(target, {
                    events: {
                        onReady: (event) => {
                            YouTubeManager.setPlayerByIframe(target, player);

                            resolve(player);
                        },
                        onError: (event) => reject(event)
                    }
                });
            });
        });
    }

    /**
     * Takes the YouTube iframe element and the YouTube Player instance and connects each to their respective WeakMap repository.
     * @param iframe HTMLIFrameElement
     * @param player YT.Player
     */
    private static setPlayerByIframe(
        iframe: HTMLIFrameElement,
        player: YT.Player
    ): void {
        this.playerRepo.set(iframe, player);
        this.iframeRepo.set(player, iframe);
    }

    /**
     * Creates a new YouTube Player instance by using the YouTube iframe element id. A promise is returned where the YT.Player is resolved; otherwise, an error status is rejected.
     * @param id string
     * @returns Promise<YT.Player>
     */
    public createPlayerById(id: string): Promise<YT.Player> {
        return new Promise<YT.Player>((resolve, reject) => {
            const iframe = document.getElementById(id) as HTMLIFrameElement;

            if (elementExists(iframe)) {
                this.createPlayerByIframe(iframe)
                    .then((player) => resolve(player))
                    .catch((error) => reject(error));
            } else {
                reject({
                    message: `The YouTube iframe element could not be found using the provided id`,
                    id
                });
            }
        });
    }

    /**
     * Takes the YouTube iframe element as a key to look up it's connected YouTube Player instance through the YouTube Player WeakMap repository.
     * @param iframe HTMLIFrameElement
     * @returns YT.Player
     */
    public getPlayerByIframe(iframe: HTMLIFrameElement): YT.Player | undefined {
        return YouTubeManager.playerRepo.get(iframe);
    }

    /**
     * Takes the YouTube Player instance as a key to look up it's connected YouTube iframe element through the YouTube iframe WeakMap repository.
     * @param player YT.Player
     * @returns HTMLIFrameElement
     */
    public getIframeByPlayer(player: YT.Player): HTMLIFrameElement | undefined {
        return YouTubeManager.iframeRepo.get(player);
    }

    /**
     * Takes a YouTube Iframe element and extracts the YouTube Id
     * @param iframe HTMLElement
     * @returns string | null
     */
    public getIdByIframe(iframe: HTMLElement): string | undefined {
        return elementExists(iframe)
            ? this.getIdByUrl(iframe.getAttribute("src") ?? "")
            : undefined;
    }

    /**
     * Takes a YouTube Player URL and extracts the YouTube Id
     * @param url string
     * @returns string | null
     */
    public getIdByUrl(url: string): string | undefined {
        let id = undefined;

        const match = url.match(/youtube.com\/embed\/(?:[^?]*)/gi) ?? [];

        if (match.length === 1) {
            id = match
                .shift()
                ?.split(/youtube.com\/embed\//)
                .pop();
        }

        return id;
    }

    /**
     * Takes the YouTube Id along with a value from the YouTubePosterImageSize enum, representing one of the available sizes, to generate the URL for the YouTube poster image
     * @param id string
     * @param size YouTubePosterImageSize
     * @returns string
     */
    public generatePosterImage(
        id: string,
        size: YouTubePosterImageSize
    ): string {
        return YouTubeManager.youTubeThumbnailUrlFormat
            .replace("{{Id}}", id)
            .replace("{{Size}}", size);
    }
}
