import Slide from "Shared/ts/api/carousel/slide/slide";
import { ISlide } from "Shared/ts/interfaces/carousel/slide/slide";
import ICarousel from "Shared/ts/interfaces/carousel/carousel";
import { elementExists } from "Shared/ts/utils/html";

export default class SlideCarouselAdapter implements ICarousel {
    public api: ISlide | undefined;
    public container: Element | undefined;
    public parent: Element | undefined;
    public children: HTMLCollection | undefined;

    /**
     * An adapter Api that implements the ICarousel contract while communicating with the Slide Js Api
     * @param container Element
     */
    constructor(container: Element) {
        this.container = container;
        this.api = this.create(container);

        this.parent = this.api?.parent;
        this.children = this.api?.children;
    }

    public create(element: Element) {
        let result: ISlide | undefined;

        if (elementExists(element)) {
            const id = element.querySelector('[id][class*="slide__into"]');

            if (elementExists(id)) {
                result = Slide.into(
                    id,
                    {
                        root: element
                    },
                    (api: ISlide) => {
                        api.root?.classList.add("slide--is-ready");

                        return api;
                    }
                );
            } else {
                console.error({
                    message: `An element requires the class name 'slide__into' and requires an id attribute. No element was found from the container element context.`,
                    element
                });
            }
        }

        return result;
    }

    public isAuto() {
        return this.api?.isAuto() ?? false;
    }

    public setAuto(status: boolean) {
        this.api?.setAuto(status);
    }

    public play(persistCurrentIndex?: boolean) {
        this.api?.play(persistCurrentIndex);
    }

    public pause() {
        this.api?.pause();
    }

    public prev() {
        this.api?.prev();
    }

    public next() {
        this.api?.next();
    }

    public goto(index: number) {
        this.api?.goto(index);
    }

    public watch(
        task: (
            currentIndex: number,
            previousIndex: number,
            nextIndex: number
        ) => void
    ) {
        this.api?.watch(task);
    }

    public nextIndex() {
        return this.api?.nextIndex();
    }

    public currentIndex() {
        return this.api?.currentIndex();
    }

    public prevIndex() {
        return this.api?.prevIndex();
    }

    public countChildren() {
        return this.api?.countChildren();
    }

    public getDelay() {
        return this.api?.getDelay();
    }

    public setDelay(delay: number) {
        return this.api?.setDelay(delay);
    }

    public getIndex(index: number) {
        return this.api?.getIndex(index);
    }

    public setIndex(index: number) {
        this.api?.setIndex(index);
    }
}
