import { IVimeoManagerPosterImageSpecification } from "Shared/ts/interfaces/vimeo-manager";
import { IVimeoPosterPlayerPlaceholder } from "Shared/ts/interfaces/vimeo-poster-player";

export default interface IVimeoPlayerButtonConfig {
    /**
     * Represents the document query selector name that will be used to capture any potential placeholders
     */
    selector?: string;
    /**
     * Represents a data-attribute namespace that will be used to extract the Vimeo Player iframe URL source
     */
    attribute?: string;
    /**
     * Represents the namespace that will be used to control the GUI elements through CSS class names
     */
    namespace?: string;
    /**
     * Represents a map of image specifications for the width, height and quality
     */
    imageSpecs?: IVimeoManagerPosterImageSpecification;
}

/**
 * Represents the initialization task that will execute once the Vimeo Player Button has successfully initialized
 */
export type VimeoPlayerButtonInitializationTask = (
    response: IVimeoPosterPlayerPlaceholder
) => void;
