interface CustomEventMap {
    CartChange: CustomEvent<ICartChange>;
}

declare global {
    interface Window {
        addEventListener<K extends keyof CustomEventMap>(
            type: K,
            listener: (this: Window, ev: CustomEventMap[K]) => void
        ): void;
    }
}

export interface IProductProperty {
    Key: string;
    Value: string;
}

export interface IProduct {
    code: string;
    desc: string;
    extPrice: number;
    extPriceC: string;
    id: string;
    max: number;
    maxQty: number;
    min: number;
    minQty: number;
    name: string;
    numpay: number;
    price: number;
    priceC: string;
    productPrice: number;
    productPriceC: string;
    productShipping: number;
    productShippingC: string;
    props: IProductProperty[];
    qty: number;
    rank: number;
    reportPrice: number;
    reportPriceC: string;
    shipping: number;
    shippingC: string;
    sku: string;
    total: number;
    totalC: string;
    totalPrice: number;
    totalPriceC: string;
    totalShipping: number;
    totalShippingC: string;
    type: string;
}

export interface ICartChange {
    VS: string;
    data: null;
    errors: string[];
    hasMultipay: boolean;
    id: null;
    items: IProduct[];
    price: number;
    promoCode: null | string;
    promoCodeTarget: null | string;
    quantity: number;
    shipping: number;
    total: number;
    totalC: string;
    totalExtPrice: number;
    totalExtended: number;
    totalExtendedC: string;
    totalPrice: number;
    totalPriceC: string;
    totalQty: number;
    totalShipping: number;
    totalShippingC: number;
    validation: null;
    zipdata: null;
}
