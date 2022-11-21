import {
    ITikTokEmbed,
    ITikTokOembedResponse,
    ITikTokOriginalSound,
    ITikTokTag,
    ITikTokThumbnail
} from "Shared/ts/interfaces/tiktok-embed-manager";
import { renderTemplate } from "Shared/ts/utils/html";

export default class TikTokEmbedManager {
    /**
     * Represents the user's TikTok handle (username)
     */
    public userid: string | undefined;

    /**
     * Represents the video id
     */
    public videoid: string | undefined;

    /**
     * Represents a key-value relationship between the current TikTokEmbedManager instance and the oembed response
     */
    private static oEmbedRepo: WeakMap<
        TikTokEmbedManager,
        ITikTokOembedResponse
    > = new WeakMap<TikTokEmbedManager, ITikTokOembedResponse>();

    /**
     * Represets a key-value relationship between the current TikTokEmbedManager instance and the embed HTML document fragment
     */
    private static embedHTMLRepo: WeakMap<
        TikTokEmbedManager,
        DocumentFragment
    > = new WeakMap<TikTokEmbedManager, DocumentFragment>();

    /**
     * Using a TikTok video url, information on the TikTok video can be accessible through a Promise-based Api. Information includes but is not limited to; the user id, video id, author information, thumbnail image information, tags, original sound, video post and embed HTML.
     * @param url string
     */
    constructor(url: string) {
        this.userid = this.getUserIdByUrl(url);
        this.videoid = this.getVideoIdByUrl(url);
    }

    /**
     * Takes a url, representing a TikTok video, and extracts the user id and returns that id
     * @param url string
     * @returns string | undefined
     */
    public getUserIdByUrl(url: string): string | undefined {
        const match = url.match(/@[\w.]*/i) ?? [];

        if (match.length === 1) {
            return match.shift();
        }
    }

    /**
     * Takes a url, representing a TikTok video, and extracts the 18-digit TikTok video id and returns that id
     * @param url string
     * @returns string | undefined
     */
    public getVideoIdByUrl(url: string): string | undefined {
        const match = url.match(/video\/\d{19}/i) ?? [];

        if (match.length === 1) {
            return match
                .shift()
                ?.split(/video\//)
                .pop();
        }
    }

    /**
     * Returns a promise containing a cached oembed response containing information on a TikTok video
     * @returns Promise<ITikTokOembedResponse>
     */
    public getOembedResponse(): Promise<ITikTokOembedResponse> {
        return new Promise<ITikTokOembedResponse>((resolve, reject) => {
            const response = TikTokEmbedManager.oEmbedRepo.get(this);
            response ? resolve(response) : resolve(this.makeOembedRequest());
        });
    }

    /**
     * Returns a promise containing a new oembed response containing information on a TikTok video
     * @returns Promise<ITikTokOembedResponse>
     */
    public async makeOembedRequest(): Promise<ITikTokOembedResponse> {
        const request = await fetch(
            `https://www.tiktok.com/oembed?url=https://www.tiktok.com/${this.userid}/video/${this.videoid}`
        );

        const response: ITikTokOembedResponse = await request.json();
        TikTokEmbedManager.oEmbedRepo.set(this, response);

        return response;
    }

    /**
     * Returns a promise containing an HTML iframe element that embeds the tiktok video
     * @returns Promise<HTMLIFrameElement>
     */
    public createIframeFragment(): Promise<HTMLIFrameElement> {
        return new Promise<HTMLIFrameElement>((resolve, reject) => {
            if (!this.videoid) {
                reject(
                    `Cannot construct a valid iframe source without a valid TikTok video id.`
                );
            }

            const iframe = document.createElement("iframe");

            iframe.setAttribute(
                "src",
                `https://www.tiktok.com/embed/v2/${this.videoid}`
            );

            resolve(iframe);
        });
    }

    /**
     * Returns a promise for a document fragment containing the embed HTML
     * @returns Promise<DocumentFragment>
     */
    public getEmbedHTML(): Promise<DocumentFragment> {
        return new Promise<DocumentFragment>((resolve, reject) => {
            const html = TikTokEmbedManager.embedHTMLRepo.get(this);
            if (html) resolve(html);

            this.makeOembedRequest().then((response) => {
                const html = renderTemplate(response.html);
                TikTokEmbedManager.embedHTMLRepo.set(this, html);

                resolve(html);
            });
        });
    }

    /**
     * Returns a promise for an array containing objects of tag names and urls
     * @returns Promise<ITikTokTag[]>
     */
    public getTags(): Promise<ITikTokTag[]> {
        return new Promise<ITikTokTag[]>((resolve, reject) => {
            this.getEmbedHTML().then((html) => {
                const tags: ITikTokTag[] = Array.from(
                    html.querySelectorAll<HTMLAnchorElement>(
                        `a[href^="https://www.tiktok.com/tag/"]`
                    )
                ).map((element) => {
                    return {
                        name: element.textContent ?? "",
                        url: element.href
                    };
                });

                resolve(tags);
            });
        });
    }

    /**
     * Returns a promise for an object containing the name of the original sound and the url to the original sound
     * @returns Promise<ITikTokOriginalSound>
     */
    public getOriginalSound(): Promise<ITikTokOriginalSound> {
        return new Promise<ITikTokOriginalSound>((resolve, reject) => {
            this.getEmbedHTML().then((html) => {
                const element = html.querySelector<HTMLAnchorElement>(
                    `a[href^="https://www.tiktok.com/music"]`
                );

                if (element) {
                    resolve({
                        name: element.textContent ?? "",
                        url: element.href
                    });
                }
            });
        });
    }

    /**
     * Returns a promise for an object containing the thumbnail image width, height and url
     * @returns Promise<ITikTokThumbnail>
     */
    public getThumbnail(): Promise<ITikTokThumbnail> {
        return new Promise<ITikTokThumbnail>((resolve, reject) => {
            this.getOembedResponse().then((response) =>
                resolve({
                    width: response.thumbnail_width,
                    height: response.thumbnail_height,
                    url: response.thumbnail_url
                })
            );
        });
    }

    /**
     * Returns a promise containing the video url
     * @returns Promise<string>
     */
    public getVideoUrl(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.getEmbedHTML().then((html) => {
                const blockquote = html.querySelector("blockquote");

                if (blockquote) {
                    resolve(blockquote.cite);
                }
            });
        });
    }

    /**
     * Returns a promise for an object containing the complete TikTok embed data
     * @returns Promise<ITikTokEmbed>
     */
    public getEmbedData(): Promise<ITikTokEmbed> {
        return new Promise<ITikTokEmbed>(async (resolve, reject) => {
            const response = await this.getOembedResponse();
            const videoUrl = await this.getVideoUrl();
            const originalSound = await this.getOriginalSound();
            const thumbnail = await this.getThumbnail();
            const tags = await this.getTags();

            resolve({
                authorName: response.author_name,
                authorUrl: response.author_url,
                title: response.title,
                videoUrl,
                originalSound,
                tags,
                thumbnail
            });
        });
    }
}
