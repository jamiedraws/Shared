// @ts-nocheck

import {
    ISlideApi,
    ISlideOrganization,
    ISlideDefault,
    ISlideWorker
} from "Shared/ts/interfaces/carousel/slide/slide";

type SlideIntoTask = () => void;

const generate = function <P extends {}>(properties: P, o?: {} | undefined) {
    const x = Object.defineProperties(o || {}, properties);
    return x;
};

const toArray = function (
    collection: NodeList | HTMLCollection
): (Node | Element)[] {
    return Array.from(collection);
};

const slide = generate({
    defaults: {
        value: generate({
            delay: {
                value: 3000
            },
            noScroll: {
                value: "slide__into--no-scroll"
            },
            error: {
                value: "The passed error code could not be found."
            }
        })
    },
    docs: {
        value: generate({
            error: {
                value: "https://github.com/jamiedraws/Slide/wiki/Slide.js#api-errors"
            }
        })
    },
    errors: {
        value: generate({
            "ERR-E": {
                value: "The passed 'element' must be an element."
            },
            "ERR-P": {
                value: "The passed 'element' could not be found."
            },
            "ERR-N": {
                value: "The passed 'element' is not a node element."
            },
            "ERR-X": {
                value: "The passed 'index' is not a number."
            },
            "ERR-M": {
                value: "The passed error 'code' or 'message' is not a string."
            },
            "ERR-C": {
                value: "The passed error 'code' is not a string."
            }
        })
    },
    team: {
        value: []
    },
    request: {
        value: function (id: string): ISlideWorker {
            return this.team[id];
        }
    },
    observer: {
        value: function (
            parent: Element,
            children: NodeList,
            cb: (index: number) => void
        ) {
            if (window.hasOwnProperty("IntersectionObserver")) {
                const io = new IntersectionObserver(
                    function (entries) {
                        entries.forEach(function (entry) {
                            if (
                                entry.intersectionRatio > 0 &&
                                entry.isIntersecting
                            ) {
                                const items = toArray(children);
                                const index = items.indexOf(entry.target);

                                cb(index);
                            }
                        });
                    },
                    {
                        root: parent,
                        rootMargin: "0px",
                        threshold: 0.9
                    }
                );

                return function (children: NodeList) {
                    const items = toArray(children);
                    items.forEach(function (item) {
                        io.observe(item as Element);
                    });
                };
            } else {
                return function () {
                    const noScroll = slide.defaults.noScroll;
                    this.shim = true;
                    this.parent.classList.add(noScroll);
                };
            }
        }
    },
    manager: {
        value: generate({
            config: {
                value: function (options: Record<string, any>) {
                    const self = this;

                    if (typeof options === "object") {
                        Object.keys(options).forEach(function (option) {
                            Object.defineProperty(self, option, {
                                enumerable: true,
                                value: options[option]
                            });
                        });
                    }
                }
            },
            create: {
                value: function (
                    api: ISlideApi,
                    id: string,
                    parent: Element,
                    config
                ) {
                    const self = Object.create(api);

                    Object.defineProperties(self, {
                        name: {
                            set: function (parent) {
                                this.parent = parent;
                            },
                            get: function () {
                                return this.parent.id;
                            }
                        },
                        id: {
                            value: id
                        }
                    });

                    self.name = parent;

                    this.config.call(self, config);

                    return self;
                }
            },
            assign: {
                value: function () {
                    const self = Object.create(this);

                    self.index = 0;
                    self.shim = false;
                    self.auto = false;
                    self.handleRotation = true;
                    self.timer = 0;
                    self.delay = slide.defaults.delay;
                    self.scrollIntoViewOptions = {
                        block: "nearest",
                        inline: "start"
                    };

                    return self;
                }
            },
            observer: {
                value: function (parent: Element, children: HTMLCollection) {
                    const self = this;
                    return slide.observer(
                        parent,
                        children,
                        function (index: number) {
                            self.setIndex(index);
                            self.setCallback();
                        }
                    );
                }
            },
            getIndex: {
                value: function (index: number) {
                    let result = this.index;
                    const children = this.children.length;

                    if (typeof index === "number") {
                        result = index;
                    }

                    if (result === children) {
                        result = 0;
                    } else if (result < 0) {
                        result = children - 1;
                    }

                    return result;
                }
            },
            setIndex: {
                value: function (index: number) {
                    this.index = this.getIndex(index);
                }
            },
            setRotation: {
                value: function () {
                    const item = this.children[this.index];
                    item.scrollIntoView(this.scrollIntoViewOptions);
                }
            },
            isValidNumber: {
                value: function (number: number) {
                    return typeof number === "number" && !isNaN(number);
                }
            },
            setDelay: {
                value: function (time: string) {
                    let parseTime = parseInt(time);

                    const illegal =
                        !this.isValidNumber(parseTime) ||
                        parseTime < slide.defaults.delay;

                    if (illegal) {
                        parseTime = this.delay;
                    }

                    this.delay = parseTime;
                }
            },
            setCallback: {
                value: function () {
                    if (typeof this.handleCallback === "function") {
                        this.handleCallback(
                            this.index,
                            this.getIndex(this.index - 1),
                            this.getIndex(this.index + 1)
                        );
                    }
                }
            },
            setTimer: {
                value: function (cb) {
                    if (this.auto) {
                        this.timer = setTimeout(cb, this.delay);
                    } else {
                        clearTimeout(this.timer);
                    }
                }
            },
            routeCallback: {
                value: function (cb) {
                    if (this.shim) {
                        this.setCallback(cb);
                    }
                    cb();
                }
            },
            setTask: {
                value: function (index: number) {
                    const self = this;

                    self.setDelay();
                    self.setIndex(index);
                    if (this.handleRotation) {
                        self.setRotation();
                    }
                    self.routeCallback(function () {
                        self.setTimer(function () {
                            self.setTask(self.index + 1);
                        });
                    });
                }
            }
        })
    },
    api: {
        value: generate({
            parent: {
                set: function (parent) {
                    this.validateNodeElement(parent);

                    const worker = slide.request(this.id);

                    worker.id = this.id;
                    worker.parent = parent;
                    worker.observe = worker.observer(
                        worker.parent,
                        parent.children
                    );

                    this.children = parent.children;
                },
                get: function () {
                    const worker = slide.request(this.id);
                    return worker.parent;
                }
            },
            validateNodeElement: {
                value: function (element) {
                    if (typeof element !== "object") {
                        this.getError("ERR-E");
                    }
                    if (element === null) {
                        this.getError("ERR-P");
                    }
                    if (element.nodeType !== 1) {
                        this.getError("ERR-N");
                    }
                    return true;
                }
            },
            toArray: {
                value: toArray
            },
            children: {
                set: function () {
                    const worker = slide.request(this.id);
                    worker.children = worker.parent.children;
                    worker.observe(worker.children);
                },
                get: function () {
                    const worker = slide.request(this.id);
                    return worker.children;
                }
            },
            isAuto: {
                value: function () {
                    const worker = slide.request(this.id);
                    return worker.auto;
                }
            },
            setAuto: {
                value: function (status: boolean) {
                    const worker = slide.request(this.id);
                    if (typeof status === "boolean") {
                        worker.auto = status;
                    }
                }
            },
            setScrollIntoView: {
                value: function (options: ScrollIntoViewOptions) {
                    const worker = slide.request(this.id);
                    if (
                        typeof options === "object" ||
                        typeof options === "boolean"
                    ) {
                        worker.scrollIntoViewOptions = options;
                    }
                }
            },
            watch: {
                value: function (task) {
                    const worker = slide.request(this.id);
                    worker.handleCallback = task.bind(this);

                    if (!("IntersectionObserver" in window)) {
                        worker.setCallback();
                    }
                }
            },
            countChildren: {
                value: function () {
                    return this.children.length;
                }
            },
            getDelay: {
                value: function () {
                    const worker = slide.request(this.id);
                    return worker.delay;
                }
            },
            setDelay: {
                value: function (delay: string) {
                    const worker = slide.request(this.id);
                    worker.setDelay(delay);
                }
            },
            setError: {
                value: function (code: string, message: string) {
                    if (
                        typeof code === "string" &&
                        typeof message === "string"
                    ) {
                        Object.defineProperty(slide.errors, code, {
                            value: message
                        });
                    } else {
                        this.getError("ERR-M");
                    }
                }
            },
            getError: {
                value: function (code: string) {
                    if (typeof code !== "string") {
                        code = "ERR-C";
                    }

                    const error = slide.errors[code] || slide.defaults.error;
                    const help = slide.docs.error;
                    const message = code + ": " + error + " / " + help;
                    throw message;
                }
            },
            hasError: {
                value: function (code: string) {
                    return slide.errors.hasOwnProperty(code);
                }
            },
            config: {
                value: function (options: {}) {
                    const worker = slide.request(this.id);
                    worker.config.call(this, options);
                }
            },
            setShim: {
                enumerable: true,
                value: function (status: boolean) {
                    const worker = slide.request(this.id);

                    if (typeof status === "boolean") {
                        worker.shim = status;
                    }
                }
            },
            play: {
                enumerable: true,
                value: function (persistCurrentIndex?: boolean) {
                    const worker = slide.request(this.id);
                    const index =
                        typeof persistCurrentIndex === "boolean" &&
                        persistCurrentIndex
                            ? worker.index
                            : worker.index + 1;

                    this.pause();
                    worker.auto = true;
                    worker.setTask(index);
                }
            },
            pause: {
                enumerable: true,
                value: function () {
                    const worker = slide.request(this.id);
                    worker.auto = false;
                    clearTimeout(worker.timer);
                }
            },
            prev: {
                enumerable: true,
                value: function () {
                    const worker = slide.request(this.id);
                    this.pause();
                    worker.setTask(worker.index - 1);
                }
            },
            next: {
                enumerable: true,
                value: function () {
                    const worker = slide.request(this.id);
                    this.pause();
                    worker.setTask(worker.index + 1);
                }
            },
            prevIndex: {
                value: function () {
                    const worker = slide.request(this.id);
                    return worker.getIndex(worker.index - 1);
                }
            },
            nextIndex: {
                value: function () {
                    const worker = slide.request(this.id);
                    return worker.getIndex(worker.index + 1);
                }
            },
            currentIndex: {
                value: function () {
                    const worker = slide.request(this.id);
                    return worker.index;
                }
            },
            getIndex: {
                value: function (index: number) {
                    if (typeof index !== "number") {
                        this.getError("ERR-X");
                    }

                    const worker = slide.request(this.id);
                    return worker.getIndex(index);
                }
            },
            setIndex: {
                value: function (index: number) {
                    if (typeof index !== "number") {
                        this.getError("ERR-X");
                    }

                    const worker = slide.request(this.id);
                    return worker.setIndex(index);
                }
            },
            handleRotation: {
                value: function (status: boolean) {
                    const worker = slide.request(this.id);
                    if (typeof status === "boolean") {
                        worker.handleRotation = status;
                    }
                }
            },
            goto: {
                enumerable: true,
                value: function (index: number) {
                    if (typeof index !== "number") {
                        this.getError("ERR-X");
                    }

                    const worker = slide.request(this.id);
                    this.pause();
                    worker.setIndex(index);
                    worker.setTask();
                }
            }
        })
    },
    interface: {
        value: generate({
            into: {
                value: function (
                    parent: Element,
                    init: SlideIntoTask | Record<string, any>,
                    app: SlideIntoTask | Record<string, any>
                ) {
                    const worker = slide.manager.assign();
                    let task = app;
                    let options = {};

                    slide.team.push(worker);

                    if (typeof init === "function") {
                        task = init;
                    }

                    if (typeof init === "object") {
                        options = init;
                    } else if (typeof app === "object") {
                        options = app;
                    }

                    const ui = slide.manager.create(
                        slide.api,
                        slide.team.length - 1,
                        parent,
                        options
                    );

                    return task.call(ui, ui);
                }
            },
            proto: {
                value: function (parameters: Record<string, any>) {
                    if (typeof parameters === "object") {
                        Object.create(slide.api, parameters);
                        Object.keys(parameters).forEach(function (parameter) {
                            Object.defineProperty(slide.api, parameter, {
                                writable: false,
                                configurable: false,
                                enumerable: true,
                                value: parameters[parameter]
                            });
                        });
                    }
                }
            }
        })
    }
});

export const Slide = slide.interface;

export default Slide;
