import { listen } from "shared/ts/observers/event";
import { HTMLList } from "shared/ts/utils/html";

export default class ToolTip {
    // Represents the current target element
    public element: HTMLElement;

    // Represents the list of observable elements
    public elements: HTMLList;

    // Represents the visible state class name
    public name: string;

    /**
     * Establishes functionality to add a visible state class to a target element that is either hovered over or focused and removes the visible state class from the target element when it's hovered out or unfocused.
     * @param name string
     * @param elements HTMLList
     */
    constructor(
        elements: HTMLList = document.querySelectorAll(".tooltip"),
        name: string = "tooltip--is-visible"
    ) {
        this.name = name;
        this.elements = elements;

        ToolTip.setVisibleEvents(this);
        ToolTip.setInvisibleEvents(this);
    }

    /**
     * Adds the visible state class to the current element.
     */
    protected makeVisible(): void {
        this.element?.classList.add(this.name);
    }

    /**
     * Removes the visible state class from the current element.
     */
    protected makeInvisible(): void {
        this.element?.classList.remove(this.name);
    }

    /**
     * Updates the element property to either the Event.target as an HTMLElement or defaults to the previous HTMLElement.
     * @param self ToolTip
     * @param event Event
     */
    private static setElementToEventTargetOrDefault(
        self: ToolTip,
        event: Event
    ): void {
        self.element = (event.target as HTMLElement) ?? self.element;
    }

    /**
     * This event listener callback attempts to update the element property with the Event.target and then adds the visible state class to the element target.
     * @param self ToolTip
     * @param event Event
     */
    private static processVisibleEvents(self: ToolTip, event: Event): void {
        ToolTip.setElementToEventTargetOrDefault(self, event);
        self.makeVisible();
    }

    /**
     * This event listener callback attempts to update the element property with the Event.target and then removes the visible state class from the element target.
     * @param self ToolTip
     * @param event Event
     */
    private static processInvisibleEvents(self: ToolTip, event: Event): void {
        ToolTip.setElementToEventTargetOrDefault(self, event);
        self.makeInvisible();
    }

    /**
     * Registers the "mouseenter" and "focus" event listeners to add the visible state class to the target element.
     * @param self ToolTip
     */
    private static setVisibleEvents(self: ToolTip): void {
        listen(
            self.elements,
            this.processVisibleEvents.bind(self, self),
            "mouseenter"
        );
        listen(
            self.elements,
            this.processVisibleEvents.bind(self, self),
            "focus"
        );
    }

    /**
     * Registers the "mouseleave", "listen" and "keydown" event listeners to remove the visible state class from the target element. The default keyboard command to trigger is the "escape" key.
     * @param self ToolTip
     */
    private static setInvisibleEvents(self: ToolTip): void {
        listen(
            self.elements,
            this.processInvisibleEvents.bind(self, self),
            "mouseleave"
        );
        listen(
            self.elements,
            this.processInvisibleEvents.bind(self, self),
            "blur"
        );
        addEventListener(
            "keydown",
            self.makeInvisibleByKey.bind(self, "escape")
        );
        addEventListener("keydown", self.makeInvisibleByKey.bind(self, "esc"));
    }

    /**
     * Removes the visible state class from the target element when the captured key command satifies the required keyboard name.
     * @param key string
     * @param event KeyboardEvent
     */
    protected makeInvisibleByKey(key: string, event: KeyboardEvent): void {
        if (event.key?.toLowerCase() === key.toLowerCase()) {
            this.makeInvisible();
        }
    }
}
