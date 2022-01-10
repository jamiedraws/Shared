export default interface ICountdown {
    /**
     * Represents the current time
     */
    time: string;
    /**
     * Starts the countdown timer
     */
    start: () => void;
    /**
     * Stops the countdown timer
     */
    stop: (task: () => void) => void;

    /**
     * Updates after countdown tick
     */
    tick: (task: CountdownTickTask) => void;
}

export interface ICountdownTick {
    /**
     * Represents the current number of days
     */
    days: number;
    /**
     * Represents the current number of hours
     */
    hours: number;
    /**
     * Represents the current number of minutes
     */
    minutes: number;
    /**
     * Represents the current number of seconds
     */
    seconds: number;
}

/**
 * Represents a callback function to execute after each countdown tick
 */
export type CountdownTickTask = (tick: ICountdownTick) => void;

/**
 * Represents a callback function to execute after the countdown expires
 */
export type CountdownStopTask = () => void;
