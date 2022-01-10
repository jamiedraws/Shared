import ICarousel from "./carousel";
import { ICarouselConfig } from "./carousel";

export interface IResponsiveCarouselConfig extends ICarouselConfig {
    /**
     * Represents the current step factor
     */
    steps: number;
}

/**
 * A contract representing the properties and methods that must conform to the ResponsiveCarousel application
 */
export default interface IResponsiveCarousel extends ICarousel {
    /**
     * Represents the current index number that is influenced by the step factor
     */
    stepIndex: number;
    /**
     * Represents the current step factor
     */
    steps: number;
}
