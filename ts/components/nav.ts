import { elementExists } from "Shared/ts/utils/html";
import FocusNavigator from "Shared/ts/utils/focus-navigator";

export default class Nav {
    /**
     * Represents the root element by ".nav"
     */
    public root: HTMLElement | null;

    /**
     * Represents the label element by ".nav__label"
     */
    public label: HTMLElement | null | undefined;

    /**
     * Represents the underlay element by ".nav__underlay"
     */
    public underlay: HTMLElement | null | undefined;

    /**
     * Represents an array of ".nav__link" elements
     */
    public links: Element[] = [];

    /**
     * Represents the modifier for a selected nav label element
     */
    private static labelIsSelected: string = "nav__label--is-selected";

    /**
     * Represents the modifier for a selected nav root element
     */
    private static RootIsSelected: string = "nav--is-selected";

    /**
     * Allows a label HTMLElement to open, close or toggle a nearby navigation list.
     * @param id string
     */
    constructor(id: string) {
        this.root = document.getElementById(id);

        this.label = this.root?.querySelector(".nav__label");
        this.underlay = this.root?.querySelector(".nav__underlay");

        const root = this.root;

        const focusNavigator = new FocusNavigator(this.root);

        focusNavigator.updateElements();
        focusNavigator.on();

        if (root) {
            this.links = Array.from(
                root.querySelectorAll("a.nav__link")
            ).filter(
                (link) =>
                    !link.hasAttribute("aria-haspopup") &&
                    !link.hasAttribute("aria-expanded")
            );

            focusNavigator.considerElements = () => {
                return Array.from(root.querySelectorAll(".nav__link"));
            };
        }

        this.processEvents();
    }

    /**
     * Registers an event listener on the ".nav__label" to toggle the nav, ".nav__underlay" to close the nav and each ".nav__link" to close the nav.
     */
    public processEvents(): void {
        if (this.label && elementExists(this.label)) {
            this.label.addEventListener("click", this.toggle.bind(this));
        }

        if (this.underlay && elementExists(this.underlay)) {
            this.underlay.addEventListener("click", this.close.bind(this));
        }

        this.links.forEach((link) =>
            link.addEventListener("click", this.close.bind(this))
        );
    }

    /**
     * Toggles the ".nav__label--is-selected" class on the label element between the Close() method and the Open() method.
     */
    public toggle(): void {
        this.root?.classList.toggle(Nav.RootIsSelected);

        if (this.label && elementExists(this.label)) {
            this.label.classList.toggle(Nav.labelIsSelected);
        }
    }

    /**
     * Removes the ".nav__label--is-selected" class from the label element.
     */
    public close(): void {
        this.root?.classList.remove(Nav.RootIsSelected);

        if (this.label && elementExists(this.label)) {
            this.label.classList.remove(Nav.labelIsSelected);
        }
    }

    /**
     * Adds the ".nav__label--is-selected" class to the label element.
     */
    public open(): void {
        this.root?.classList.add(Nav.RootIsSelected);

        if (this.label && elementExists(this.label)) {
            this.label.classList.add(Nav.labelIsSelected);
        }
    }
}
