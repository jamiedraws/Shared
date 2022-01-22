import ICountdown, {
    CountdownStopTask,
    CountdownTickTask
} from "Shared/ts/interfaces/countdown";
import moment, { Duration } from "moment";

export default class MomentCountdown implements ICountdown {
    public time: string;

    /**
     * Represents the relationship between a MomentCountdown instance and the CountdownTickTask callback function
     */
    private static tick: WeakMap<MomentCountdown, CountdownTickTask> =
        new WeakMap();

    /**
     * Represents the relationship between a MomentCountdown instance and the CountdownStopTask callback function
     */
    private static stop: WeakMap<MomentCountdown, CountdownStopTask> =
        new WeakMap();

    constructor(time: string) {
        this.time = time;
    }

    /**
     * Sets a 1 second timeout that performs a 1 second countdown tick
     * @param context MomentCountdown
     * @param time number
     */
    private static processTimeoutByContext(
        context: MomentCountdown,
        time: number
    ) {
        setTimeout(() => {
            const duration = moment.duration(time - 1000, "milliseconds");

            if (duration.asSeconds() > -1) {
                this.processTickByDuration(context, duration);
                this.processTimeoutByContext(
                    context,
                    duration.asMilliseconds()
                );
            } else {
                const stop = MomentCountdown.stop.get(context);

                if (stop) {
                    stop();
                }
            }
        }, 1000);
    }

    /**
     * Takes the MomentCountdown instance along with the moment Duration interface and attempts to pass along the current time interface over to the CountdownTickTask callback function
     * @param context MomentCountdown
     * @param duration Duration
     */
    private static processTickByDuration(
        context: MomentCountdown,
        duration: Duration
    ): void {
        const tick = MomentCountdown.tick.get(context);

        if (tick) {
            tick({
                days: Math.trunc(duration.asDays()),
                hours: duration.hours(),
                minutes: duration.minutes(),
                seconds: duration.seconds()
            });
        }
    }

    /**
     * Takes the MomentCountdown instance and returns a moment Duration interface
     * @param context MomentCountdown
     * @returns Duration
     */
    private static getDurationByContext(context: MomentCountdown): Duration {
        return moment.duration(context.time);
    }

    public tick(task: CountdownTickTask) {
        MomentCountdown.tick.set(this, task);
    }

    public start() {
        const duration = MomentCountdown.getDurationByContext(this);

        MomentCountdown.processTickByDuration(this, duration);
        MomentCountdown.processTimeoutByContext(
            this,
            duration.asMilliseconds()
        );
    }

    public stop(task: CountdownStopTask) {
        MomentCountdown.stop.set(this, task);
    }
}
