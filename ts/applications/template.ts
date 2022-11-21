// components
import ToolTip from "Shared/ts/components/tooltip";
import FingerPrintNav from "Shared/ts/components/fingerprint-nav";

// observers
import { observer } from "Shared/ts/observers/intersection";

// utils
import LoadItem from "Shared/ts/utils/load-item";

export const initializeBase = (): void => {
    initializeToolTip();

    observer("[data-src-iframe]", {
        inRange: (element) =>
            new LoadItem(element, {
                src: "data-src-iframe",
                tag: "iframe"
            })
    });
};

export const initializeToolTip = (): void => {
    new ToolTip(document.querySelectorAll(".link"), "link--is-active");
};

export const initializeMicrosite = (): void => {
    const fp = new FingerPrintNav();
    fp.hideWhenElementsInView("form");
};
