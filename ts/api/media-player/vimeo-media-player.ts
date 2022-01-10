import VimeoManager from "../../utils/vimeo-manager";
import IMediaPlayerAdapter from "../../interfaces/media-player/media-player";
import Player from "@vimeo/player";

export default class VimeoMediaPlayerAdapter implements IMediaPlayerAdapter {
    public root: Element;

    /**
     * Represents the Vimeo iframe
     */
    public iframe: HTMLIFrameElement;

    /**
     * Represents the Vimeo Player
     */
    public player: Player;

    /**
     * This adapter communicates between the Media Player class and the Vimeo Manager class and enables the methods to load a new video, play a current video and pause a current video through Vimeo
     */
    constructor(root: Element) {
        const vm = new VimeoManager();

        this.root = root;
        this.iframe = root.querySelector("iframe");
        this.player = vm.createPlayerByIframe(this.iframe);
    }

    public play(): void {
        this.player.play();
    }

    public pause(): void {
        this.player.pause();
    }

    public load(id: string): void {
        this.player.loadVideo(parseInt(id));
    }
}
