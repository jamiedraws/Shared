import IInstagramMediaManager from "Shared/ts/interfaces/instagram-media-manager";
import IInstantTokenManager from "Shared/ts/interfaces/instant-token-manager";

import { IInstantTokenCredentials } from "Shared/ts/interfaces/instant-token-manager";
import { IInstagramMedia } from "Shared/ts/interfaces/instagram-media-manager";

import InstantTokenManager from "Shared/ts/utils/instant-token-manager";
import InstagramMediaManager from "Shared/ts/utils/instagram-media-manager";

export default class InstagramMediaInstantTokenAdapter {
    public credentials: IInstantTokenCredentials;

    private static instantTokenManager: WeakMap<
        InstagramMediaInstantTokenAdapter,
        IInstantTokenManager
    > = new WeakMap();

    private static accessToken: WeakMap<
        InstagramMediaInstantTokenAdapter,
        string
    > = new WeakMap();

    private static instagramMediaManager: WeakMap<
        InstagramMediaInstantTokenAdapter,
        IInstagramMediaManager
    > = new WeakMap();

    constructor(credentials: IInstantTokenCredentials) {
        this.credentials = credentials;

        InstagramMediaInstantTokenAdapter.instantTokenManager.set(
            this,
            new InstantTokenManager(credentials)
        );
    }

    private static getInstantTokenManagerByContext(
        context: InstagramMediaInstantTokenAdapter
    ): IInstantTokenManager | undefined {
        return this.instantTokenManager.get(context);
    }

    private static getInstagramManagerByContext(
        context: InstagramMediaInstantTokenAdapter
    ): IInstagramMediaManager | undefined {
        return this.instagramMediaManager.get(context);
    }

    private static getAccessTokenByContext(
        context: InstagramMediaInstantTokenAdapter
    ): string | undefined {
        return this.accessToken.get(context);
    }

    private static getInstagramManagerOrSetByContext(
        context: InstagramMediaInstantTokenAdapter
    ): Promise<IInstagramMediaManager | undefined> {
        return new Promise<IInstagramMediaManager | undefined>(
            (resolve, reject) => {
                const manager = this.getInstagramManagerByContext(context);

                if (manager) {
                    resolve(manager);
                } else {
                    this.getAccessTokenOrRequest(context)
                        .then((token) => {
                            this.instagramMediaManager.set(
                                context,
                                new InstagramMediaManager(token)
                            );

                            resolve(this.instagramMediaManager.get(context));
                        })
                        .catch((error) => reject(error));
                }
            }
        );
    }

    private static getAccessTokenOrRequest(
        context: InstagramMediaInstantTokenAdapter
    ): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const token = this.getAccessTokenByContext(context);

            if (token) {
                resolve(token);
            } else {
                const instantToken =
                    InstagramMediaInstantTokenAdapter.getInstantTokenManagerByContext(
                        context
                    );

                if (!instantToken) {
                    reject({
                        message: `The Instant Token could not be obtained within the context`,
                        context
                    });

                    return;
                }

                instantToken
                    .requestAccess()
                    .then((accessToken) => resolve(accessToken))
                    .catch((error) => reject(error));
            }
        });
    }

    public requestMedia(): Promise<IInstagramMedia[]> {
        return new Promise<IInstagramMedia[]>((resolve, reject) => {
            InstagramMediaInstantTokenAdapter.getInstagramManagerOrSetByContext(
                this
            ).then((manager) => {
                if (!manager) {
                    reject({
                        message: `The Instagram Media Manager could not be obtained within the context`,
                        context: this
                    });

                    return;
                }

                manager
                    .requestMedia()
                    .then((media) => resolve(media))
                    .catch((error) => reject(error));
            });
        });
    }

    public requestImages(): Promise<IInstagramMedia[]> {
        return new Promise<IInstagramMedia[]>((resolve, reject) => {
            InstagramMediaInstantTokenAdapter.getInstagramManagerOrSetByContext(
                this
            ).then((manager) => {
                if (!manager) {
                    reject({
                        message: `The Instagram Media Manager could not be obtained within the context`,
                        context: this
                    });

                    return;
                }

                manager
                    .requestImages()
                    .then((media) => resolve(media))
                    .catch((error) => reject(error));
            });
        });
    }
}
