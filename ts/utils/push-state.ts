import {
    CustomEventMap,
    HistoryPushState,
    HistoryPushStateTitle,
    HistoryPushStateUrl,
    IPushState
} from "../interfaces/push-state";

declare global {
    interface Window {
        addEventListener<K extends keyof CustomEventMap>(
            type: K,
            listener: (this: Window, ev: CustomEventMap[K]) => void
        ): void;
    }
}

/**
 * Proxy for the History.pushState() method that triggers a new custom event "pushstate" to fire on the window object.
 * @param state HistoryPushState
 * @param title HistoryPushStatetitle
 * @param url HistoryPushStateUrl
 */
export const pushState = (
    state: HistoryPushState,
    title: HistoryPushStateTitle,
    url?: HistoryPushStateUrl
): void => {
    const event = new CustomEvent<IPushState>("pushstate", {
        detail: {
            state,
            title,
            url
        }
    });

    window.dispatchEvent(event);

    return history.pushState(state, title, url);
};
