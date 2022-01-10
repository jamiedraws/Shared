import Carousel from "./carousel";
import IResponsiveCarousel from "../interfaces/carousel/responsive-carousel";
import { IResponsiveCarouselConfig } from "../interfaces/carousel/responsive-carousel";
import { ICounterConfig } from "./counter";

export default class ResponsiveCarousel extends Carousel {
    /**
     * Extends base carousel's functionality by allowing carousel to advance by x-number of steps
     * @param context IResponsiveCarousel
     */
    constructor(context: IResponsiveCarousel) {
        super(context);

        ResponsiveCarousel.initialize(context);
    }

    private static initialize(context: IResponsiveCarousel) {
        context.watch((currentIndex) => {
            ResponsiveCarousel.push(context, "rotation");

            if (context.steps === 1) {
                context.stepIndex = currentIndex;
            }
        });
    }

    /**
     * Takes an IResponsiveCarouselConfig interface and converts key-value pairs into a string representation of the carousel configuration. This configuration replaces the previous configuration on data-carousel-config attribute.
     * @param config IResponsiveCarouselConfig
     */
    public setAttributes(config: IResponsiveCarouselConfig): void {
        const container = this.container as HTMLElement;

        try {
            container.dataset.carouselConfig = JSON.stringify(config);
        } catch (error) {
            console.warn(error);
        }
    }

    /**
     * Takes an IResponsiveCarouselConfig interface along with an ICarousel interface and processes specific keys to operate using its values
     * @param config IResponsiveCarouselConfig
     * @param context ICarousel
     */
    protected processAttributes(
        config: IResponsiveCarouselConfig,
        context: IResponsiveCarousel
    ): void {
        if (config.steps) {
            context.steps = config.steps;
        }
    }

    public play() {
        const context = ResponsiveCarousel.getContext(
            this.container
        ) as IResponsiveCarousel;

        context.play();
    }

    public next() {
        const context = ResponsiveCarousel.getContext(
            this.container
        ) as IResponsiveCarousel;
        const sum = context.countChildren();

        context.stepIndex += context.steps;

        if (context.stepIndex >= sum) {
            context.stepIndex = 0;
        }

        context.goto(context.stepIndex);
    }

    public prev() {
        const context = ResponsiveCarousel.getContext(
            this.container
        ) as IResponsiveCarousel;
        const sum = context.countChildren();

        context.stepIndex -= context.steps;

        if (context.stepIndex < 0) {
            context.stepIndex = sum - context.steps;
        }

        context.goto(context.stepIndex);
    }
}
