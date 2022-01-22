import Player from "@vimeo/player";
import { IVimeoManagerPosterImageSpecification } from "Shared/ts/interfaces/vimeo-manager";
import { enumerateElements, elementExists } from "Shared/ts/utils/html";
import { createAppendScript } from "Shared/ts/utils/resource";

export default class VimeoManager {
    /**
     * Represents the network endpoint for the Vimeo Player SDK library
     */
    private static vimeoPlayerSDKEndPoint: string =
        "https://player.vimeo.com/api/player.js";

    /**
     * Represents the relationship between the Vimeo iframe element and the XMLHttpRequest object that it is connected to
     */
    protected static oEmbedRepo: WeakMap<HTMLIFrameElement, XMLHttpRequest> =
        new WeakMap();

    /**
     * Represents the relationship between the Vimeo iframe element and the Vimeo Player instance that it is connected to
     */
    protected static playerRepo: WeakMap<HTMLIFrameElement, Player> =
        new WeakMap();

    /**
     * Represents the relationship between the Vimeo Player instance and the Vimeo iframe element that it is connected to
     */
    protected static iframeRepo: WeakMap<Player, HTMLIFrameElement> =
        new WeakMap();

    /**
     * Creates a manager interface providing the ability to create, set and get a Vimeo iframe, a Vimeo Player instance and a Vimeo oEmbed object.
     */
    constructor() {}

