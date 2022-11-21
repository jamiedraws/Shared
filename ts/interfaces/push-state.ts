export interface CustomEventMap {
    pushstate: CustomEvent<IPushState>;
}

/**
 * Represents the same interface for the History.pushState() method.
 * https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
 */
export interface IPushState {
    /**
     * Represents the state object that is associated with the new history entry
     */
    state: HistoryPushState;
    /**
     * Represents the title of the state
     */
    title: HistoryPushStateTitle;
    /**
     * Represents the new history entry's URL
     */
    url?: HistoryPushStateUrl;
}

/**
 * Represents the state object that is associated with the new history entry
 */
export type HistoryPushState = any;

/**
 * Represents the title of the state
 */
export type HistoryPushStateTitle = string;

/**
 * Represents the new history entry's URL
 */
export type HistoryPushStateUrl = string | URL | null | undefined;
