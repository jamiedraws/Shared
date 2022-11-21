import { IKlaviyoProduct } from "ts/interfaces/klaviyo-catalog";

export default class KlaviyoProductCatalog {
    /**
     * Provides access to interface with the DTM Klaviyo catalog feed
     */
    constructor() {}

    /**
     * Returns a promise for a response containing the DTM Klaviyo catalog feed as JSON.
     * @returns Promise<IKlaviyoProduct[]>
     */
    public async requestCatalog(): Promise<IKlaviyoProduct[]> {
        const request = await fetch("/Shared/Services/Catalog.ashx");

        const response = (await request.json()) as Promise<IKlaviyoProduct[]>;

        return response;
    }
}
