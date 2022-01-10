import { IInstagramMedia } from "../interfaces/instagram-media-manager";

export default class InstagramMediaManager {
    private static endpoint: string =
        "https://graph.instagram.com/me/media?fields=caption,id,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token={accessToken}";

    public accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    public setEndpoint(): string {
        return InstagramMediaManager.endpoint.replace(
            "{accessToken}",
            this.accessToken
        );
    }

    public requestImages(): Promise<IInstagramMedia[]> {
        return new Promise<IInstagramMedia[]>((resolve, reject) => {
            this.requestMedia()
                .then((media) => {
                    resolve(media.filter((m) => m.media_url));
                })
                .catch((error) => reject(error));
        });
    }

    public requestMedia(): Promise<IInstagramMedia[]> {
        return new Promise<IInstagramMedia[]>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.addEventListener("load", function () {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.response);

                    resolve(data.data as IInstagramMedia[]);
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
