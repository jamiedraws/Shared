import ICarousel from "./carousel";

/**
 * A contract representing the properties and methods that must conform to the FadeCarousel application
 */
export default interface IFadeCarousel extends ICarousel {
    /**
     * Represents an initializer method that can serve as an adapter step to converting an ICarousel to IFadeCarousel
     */
    initialize: () => void;
}
