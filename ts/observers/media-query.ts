type MediaQueryTask = (event: MediaQueryList) => void;

interface MediaQueryController {
    name: string;
    task: MediaQueryTask;
}

interface MediaQueryRepository {
    isEventsProcessed: boolean;
}

export default class MediaQuery {
    private mediaQueryList: MediaQueryList;

    private static controller: WeakMap<MediaQueryList, MediaQueryController[]> =
        new WeakMap();

    private static repository: WeakMap<MediaQueryList, MediaQueryRepository> =
        new WeakMap();

    /**
     * Using a media query string (identical to that of a CSS media query) and executes a inbound method, when the condition is met, and an outbound method, when the condition is not met.
     * @param mediaQuery string
     */
    constructor(mediaQuery: string) {
        this.mediaQueryList = matchMedia(mediaQuery);

        MediaQuery.initialize(this.mediaQueryList);
    }

    private static initialize(mediaQueryList: MediaQueryList): void {
        this.controller.set(mediaQueryList, []);
        this.repository.set(mediaQueryList, {
            isEventsProcessed: false
        });
    }

    private static getController(
        mediaQueryList: MediaQueryList
    ): MediaQueryController[] | undefined {
        return this.controller.get(mediaQueryList);
    }

    private static getRepository(
        mediaQueryList: MediaQueryList
    ): MediaQueryRepository | undefined {
        return this.repository.get(mediaQueryList);
    }

    private static processEvents(context: MediaQuery): void {
        const repository = this.getRepository(context.mediaQueryList);
        if (!repository) return;

        if (!repository.isEventsProcessed) {
            repository.isEventsProcessed = true;

            this.observe(context.mediaQueryList);

            const hasEventListener =
                "addEventListener" in context.mediaQueryList;

            if (hasEventListener) {
                context.mediaQueryList.addEventListener(
                    "change",
                    (event: MediaQueryListEvent) => {
                        MediaQuery.observe(event.target as MediaQueryList);
                    }
                );
            }

            if (!hasEventListener) {
                context.mediaQueryList.addListener(
                    (event: MediaQueryListEvent) => {
                        MediaQuery.observe(event as any);
                    }
                );
            }
        }
    }

    private static observe(mediaQueryList: MediaQueryList): void {
        const controller = this.getController(mediaQueryList);
        if (!controller) return;

        if (mediaQueryList.matches) {
            const response = controller.find(
                (control) => control.name === "inbound"
            );

            response?.task(mediaQueryList);
        } else {
            const response = controller.find(
                (control) => control.name === "outbound"
            );

            response?.task(mediaQueryList);
        }
    }

    private static pushTask(
        name: string,
        task: MediaQueryTask,
        context: MediaQuery
    ): void {
        const controller = this.getController(context.mediaQueryList);
        if (!controller) return;

        controller.push({
            name: name,
            task: task
        });

        this.processEvents(context);
    }

    /**
     * This method executes when a media query condition is met
     * @param task MediaQueryTask
     * @returns MediaQuery
     */
    public inbound(task: MediaQueryTask): MediaQuery {
        MediaQuery.pushTask("inbound", task, this);

        return this;
    }

    /**
     * This method executes when a media query condition is not met
     * @param task MediaQueryTask
     * @returns MediaQuery
     */
    public outbound(task: MediaQueryTask): MediaQuery {
        MediaQuery.pushTask("outbound", task, this);

        return this;
    }
}
