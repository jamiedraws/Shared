import { Counter } from "shared/ts/components/counter";
import { observer } from "shared/ts/observers/intersection";

export default class PriceCounter {
    /**
     * Represents the attribute that contains the price number.
     */
    public attribute: string = "data-count-price-up";

    /**
     * Uses the string id as a selector to query the document and observes when each element intersects the viewport. For each element, the price amount is read in through a data attribute, "data-count-price-up" by default, and will be used as a counter. The counter will then animate from 0 up to the price amount in fast-to-slow motion.
     * @param id string
     */
    constructor(id: string, attribute?: string) {
        this.attribute = attribute ?? this.attribute;

        observer(id, {
            inRange: this.createCounter.bind(this)
        });
    }

    /**
     * Takes an HTMLElement and extract the price number by an attribute.
     * @param element HTMLElement
     * @returns number
     */
    public getPriceByElement(element: HTMLElement): number {
        return parseInt(element.getAttribute(this.attribute));
    }

    /**
     * Takes an HTMLElement and creates a counting animation that will last 1 second.
     * @param element HTMLElement
     */
    public createCounter(element: HTMLElement) {
        const price = this.getPriceByElement(element);

        const counter = new Counter(0, price, {
            duration: 1000,
            easing: (x: number) => Math.sin((x * Math.PI) / 2),
            afterStep: (step: number) => {
                element.innerHTML = step.toLocaleString();
            }
        });

        counter.forward();
    }
}
