import Player from "@vimeo/player";
import { IVimeoManagerPosterImageSpecification } from "Shared/ts/interfaces/vimeo-manager";

export default interface IVimeoPosterPlayerConfig {
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

export interface IVimeoPosterPlayerPlaceholder {
    /**
     * Represents the placeholder element containing the Vimeo Player iframe element
     */
    placeholder: Element;
    /**
     * Represents an instance of the Vimeo Player that's connected to a Vimeo Player iframe element
     */
    player: Player;
}

/**
 * Represents the callback function that provides access to the placeholder element and the Vimeo Player instance
 */
export type IVimeoPosterPlayerInitializationResponseTask = (
    response: IVimeoPosterPlayerPlaceholder
) => void;
