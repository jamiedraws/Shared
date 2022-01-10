import {
    IPubSubEvents,
    IPubSubEventTask,
    PubSubTask
} from "../interfaces/patterns/pubsub";

export default class PubSub {
    /**
     * Represents the relationship between the PubSub instance and the id that is used to generate unique tokens
     */
    private static id: WeakMap<PubSub, number> = new WeakMap();

    /**
     * Represents the relationship between the PubSub instance and the IPubSubEvents object
     */
    private static events: WeakMap<PubSub, IPubSubEvents> = new WeakMap();

    /**
     * A publish/subscribe, pub-sub, interface that enables the ability to subscribe multiple different tasks to a common event name, the ability to publish different data to all subscribers of the common event name, and the ability to unsubscribe from a common event name.
     */
    constructor() {
        PubSub.id.set(this, -1);
        PubSub.events.set(this, {});
    }

    /**
     * Takes the event name along with any data and publishes the data to all of the subscribers. Returns true if the publish operation was successful; otherwise, returns false.
     * @param event string
     * @param record MutationRecord
     * @returns boolean
     */
    public publish(event: string, data: any): boolean {
        const events = PubSub.events.get(this);

        if (!events[event]) {
            return false;
        }

        const subscribers = events[event];

        subscribers.forEach(function (subscriber: IPubSubEventTask) {
            subscriber.task(data);
        });

        return true;
    }

    /**
     * Uses an event name and a callback function to make a subscription. In turn, calling the publish method on this event name will execute the callback function. A unique token is returned that can be used to unsubscribe from the system.
     * @param event string
     * @param task PubSubTask
     * @returns string
     */
    public subscribe(event: string, task: PubSubTask): string {
        const events = PubSub.events.get(this);

        if (!events[event]) {
            events[event] = [];
        }

        let id = PubSub.id.get(this);
        PubSub.id.set(this, (id += 1));

        const token = id.toString();

        events[event].push({
            token: token,
            task: task
        });

        return token;
    }

    /**
     * Uses a unique token to unsubscribe a callback function from an event name. The token is returned if the unsubscription operation is successful; otherwise, null is returned.
     * @param token string
     * @returns string
     */
    public unsubscribe(token: string): string {
        const events = PubSub.events.get(this);

        const found = Object.keys(events).some((event: string) => {
            return events[event].some(
                (subscriber: IPubSubEventTask, index: number) => {
                    const areEqual = subscriber.token === token.toString();

                    if (areEqual) {
                        events[event].splice(index, 1);
                    }

                    return areEqual;
                }
            );
        });

        return found ? token : null;
    }
}
