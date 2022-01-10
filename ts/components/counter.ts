import { isNumber, isObject, isFunction } from "shared/ts/utils/data";

/**
 * The config interface for the Counter class extends the capability for a duration number and easing function to control the animation as well as an after step callback function that provides the current step number.
 */
export interface ICounterConfig {
    duration?: number;
    easing?: (x: number) => number;
    afterStep?: (step: number) => void;
}

/**
 * Counter steps through a range between a start and end number. It can take an optional start number, an end number and a config object using the ICounterConfig interface. Support includes stepping forwards and backwards.
 * @param start number
 * @param end number
 * @param config ICounterConfig
 */
export class Counter {
    public start: number = 0;
    public end: number = 1;
    public config: ICounterConfig = {
        duration: 1000,
        easing: (x: number): number => x,
        afterStep: (step: number): void => {}
    };

    private startTimeStamp: number = 0;

    constructor(start?: number, end?: number, config?: ICounterConfig) {
        Counter.setRange(start, end, this);
        Counter.setConfig(config, this);
    }

    /**
     * Determines if the author start and end numbers match the required data-type.
     * @param start number
     * @param end number
     * @param self Counter
     */
    protected static setRange(start: number, end: number, self: Counter) {
        if (isNumber(start)) {
            self.start = start;
        }

        if (isNumber(end)) {
            self.end = end;
        }
    }

    /**
     * Determines if the author config matches the required data-type and then determines if the author config properties matches the required data-types.
     * @param config ICounterConfig
     * @param self Counter
     */
    protected static setConfig(config: ICounterConfig, self: Counter) {
        if (isObject(config)) {
            if (isNumber(config.duration)) {
                self.config.duration = config.duration;
            }

            if (isFunction(config.easing)) {
                self.config.easing = config.easing;
            }

            if (isFunction(config.afterStep)) {
                self.config.afterStep = config.afterStep;
            }
        }
    }

    /**
     * Takes the current timestamp and determines the range progress through an easing function and calculates the next step as a whole number. The whole number is then passed into the after step callback function and if the progress hasn't reached the max range, repeat the task.
     * @param start number
     * @param end number
     * @param config ICounterConfig
     */
    protected static count(
        start: number,
        end: number,
        config: ICounterConfig,
        startTimeStamp: number
    ): void {
        const step = (timestamp: number) => {
            if (!startTimeStamp) {
                startTimeStamp = timestamp;
            }

            const progress = config.easing(
                Math.min((timestamp - startTimeStamp) / config.duration, 1)
            );

            config.afterStep(Math.floor(progress * (end - start) + start));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }

    /**
     * Counts forward from the start to the end range.
     */
    public forward(): void {
        Counter.count(this.start, this.end, this.config, this.startTimeStamp);
    }

    /**
     * Counts backward from the end to the start range.
     */
    public backward(): void {
        Counter.count(this.end, this.start, this.config, this.startTimeStamp);
    }
}
