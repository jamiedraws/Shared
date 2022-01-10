export default interface IInstagramMediaManager {
    accessToken: string;
    setEndpoint: () => string;
    requestMedia: () => Promise<IInstagramMedia[]>;
    requestImages: () => Promise<IInstagramMedia[]>;
}

/**
 * Represents an image, video, or album.
 */
export interface IInstagramMedia {
    /**
     * The Media's caption text. Not returnable for Media in albums.
     */
    caption: string;
    /**
     * The Media's ID.
     */
    id: string;
    /**
     * The Media's type. Can be IMAGE, VIDEO, or CAROUSEL_ALBUM.
     */
    media_type: string;
    /**
     * The Media's URL.
     */
    media_url: string;
    /**
     * The Media's permanent URL. Will be omitted if the Media contains copyrighted material, or has been flagged for a copyright violation.
     */
    permalink: string;
    /**
     * The Media's thumbnail image URL. Only available on VIDEO Media.
     */
    thumbnail_url: string;
    /**
     * The Media's publish date in ISO 8601 format.
     */
    timestamp: string;
    /**
     * The Media owner's username.
     */
    username: string;
}
