import IMediaPlayerAdapter from "Shared/ts/interfaces/media-player/media-player";

export default class MediaPlayer {
    private static adapter: WeakMap<MediaPlayer, IMediaPlayerAdapter> =
        new WeakMap();

    /**
     * A user-interface consisting of an element representing a media player and a collection of controls that can communicate directly to the media player.
     * @param context IMediaPlayerAdapter
     */
    constructor(context: IMediaPlayerAdapter) {
        MediaPlayer.adapter.set(this, context);
        MediaPlayer.registerControllerEvents(context);
    }

    /**
     * Enumerates all controllers and adds an event listener to each controller where the event will load in a new media
     * @param context IMediaPlayerAdapter
     */
    private static registerControllerEvents(
        context: IMediaPlayerAdapter
    ): void {
        const buttons = context.root.querySelectorAll(
            "[data-media-player-video-id]"
        );

        Array.from(buttons).forEach((button) =>
            button.addEventListener("click", (event) =>
                this.processControllerEvent(button, context)
            )
        );
    }

    /**
     * Retrieves the unique identifier from the controller element and loads in the new media
     * @param controller HTMLElement
     * @param context MediaPlayer
     */
    private static processControllerEvent(
        controller: Element,
        context: MediaPlayer
    ): void {
        const id = controller.getAttribute("data-media-player-video-id");
        if (!id) return;

        context.load(id);
    }

    /**
     * Returns the media player adapter
     * @param context MediaPlayer
     * @returns IMediaPlayerAdapter
     */
    protected static getAdapterByContext(
        context: MediaPlayer
    ): IMediaPlayerAdapter | undefined {
        return this.adapter.get(context);
    }

    /**
     * Loads in new media where the unique identifier represents the new media content
     * @param id string
     */
    public load(id: string): void {
        const adapter = MediaPlayer.getAdapterByContext(this);
        if (!adapter) return;

        adapter.load(id);
    }

    /**
     * Plays the current media
     */
    public play(): void {
        const adapter = MediaPlayer.getAdapterByContext(this);
        if (!adapter) return;

        adapter.play();
    }

    /**
     * Pauses the current media
     */
    public pause(): void {
        const adapter = MediaPlayer.getAdapterByContext(this);
        if (!adapter) return;

        adapter.pause();
    }
}
