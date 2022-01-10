import ICountdown, {
    CountdownStopTask,
    CountdownTickTask,
    ICountdownTick
} from "../interfaces/countdown";
import { elementExists } from "../utils/html";

export default class Countdown {
    /**
     * Represents the overall container element for the countdown clock
     */
    public container: Element;

    /**
     * Represents the container element that will render the number of days
     */
    public days: Element;

    /**
     * Represents the container element that will render the number of hours
     */
    public hours: Element;

    /**
     * Represents the container element that will render the number of minutes
     */
    public minutes: Element;

    /**
     * Represents the container element that will render the number of seconds
     */
    public seconds: Element;

    /**
     * Represents the attribute name for the number of days to output
     */
    private static daysAttribute: string = "data-days";

    /**
     * Represents the attribute name for the number of hours to output
     */
    private static hoursAttribute: string = "data-hours";

    /**
     * Represents the attribute name for the number of minutes to output
     */
    private static minutesAttribute: string = "data-minutes";

    /**
     * Represents the attribute name for the number of seconds to output
     */
    private static secondsAttribute: string = "data-seconds";

    /**
     * Represents the relationship between a Countdown instance and the Countdown context adapter
     */
    private static context: WeakMap<Countdown, ICountdown> = new WeakMap();

    /**
     * Uses an overall HTML element as a container along with a Countdown adapter to establish a live countdown region.
     * @param container Element
     * @param context ICountdown
     */
    constructor(container: Element, context: ICountdown) {
        this.container = container;

        this.days = container.querySelector(`[${Countdown.daysAttribute}]`);
        this.hours = container.querySelector(`[${Countdown.hoursAttribute}]`);
        this.minutes = container.querySelector(
            `[${Countdown.minutesAttribute}]`
        );
        this.seconds = container.querySelector(
            `[${Countdown.secondsAttribute}]`
        );

        Countdown.context.set(this, context);
    }

    /**
     * Takes the current Countdown context and returns the Countdown adapter
     * @param context Countdown
     * @returns ICountdown
     */
    private static getContext(context: Countdown): ICountdown {
        return this.context.get(context);
    }

    /**
     * Takes a node element along with a data-attribute name and sets the value of the attribute to represent the current time fragment
     * @param node Element
     * @param attribute string
     * @param time number
     */
    private static updateTimeAttributeByNode(
        node: Element,
        attribute: string,
        time: number
    ): void {
        if (elementExists(node)) {
            node.setAttribute(attribute, time.toString());
        }
    }

    /**
     * Takes a node element along with a data-attribute name and returns the current time fragment
     * @param node Element
     * @param attribute string
     * @returns number
     */
    private static getTimeAttributeFromNode(
        node: Element,
        attribute: string
    ): number {
        return elementExists(node)
            ? parseInt(node.getAttribute(attribute) ?? "0")
            : 0;
    }

    /**
     * Determines if the current time has any days left
     * @returns boolean
     */
    public hasDays(): boolean {
        return (
            Countdown.getTimeAttributeFromNode(
                this.days,
                Countdown.daysAttribute
            ) > 0
        );
    }

    /**
     * Determines if the current time has any hours left
     * @returns boolean
     */
    public hasHours(): boolean {
        return (
            Countdown.getTimeAttributeFromNode(
                this.hours,
                Countdown.hoursAttribute
            ) > 0 || this.hasDays()
        );
    }

    /**
     * Determines if the current time has any minutes left
     * @returns boolean
     */
    public hasMinutes(): boolean {
        return (
            Countdown.getTimeAttributeFromNode(
                this.minutes,
                Countdown.minutesAttribute
            ) > 0 || this.hasHours()
        );
    }

    /**
     * Determines if the current time has any seconds left
     * @returns boolean
     */
    public hasSeconds(): boolean {
        return (
            Countdown.getTimeAttributeFromNode(
                this.seconds,
                Countdown.secondsAttribute
            ) > 0 || this.hasMinutes()
        );
    }

    /**
     * Determines if the overall current time has expired
     * @returns boolean
     */
    public isExpired(): boolean {
        return (
            !this.hasDays() &&
            !this.hasHours() &&
            !this.hasMinutes() &&
            !this.hasSeconds()
        );
    }

    /**
     * Takes the current time interface along with the Countdown instance and updates all of the container nodes to represent the current time
     * @param currentTime ICountdownTick
     * @param context Countdown
     */
    private static processTickByContext(
        currentTime: ICountdownTick,
        context: Countdown
    ): void {
        this.updateTimeAttributeByNode(
            context.days,
            this.daysAttribute,
            currentTime.days
        );

        this.updateTimeAttributeByNode(
            context.hours,
            this.hoursAttribute,
            currentTime.hours
        );

        this.updateTimeAttributeByNode(
            context.minutes,
            this.minutesAttribute,
            currentTime.minutes
        );

        this.updateTimeAttributeByNode(
            context.seconds,
            this.secondsAttribute,
            currentTime.seconds
        );
    }

    /**
     * Starts the live-countdown
     */
    public start(): void {
        const context = Countdown.getContext(this);

        context.start();

        context.tick((currentTime: ICountdownTick) =>
            Countdown.processTickByContext(currentTime, this)
        );
    }

    /**
     * Uses a callback function as a task to perform after each countdown tick occurs
     * @param task CountdownTickTask
     */
    public tick(task: CountdownTickTask): void {
        const context = Countdown.getContext(this);

        context.tick((currentTime) => {
            Countdown.processTickByContext(currentTime, this);
            task(currentTime);
        });
    }

    /**
     * Uses a callback function as a task to perform once the live-countdown clock has expired
     * @param task CountdownStopTask
     */
    public stop(task: CountdownStopTask): void {
        const context = Countdown.getContext(this);

        context.stop(task);
    }
}
