/**
 * Contains the mappable fields that are required for the Klaviyo catalog feed.
 *
 * https://developers.klaviyo.com/en/docs/guide_to_syncing_a_custom_catalog_feed_to_klaviyo#required-fields
 */
export interface IKlaviyoProduct {
    /**
     * Represents the `CampaignProductView` id as a Guid
     */
    id: string;
    /**
     * Represents the `CampaignProductView` product property `Name` or the product title
     */
    title: string;
    /**
     * Represents the `CampaignProductView` product property `KlaviyoProductURL` or current url
     */
    link: string;
    /**
     * Represents the `CampaignProductView` product property `Name` or `unavailable`
     */
    description: string;
    /**
     * Represents the `CampaignProductView` price as a decimal value
     */
    price: number;
    /**
     * Represents the `CampaignProductView` product property `KlaviyoImageUrl` or `unavailable`
     */
    image_link: string;
    /**
     * Represents the `CampaignProductView` inventory
     */
    inventory_number: number;
    inventory_policy: string;
}

/**
 * Network request for the Klaviyo *Back In Stock* endpoint containing:
 *
 * 1. the subscriber's email address
 * 2. the variant (*representing the `CampaignProductView` id Guid*)
 * 3. the Klaviyo Api key
 * 4. the platform of `api`
 *
 * https://developers.klaviyo.com/en/docs/how_to_enable_back_in_stock_for_custom_catalog_feeds#front-end-request
 */
export interface IKlaviyoBackInStockRequest {
    email: string;
    variant: string;
}

/**
 * Network response from the Klaviyo *Back In Stock* request endpoint containing the subscriber's email address and a success value of true.
 *
 * https://developers.klaviyo.com/en/docs/how_to_enable_back_in_stock_for_custom_catalog_feeds#successful-back-in-stock-subscription
 */
export interface IKlaviyoBackInStockResponseValid {
    email: string;
    success: boolean;
}

/**
 * Network response from the Klaviyo *Back In Stock* request endpoint containing a string array of error messages, additional data and a success value of false.
 *
 * https://developers.klaviyo.com/en/docs/how_to_enable_back_in_stock_for_custom_catalog_feeds#invalid-email-address-or-api-key
 */
export interface IKlaviyoBackInStockResponseInvalid {
    errors: string[];
    data: Record<string, any>;
    success: boolean;
}

/**
 * Network response from the Klaviyo *Back In Stock* request endpoint containing an HTTP status code along with a message providing context related to the status code.
 *
 * https://developers.klaviyo.com/en/docs/how_to_enable_back_in_stock_for_custom_catalog_feeds#missing-form-data-parameters
 */
export interface IKlaviyoBackInStockResponseRequired {
    status: number;
    message: string;
}
