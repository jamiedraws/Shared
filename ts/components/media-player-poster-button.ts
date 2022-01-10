import IMediaPlayerPosterButtonAdapter from "../interfaces/media-player/media-player-poster-button";
import MediaPlayer from "./media-player";

export default class MediaPlayerPosterButton extends MediaPlayer {
    constructor(context: IMediaPlayerPosterButtonAdapter) {
        super(context);
    }
}
