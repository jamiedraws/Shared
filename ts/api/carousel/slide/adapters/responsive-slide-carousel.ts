import IResponsiveCarousel from "../../../../interfaces/carousel/responsive-carousel";
import SlideCarouselAdapter from "./slide-carousel";

export default class ResponsiveSlideCarouselAdapter
    extends SlideCarouselAdapter
    implements IResponsiveCarousel
{
    /**
     * An adapter Api that implements the IResponsiveCarousel contract while communicating with the Slide Js Api
     * @param container Element
     */
    constructor(container: Element) {
        super(container);
    }

    public stepIndex: number = 0;
    public steps: number = 1;
}