    /**
     * Uses the Vimeo video id to make an oEmbed request. A promise object is returned where the resolve contains the XMLHttpRequest object.
     * @param id string
     * @returns Promise<XMLHttpRequest>
     */
    private static requestoEmbed(id: string): Promise<XMLHttpRequest> {
        return new Promise<XMLHttpRequest>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.addEventListener("load", () => resolve(xhr));
            xhr.addEventListener("error", () =>
                reject(`The request could not be completed with ${id}`)
            );

            xhr.open(
                "GET",
                `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`
            );

            xhr.send();
        });
    }

    /**
     * Creates a new script element with a source pointing to the 3rd-party Vimeo Player SDK file
     * @returns Promise
     */
    public requestPlayer(): Promise<string> {
        const context = this;

        return new Promise<string>((resolve, reject) => {
            if (!context.hasPlayerInstalled()) {
                const player = createAppendScript(
                    VimeoManager.vimeoPlayerSDKEndPoint
                );
                player.onload = () => resolve(`success`);
                player.onerror = () =>
                    reject(
                        `The request to ${VimeoManager.vimeoPlayerSDKEndPoint} could not be completed.`
                    );
            }
        });
    }

    /**
     * Determines if the 3rd-party Vimeo Player SDK file exists in the document
     * @returns boolean
     */
    public hasPlayerInstalled(): boolean {
        return elementExists(
            document.querySelector(
                `script[src^="${VimeoManager.vimeoPlayerSDKEndPoint}"]`
            )
        );
    }

    /**
     * Uses the Vimeo video id to create a Vimeo iframe element through an oEmbed request.
     * @param id string
     * @returns Promise<HTMLIFrameElement>
     */
    public createIframeById(id: string): Promise<HTMLIFrameElement> {
        const context = this;

        return new Promise<HTMLIFrameElement>((resolve, reject) => {
            const element = document.createElement("div");

            context
                .createoEmbedById(id)
                .then((xhr) => {
                    const response = JSON.parse(xhr.response);
                    element.innerHTML = response.html;

                    const iframe = element.firstChild as HTMLIFrameElement;
                    VimeoManager.oEmbedRepo.set(iframe, xhr);

                    resolve(iframe);
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Uses the Vimeo video id to make an oEmbed request. A promise object is returned where the resolve state contains the oEmbed data stored in an XMLHttpRequest object.
     * @param id string
     * @returns Promise<XMLHttpRequest>
     */
    public createoEmbedById(id: string): Promise<XMLHttpRequest> {
        return new Promise<XMLHttpRequest>((resolve, reject) => {
            VimeoManager.requestoEmbed(id)
                .then((xhr) => resolve(xhr))
                .catch((error) => reject(error));
        });
    }

    /**
     * Takes the Vimeo iframe element as a key to look up it's connected oEmbed data stored in an XMLHttpRequest object via the oEmbed WeakMap Repository.
     * @param iframe HTMLIFrameElement
     * @returns XMLHttpRequest
     */
    public getoEmbedByIframe(
        iframe: HTMLIFrameElement
    ): XMLHttpRequest | undefined {
        return VimeoManager.oEmbedRepo.get(iframe);
    }

    /**
     * Creates a new Vimeo Player instance by using the placeholder element id, the Vimeo video id and an optional object of Vimeo video parameters.
     * @param elementId string
     * @param id string
     * @param options any
     * @returns Player
     */
    public createPlayerById(
        elementId: string,
        id: string,
        options?: any
    ): Player {
        const config = options ?? {};
        config.id = id;

        const player = new Player(elementId, config);
        VimeoManager.setIframePlayerRepo(id, elementId, player);

        return player;
    }

    /**
     * Takes the Vimeo CDN image URL and transforms it by replacing the width by height bit at the end of the URL with query parameters where `mw` represents the width, `mh` represents the height and `q` represents the quality. The transformed URL is returned.
     * @param url string
     * @param width string
     * @param height string
     * @param quality string
     * @returns string
     */
    private static transformPosterImageUrl(
        url: string,
        width: string,
        height: string,
        quality: string
    ): string {
        let path = url.split(/_\d{1,5}|x\d{1,5}/g)[0];

        path = `${path}?mw=${width}&mh=${height}&q=${quality}`;

        return path;
    }

    /**
     * Takes a Vimeo Id and returns the current Vimeo poster thumbnail image.
     */
    public generatePosterImage(
        id: string,
        imageSpecs?: IVimeoManagerPosterImageSpecification
    ): Promise<string> {
        const context = this;

        return new Promise<string>((resolve, reject) => {
            context
                .createoEmbedById(id)
                .then((response) => {
                    const data = JSON.parse(response.response);

                    const image = VimeoManager.transformPosterImageUrl(
                        data.thumbnail_url,
                        imageSpecs?.width ?? data.width,
                        imageSpecs?.height ?? data.height,
                        imageSpecs?.quality ?? "70"
                    );
                    resolve(image);
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Takes a Vimeo Iframe element and extracts the 9-digit Vimeo Id
     * @param iframe HTMLIFrameElement
     * @returns string | null
     */
    public getIdByIframe(iframe: HTMLIFrameElement): string | undefined {
        return elementExists(iframe) ? this.getIdByUrl(iframe.src) : undefined;
    }

    /**
     * Takes a Vimeo Player URL and extracts the 9-digit Vimeo Id
     * @param url string
     * @returns string | null
     */
    public getIdByUrl(url: string): string | undefined {
        let id = undefined;

        const match = url.match(/\/player.vimeo.com\/video\/\d{9}/gi) ?? [];

        if (match.length === 1) {
            id = match
                .shift()
                ?.split(/\/player.vimeo.com\/video\//)
                .pop();
        }

        return id;
    }

    /**
     * Takes the Vimeo video id, the placeholder element id and the Vimeo Player instance and captures when the Vimeo iframe element is inserted into the document. The captured Vimeo iframe element along with the Vimeo instance is the added into both the Vimeo Player WeakMap repository and the Vimeo iframe WeakMap repository.
     * @param id string
     * @param elementId string
     * @param player Player
     */
    private static setIframePlayerRepo(
        id: string,
        elementId: string,
        player: Player
    ) {
        this.observePlaceholder(
            document.querySelector(`#${elementId}`) as HTMLElement,
            {
                childList: true
            }
        ).then((records) => {
            records.forEach((record) => {
                const iframe = enumerateElements(record.addedNodes).find(
                    (node) => (node.getAttribute("src") ?? "").match(id)
                ) as HTMLIFrameElement;

                if (iframe) {
                    VimeoManager.setPlayerByIframe(iframe, player);
                }
            });
        });
    }

    /**
     * Creates a new MutationObserver interface on the placeholder element and will observe the element. A promise object is returned where the resolve state contains the mutation record array.
     * @param placeholder HTMLElement
     * @param options MutationObserverInit
     * @returns Promise<MutationRecord[]>
     */
    private static observePlaceholder(
        placeholder: HTMLElement,
        options?: MutationObserverInit
    ): Promise<MutationRecord[]> {
        return new Promise<MutationRecord[]>((resolve, reject) => {
            const observer = new MutationObserver((records, observer) => {
                resolve(records);
                observer.disconnect();
            });

            observer.observe(placeholder, options ?? {});
        });
    }

    /**
     * Takes the Vimeo iframe element and connects to a new Vimeo Player instance.
     * @param iframe HTMLIFrameElement
     * @returns Player
     */
    public createPlayerByIframe(iframe: HTMLIFrameElement): Player {
        const player = new Player(iframe);

        VimeoManager.setPlayerByIframe(iframe, player);

        return player;
    }

    /**
     * Takes the Vimeo iframe element and the Vimeo Player instance and connects each to their respective WeakMap repository.
     * @param iframe HTMLIFrameElement
     * @param player Player
     */
    private static setPlayerByIframe(
        iframe: HTMLIFrameElement,
        player: Player
    ): void {
        this.playerRepo.set(iframe, player);
        this.iframeRepo.set(player, iframe);
    }

    /**
     * Takes the Vimeo iframe element as a key to look up it's connected Vimeo Player instance through the Vimeo Player WeakMap repository.
     * @param iframe HTMLIFrameElement
     * @returns Player
     */
    public getPlayerByIframe(iframe: HTMLIFrameElement): Player | undefined {
        return VimeoManager.playerRepo.get(iframe);
    }

    /**
     * Takes the Vimeo Player instance as a key to look up it's connected Vimeo iframe element through the Vimeo iframe WeakMap repository.
     * @param player Player
     * @returns HTMLIFrameElement
     */
    public getIframeByPlayer(player: Player): HTMLIFrameElement | undefined {
        return VimeoManager.iframeRepo.get(player);
    }
}
