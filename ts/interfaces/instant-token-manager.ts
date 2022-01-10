export default interface IInstantTokenManager {
    setEndpoint: () => string;
    requestAccess: () => Promise<string>;
}

export interface IInstantTokenCredentials {
    userId: string;
    instagramId: string;
    userSecret: string;
}
