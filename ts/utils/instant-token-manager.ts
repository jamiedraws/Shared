import { IInstantTokenCredentials } from "../interfaces/instant-token-manager";

export default class InstantTokenManager {
    public userId: string;
    public instagramId: string;
    public userSecret: string;

    constructor(credentials: IInstantTokenCredentials) {
        this.userId = credentials.userId;
        this.instagramId = credentials.instagramId;
        this.userSecret = credentials.userSecret;
    }

    public setEndpoint(): string {
        let endpoint =
            "https://ig.instant-tokens.com/users/{user-id}/instagram/{instagram-id}/token?userSecret={user-secret}";

        endpoint = endpoint.replace("{user-id}", this.userId);
        endpoint = endpoint.replace("{instagram-id}", this.instagramId);
        endpoint = endpoint.replace("{user-secret}", this.userSecret);

        return endpoint;
    }

    public requestAccess(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.addEventListener("load", function () {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.response);
                    resolve(data.Token);
                } else {
                    reject();
                }
            });

            xhr.addEventListener("error", () => reject());
            xhr.open("GET", this.setEndpoint());

            xhr.send();
        });
    }
}
