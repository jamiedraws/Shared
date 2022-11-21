// components
import MediaPlayer from "Shared/ts/components/media-player";

// adapters
import VimeoMediaPlayerAdapter from "Shared/ts/api/media-player/vimeo-media-player";

// observers
import { observer } from "Shared/ts/observers/intersection";

// utils
import CaptureElement from "Shared/ts/utils/capture-element";
import LoadItem from "Shared/ts/utils/load-item";

export const initializeVimeoMediaPlayerByCapture = (
    candidate: Element,
    iframePlaceholder: Element,
    placeholderAttribute: string
) => {
    const captureCandidate = new CaptureElement(iframePlaceholder);

    captureCandidate.subscribe("childList", (record) => {
        const iframe = Array.from(record.addedNodes)
            .filter((node) => node.nodeType === Node.ELEMENT_NODE)
            .find((node) => node.nodeName.toLowerCase() === "iframe") as
            | HTMLIFrameElement
            | undefined;
        if (!iframe) return;

        if (iframe.src !== iframePlaceholder.getAttribute(placeholderAttribute))
            return;

        new MediaPlayer(new VimeoMediaPlayerAdapter(candidate));
    });
};

export const initializeVimeoMediaPlayerByObserver = (
    candidateSelector: string,
    placeholderAttribute: string
) => {
    observer(candidateSelector, {
        inRange: (candidate) => {
            const placeholder = candidate.querySelector(
                `[${placeholderAttribute}]`
            );
            if (!placeholder) return;

            initializeVimeoMediaPlayerByCapture(
                candidate,
                placeholder,
                placeholderAttribute
            );

            new LoadItem(placeholder, {
                tag: "iframe",
                src: placeholderAttribute
            });
        }
    });
};
