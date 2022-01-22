import YouTubeManager from "Shared/ts/utils/youtube-manager";
import IMediaPlayerAdapter from "Shared/ts/interfaces/media-player/media-player";

export default class YouTubeMediaPlayerAdapter implements IMediaPlayerAdapter {
    public root: Element;

    public iframe: HTMLIFrameElement | null;

    public player: YT.Player | null = null;

    /**
     * This adapter communicates between the Media Player class and the YouTube Manager class and enables the methods to load a new video, play a current video and pause a current video through YouTube
     */
    constructor(root: Element) {
        const yt = new YouTubeManager();

        this.root = root;
        this.iframe = root.querySelector("iframe");

        if (this.iframe) {
            yt.createPlayerByIframe(this.iframe).then((player) => {
                this.player = player;
            });
        }
    }

    public load(id: string): void {
        this.player?.loadVideoById(id);
    }

    public play(): void {
        this.player?.playVideo();
    }

    public pause(): void {
        this.player?.pauseVideo();
    }
}
