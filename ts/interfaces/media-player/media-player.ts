export default interface IMediaPlayerAdapter {
    /**
     * Represents the container element holding both the media player and the media player controls
     */
    root: Element;
    /**
     * Communicates directly with the media player and plays the current media
     */
    play: () => void;
    /**
     * Communicates directly with the media player and pauses the current media
     */
    pause: () => void;
    /**
     * Communicates directly with the media player and loads in a new media using a string identifier
     */
    load: (id: string) => void;
}
