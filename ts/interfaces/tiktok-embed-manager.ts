export interface ITikTokOembedResponse {
    // "version": "1.0"
    version: string;
    // "type": "video"
    type: string;
    // "title": "Scramble up ur name & I’ll try to guess it😍❤️ #foryoupage #petsoftiktok #aesthetic"
    title: string;
    // "author_url": "https://www.tiktok.com/@scout2015"
    author_url: string;
    // "author_name": "Scout & Suki"
    author_name: string;
    // "width": "100%"
    width: string;
    // "height": "100%"
    height: string;
    /**
     * "html": "<blockquote class=\"tiktok-embed\" cite=\"https://www.tiktok.com/@scout2015/video/6718335390845095173\" data-video-id=\"6718335390845095173\" data-embed-from=\"oembed\" style=\"max-width: 605px;min-width: 325px;\" > <section> <a target=\"_blank\" title=\"@scout2015\" href=\"https://www.tiktok.com/@scout2015?refer=embed\">@scout2015</a> <p>Scramble up ur name & I’ll try to guess it😍❤️ <a title=\"foryoupage\" target=\"_blank\" href=\"https://www.tiktok.com/tag/foryoupage?refer=embed\">#foryoupage</a> <a title=\"petsoftiktok\" target=\"_blank\" href=\"https://www.tiktok.com/tag/petsoftiktok?refer=embed\">#petsoftiktok</a> <a title=\"aesthetic\" target=\"_blank\" href=\"https://www.tiktok.com/tag/aesthetic?refer=embed\">#aesthetic</a></p> <a target=\"_blank\" title=\"♬ original sound - 𝐇𝐚𝐰𝐚𝐢𝐢𓆉\" href=\"https://www.tiktok.com/music/original-sound-6689804660171082501?refer=embed\">♬ original sound - 𝐇𝐚𝐰𝐚𝐢𝐢𓆉</a> </section> </blockquote> <script async src=\"https://www.tiktok.com/embed.js\"></script>"
     */
    html: string;
    // "thumbnail_width": 720
    thumbnail_width: number;
    // "thumbnail_height": 1280
    thumbnail_height: number;
    // "thumbnail_url": "https://p16.muscdn.com/obj/tos-maliva-p-0068/06kv6rfcesljdjr45ukb0000d844090v0200010605"
    thumbnail_url: string;
    // "provider_url": "https://www.tiktok.com"
    provider_url: string;
    // "provider_name": "TikTok"
    provider_name: string;
}

export interface ITikTokTag {
    name: string;
    url: string;
}

export interface ITikTokThumbnail {
    width: number;
    height: number;
    url: string;
}

export interface ITikTokOriginalSound {
    name: string;
    url: string;
}

export interface ITikTokEmbed {
    authorName: string;
    authorUrl: string;
    videoUrl: string;
    thumbnail: ITikTokThumbnail;
    tags: ITikTokTag[];
    title: string;
    originalSound: ITikTokOriginalSound;
}
