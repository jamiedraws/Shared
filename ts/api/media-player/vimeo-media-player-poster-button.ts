import VimeoPlayerButton from "Shared/ts/components/vimeo-player-button";
import VimeoMediaPlayerAdapter from "./vimeo-media-player";

export default class VimeoMediaPlayerPosterButtonAdapter extends VimeoMediaPlayerAdapter {
    constructor(root: Element) {
        super(root);

        const vimeoPlayerButton = new VimeoPlayerButton({
            imageSpecs: {
                width: "1920",
                height: "1080",
                quality: "70"
            }
        });
    }
}
