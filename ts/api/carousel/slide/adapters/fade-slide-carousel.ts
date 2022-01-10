import IFadeCarousel from "Shared/ts/interfaces/carousel/fade-carousel";
import SlideCarouselAdapter from "Shared/ts/api/carousel/slide/adapters/slide-carousel";

export default class FadeSlideCarouselAdapter
    extends SlideCarouselAdapter
    implements IFadeCarousel
{
    /**
     * An adapter Api that implements the IFadeCarousel contract while communicating with the Slide Js Api
     * @param container Element
     */
    constructor(container: Element) {
        super(container);
    }

    /**
     * Disables the Carousel's auto-scroll rotation behavior and enables shim mode
     */
    public initialize() {
        this.api.setShim(true);
        this.api.handleRotation(false);
    }
}
