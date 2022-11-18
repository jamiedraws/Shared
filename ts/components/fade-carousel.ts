import Carousel from "Shared/ts/components/carousel";
import IFadeCarousel from "Shared/ts/interfaces/carousel/fade-carousel";
import { elementExists } from "Shared/ts/utils/html";

export default class FadeCarousel extends Carousel {
    /**
     * Represents the current slide CSS class name
     */
    private static currentSlideCSSClassName: string = "slide__item--current";

    /**
     * Extends the Carousel's base functionality by visually animating it as a fader.
     * @param elements HTMLList
     */
    constructor(context: IFadeCarousel) {
        super(context);

        FadeCarousel.initialize(context);
    }

    /**
     * Takes in the FadeCarousel instance and iterates through each element. For each element, the first slide is set as the current slide and a new watch callback function is estabilished.
     * @param context IFadeCarousel
     */
    private static initialize(context: IFadeCarousel): void {
        if (context.children === undefined) return;

        context.initialize();

        FadeCarousel.createWatch(context);
        FadeCarousel.setSlideToCurrent(context.children.item(0));
    }

    /**
     * Takes the Fade Carousel interface context and establishes a new watch callback function that will change on each rotation
     * @param context IFadeCarousel
     */
    private static createWatch(context: IFadeCarousel): void {
        let counter = 1;
        const children = context.countChildren();

        context.watch((currentIndex) => {
            if (
                context.parent === undefined ||
                context.children === undefined ||
                children === undefined
            )
                return;

            FadeCarousel.push(context, "rotation");

            if (counter > children) {
                FadeCarousel.updateCurrentSlide(
                    context.parent,
                    context.children.item(currentIndex)
                );
            }

            if (counter === children) {
                context.setIndex(0);
                FadeCarousel.updateThumbnailNavigationMarkerByIndex(0, context);
            }

            if (counter <= children) {
                counter++;
            }
        });
    }

    /**
     * Takes the parent and attempts to locate the previous slide and remove the current slide CSS class from it and adds the current slide CSS class to the current slide element.
     * @param parent Element
     * @param slide Element
     */
    private static updateCurrentSlide(
        parent: Element,
        slide: Element | null
    ): void {
        const previousSlide = parent.querySelector(
            `.${this.currentSlideCSSClassName}`
        );

        if (elementExists(previousSlide)) {
            previousSlide?.classList.remove(this.currentSlideCSSClassName);
        }

        this.setSlideToCurrent(slide);
    }

    /**
     * Assigns the current slide CSS class name to the target slide element
     * @param slides Element
     */
    private static setSlideToCurrent(slide: Element | null): void {
        slide?.classList.add(this.currentSlideCSSClassName);
    }
}
