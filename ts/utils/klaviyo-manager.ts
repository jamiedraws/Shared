// interfaces
import {
    IKlaviyoBackInStockRequest,
    IKlaviyoBackInStockResponseValid,
    IKlaviyoProduct
} from "Shared/ts/interfaces/klaviyo-catalog";

// utils
import KlaviyoProductCatalog from "Shared/ts/utils/klaviyo-product-catalog";

export default class KlaviyoManager extends KlaviyoProductCatalog {
    /**
     * Represents the cached DTM Klaviyo catalog JSON feed
     */
    private static catalog: IKlaviyoProduct[] = [];

    /**
     * Represents the Klaviyo SDK script
     */
    private _pixel: HTMLScriptElement | null = null;

    /**
     * Represents the Klaviyo SDK script and will report a debug log in the browser if the script element is not present in the document.
     */
    private set pixel(value: HTMLScriptElement | null) {
        if (value === null) {
            KlaviyoManager.reportDebugError(
                `The Klaviyo SDK script could not be located in this document.`
            );

            return;
        }

        this._pixel = value;
    }

    /**
     * Returns the Klaviyo SDK HTML script element
     */
    private get pixel(): HTMLScriptElement | null {
        return this._pixel;
    }

    /**
     * Klaviyo Manager allows access to the DTM Klaviyo catalog feed where a product id can pull for specific product information. The manager can report if the SDK script is visible in the document and can pull for the Klaviyo Api key.
     */
    constructor() {
        super();

        this.pixel = document.querySelector<HTMLScriptElement>(
            'script[src^="//static.klaviyo.com/onsite/js/klaviyo.js"]'
        );
    }

    /**
     * Takes an error message along with an optional object providing additional information to rpeort a debugging error to the developer
     * @param error string
     * @param data Record<string, any>
     */
    protected static reportDebugError(
        error: string,
        data: Record<string, any> = {}
    ): void {
        console.debug(
            Object.assign(
                {
                    error,
                    control: `Klaviyo Waitlist`
                },
                data
            )
        );
    }

    /**
     * Determines if the document contains the Klaviyo SDK script
     * @returns boolean
     */
    public hasPixelInstalled(): boolean {
        return this.pixel !== null;
    }

    /**
     * Returns a promose for a response containing the Klaviyo Api key
     * @returns Promise<string>
     */
    public getApiKey(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const src = this.pixel?.src;
            if (!src) {
                reject(
                    `The Klaviyo SDK script could not be obtained from the document.`
                );

                return;
            }

            const params = new URL(src).searchParams;
            const key = params.get("company_id");
            if (!key) {
                reject(
                    `The Klaviyo company id could not be obtained for the waitlist.`
                );

                return;
            }

            resolve(key);
        });
    }

    /**
     * Returns a promise for a response containing Klaviyo's network response from the Klaviyo request endpoint:
     *
     * `https://a.klaviyo.com/onsite/components/back-in-stock/subscribe`
     * @param request IKlaviyoBackInStock
     * @returns Promise<IKlaviyoBackInStockResponseValid>
     */
    public requestSubscribe(
        request: IKlaviyoBackInStockRequest
    ): Promise<IKlaviyoBackInStockResponseValid> {
        return new Promise<IKlaviyoBackInStockResponseValid>(
            (resolve, reject) => {
                this.getApiKey()
                    .then((key) => {
                        fetch(
                            `https://a.klaviyo.com/onsite/components/back-in-stock/subscribe`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type":
                                        "application/x-www-form-urlencoded; charset=UTF-8"
                                },
                                body: new URLSearchParams({
                                    a: key,
                                    platform: "api",
                                    variant: request.variant,
                                    email: request.email
                                })
                            }
                        )
                            .then((response) => {
                                return response.json().then((json) => {
                                    response.status === 200
                                        ? resolve(json)
                                        : reject(json);
                                });
                            })
                            .catch((error) => reject(error));
                    })
                    .catch((error) => reject(error));
            }
        );
    }

    /**
     * Returns a promise for a response containing the DTM Klaviyo catalog feed as JSON data.
     * @returns Promise<IKlaviyoProudct[]>
     */
    public getProductCatalog(): Promise<IKlaviyoProduct[]> {
        return new Promise<IKlaviyoProduct[]>((resolve, reject) => {
            if (KlaviyoManager.catalog.length > 0) {
                return resolve(KlaviyoManager.catalog);
            }

            this.requestCatalog()
                .then((catalog) => {
                    KlaviyoManager.catalog = catalog;
                    resolve(catalog);
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Returns a promise for a response containing specific product information from the DTM Klaviyo catalog feed based on the provided product id
     * @param id string
     * @returns Promise<IKlaviyoProduct>
     */
    public getProductFromCatalogByProductId(
        id: string
    ): Promise<IKlaviyoProduct> {
        return new Promise<IKlaviyoProduct>((resolve, reject) => {
            this.getProductCatalog().then((catalog) => {
                const product = catalog.find((c) => c.id === id);

                product
                    ? resolve(product)
                    : reject(
                          `The product id: ${id} returned no data from the catalog.`
                      );
            });
        });
    }
}
