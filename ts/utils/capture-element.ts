import {
    CaptureElementEventName,
    CaptureElementTask
} from "Shared/ts/interfaces/capture-element";
import PubSub from "Shared/ts/patterns/pubsub";

export default class CaptureElement {
    /**
     * Represents the element that will be registered to a new MutationObserver instance
     */
    public element: Element;

    /**
     * Represents the relationship between the CaptureElement instance and the MutationObserver instance
     */
    private static observers: WeakMap<CaptureElement, MutationObserver> =
        new WeakMap();

    /**
     * Represents the relationship between the CaptureElement instance and the PubSub instance
     */
    private static pubsub: WeakMap<CaptureElement, PubSub> = new WeakMap();

    /**
     * CaptureElement is a publish/subscribe, pub-sub, interface that can be controlled by an element that is registered to a new MutationObserver instance. Subscription names are mapped to the Mutation Observer's observable types that are defined in the MutationObserverInit dictionary. When an observable type is captured on the element, a callback function will be executed back to the author where the MutationRecord information can be accessed.
     * @param element Element
     */
    constructor(element: Element) {
        this.element = element;

        const pubsub = new PubSub();
        const observer = CaptureElement.createObserver(element, (records) => {
            records.forEach((record) => {
                switch (record.type) {
                    case "characterData":
                        pubsub.publish("characterData", record);
                        break;
                    case "attributes":
                        pubsub.publish("attributes", record);
                        break;
                    case "childList":
                        pubsub.publish("childList", record);
                        break;
                }
            });
        });

        CaptureElement.pubsub.set(this, pubsub);
        CaptureElement.observers.set(this, observer);
    }

    /**
     * Takes the element along with the callback function and returns the new MutationObserver object
     * @param element Element
     * @param callback MutationCallback
     * @returns MutationObserver
     */
    private static createObserver(
        element: Element,
        callback: MutationCallback
    ): MutationObserver {
        const observer = new MutationObserver(callback);

        observer.observe(element, {
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true
        });

        return observer;
    }

    /**
     * Uses an event name and a callback function to make a subscription. In turn, calling the publish method on this event name will execute the callback function. A unique token is returned that can be used to unsubscribe from the system.
     * @param event CaputerElementEventName
     * @param task CaptureElementTask
     * @returns string
     */
    public subscribe(
        event: CaptureElementEventName,
        task: CaptureElementTask
    ): string | undefined {
        const pubsub = CaptureElement.pubsub.get(this);

        return pubsub?.subscribe(event, task);
    }

    /**
     * Uses a unique token to unsubscribe a callback function from an event name. The token is returned if the unsubscription operation is successful; otherwise, null is returned.
     * @param token string
     * @returns string
     */
    public unsubscribe(token: string): string | undefined {
        const pubsub = CaptureElement.pubsub.get(this);

        return pubsub?.unsubscribe(token);
    }

    /**
     * Closes the connection to the element's MutationObserver
     */
    public disconnect(): void {
        const observer = CaptureElement.observers.get(this);

        observer?.disconnect();
    }
}
