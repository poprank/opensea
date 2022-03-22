export const OS_NFT_NOT_FOUND = 'OsNftNotFound';
export const UNKNOWN_ERROR = 'UnknownError';

// 429 = rate limiting, 503 = the random gateway timeouts we get from OS, 495 = some nginx
// error i've been running into intermittently (a retry has always fixed this for me)
export const retriableOsHttpCodes = [429, 495, 503];

/** OS returns `null` if there's no collection banner image */
export type OpenSeaAssetCollectionBannerImageUrlData = string | null;
export type OpenSeaAssetCollectionExternalUrlData = string | null;
export type OpenSeaAssetCollectionDiscordUrlData = string | null;
export type OpenSeaAssetCollectionTwitterUsernameData = string | null;
export type OpenSeaAssetCollectionInstagramUsernameData = string | null;

interface OpenSeaAssetDataBase {
    readonly asset_contract: {
        readonly address: string;
        readonly created_date: string;
        readonly description: string;
        readonly schema_name: string;
    };
    readonly collection: {
        readonly banner_image_url: OpenSeaAssetCollectionBannerImageUrlData;
        readonly created_date: string;
        readonly description: string;
        readonly discord_url: OpenSeaAssetCollectionDiscordUrlData;
        readonly external_url: OpenSeaAssetCollectionExternalUrlData;
        readonly image_url: string;
        readonly instagram_username: OpenSeaAssetCollectionInstagramUsernameData;
        readonly medium_username: string;
        readonly name: string;
        readonly slug: string;
        readonly stats: {
            readonly count: number;
            readonly floor_price: number;
            readonly num_owners: number;
            readonly total_volume: number;
        };
        readonly telegram_url: string;
        readonly twitter_username: OpenSeaAssetCollectionTwitterUsernameData;
    };
    readonly address: string;
    readonly description: string;
    readonly external_link: string;
    readonly image_url: string;
    readonly animation_url: string;
    readonly token_metadata: string;
    readonly name: string;
    readonly permalink: string;
    readonly owner: {
        readonly user: {
            readonly username: string;
        };
        readonly address: string;
        readonly profile_img_url: string;
    };
    readonly token_id: string;
}

export interface OsTrait {
    readonly trait_type: string;
    readonly value: string;
    readonly trait_count: number
    readonly display_type: string;
}

export interface OpenSeaAssetData extends OpenSeaAssetDataBase {
    readonly traits: OsTrait[];

    readonly sell_orders: {
        price: number;
        current_price: string;
        payment_token_contract: {
            symbol: string;
        };
    }[];
}

/**
 * Response data from the following OpenSea API endpoint: https://api.opensea.io/api/v1/assets
 * @see https://docs.opensea.io/reference/getting-assets
 */
export interface OpenSeaAssetsResponseData {
    readonly assets: OpenSeaAssetData[];
    readonly detail?: string;
}
