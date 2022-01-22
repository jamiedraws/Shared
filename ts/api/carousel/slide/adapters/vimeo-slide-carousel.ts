import SlideCarouselAdapter from "Shared/ts/api/carousel/slide/adapters/slide-carousel";
import IVimeoCarousel from "Shared/ts/interfaces/carousel/vimeo-carousel";

export default class VimeoSlideCarouselAdapter
    extends SlideCarouselAdapter
    implements IVimeoCarousel
{
    /**
     * An adapter Api that implements the IVimeoCarousel contract while communicating with the Slide Js Api
     * @param container Element
     */
    constructor(container: Element) {
        super(container);
    }
}
