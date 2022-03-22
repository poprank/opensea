import axios from 'axios';
import { OS_API_URL, OS_MAX_REQUEST_OFFSET } from './constants';
import { OpenSeaAssetData, OpenSeaAssetsResponseData, OS_NFT_NOT_FOUND, retriableOsHttpCodes, UNKNOWN_ERROR } from './types';

// Our interactions with the OS API

/**
 * Gets the OS info for a specified NFT given a slug and a token id. Calls itself recursively if there are 429s or 503s
 * @param collection
 * @param id
 * @param retryCount
 * @returns
 */
export const getNFTInfo = async (collection: string, id: string, openSeaKey?: string, retryCount = 0): Promise<OpenSeaAssetData> => {
    try {
        const nft = (await axios.get(`${OS_API_URL}/assets`, {
            headers: openSeaKey ? { 'X-API-KEY': openSeaKey } : undefined,
            params: { collection, token_ids: id },
        })).data;
        process.stdout.write(`🐿️ [${new Date().toLocaleString()}] Retrieved data for NFT ${id}\r`); // Overwrites line

        if (!nft.assets || nft.assets.length === 0){
            const error = new Error("OS's NFT endpoint returned nothing");
            error.name = OS_NFT_NOT_FOUND;

            throw error;
        }

        return nft.assets[0];
    } catch (err: any) {
        console.error('error:' + err);

        // A pseudo 404 we throw ourselves just above
        if (err.name === OS_NFT_NOT_FOUND){
            throw err;
        }

        // We see from time to time OS 503s that go away on retry
        if (retriableOsHttpCodes.includes(err.response.status) && retryCount < 5) {
            await new Promise((resolve) => {
                setTimeout(resolve, 5000);
            });
            return await getNFTInfo(collection, id, openSeaKey, retryCount + 1);
        } else if (err.response.status === 404) {
            const error = new Error("OS's NFT endpoint returned a 404");
            error.name = OS_NFT_NOT_FOUND;

            throw error;
        }

        const error = new Error("OS's NFT endpoint returned a 404");
        error.name = UNKNOWN_ERROR;
        throw error;
    }
};


/**
 * Gets the first 10,050 assets from an OpenSea `collection` via paginated requests.
 * OpenSea has a hidden `offset` limit of 10,000, so we can only get collections that have at most 10,050 items.
 * @see https://docs.opensea.io/reference/getting-assets
 */
export const getNFTsFromOSPagination = async (collection: string, openSeaKey?: string): Promise<OpenSeaAssetData[]> => {
    const limit = 50;

    console.log(`Retrieving NFTs for ${collection}`);
    let nfts: OpenSeaAssetData[] = [];
    const waitAfter429 = 5000;
    let lastThrottle = Date.now() - waitAfter429;
    for (let offset = 0; offset <= OS_MAX_REQUEST_OFFSET; offset += limit) {
        if (Date.now() - lastThrottle < waitAfter429) {
            offset -= limit;
            continue;
        }

        try {
            const response = (await axios.get<OpenSeaAssetsResponseData>(`${OS_API_URL}/assets`, {
                headers: openSeaKey ? { 'X-API-KEY': openSeaKey } : undefined,
                params: { collection, limit, offset },
            })).data;
            const osNfts = response.assets;
            process.stdout.write(`🐿️ [${new Date().toLocaleString()}] Retrieved ${osNfts.length} NFTs for limit:${limit} and offset:${offset}. We have ${nfts.length} so far.\r`); // Overwrites line

            if (!osNfts || !osNfts.length) {
                break;
            }
            nfts = [...nfts, ...osNfts];

        } catch (err: any) {
            console.error('error:' + err);
            if (retriableOsHttpCodes.includes(err.response.status)) {
                lastThrottle = Date.now();
                offset -= limit;
            }
        }
    }

    return nfts;
};

/**
 * Gets all NFTs that aren't in the token list. It queries for the NFTs individually, starting from 0 and going until it doesn't find and NFT.
 * It will check for tokenId 0 but also wont return early if it doesn't find one there, in case collections are 1-indexed. For any other index
 * number, if it doesn't find an NFT, it will then mark that as the end of the collection. Often used after we've gotten the first 10k
 * NFTs via pagination
 * @param collection
 * @param tokens
 * @param contract_address
 * @returns
 // TODO: FIX THE ASSUMPTION THAT TOKEN IDS ARE SEQUENTIAL
 */
export const getNFTsNotInTokenList = async (collection: string, tokens: number[], openSeaKey?: string): Promise<OpenSeaAssetData[]> => {
    let nfts: OpenSeaAssetData[] = [];
    let i = 0;
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
        if (tokens.includes(i)) {
            i++;
            continue;
        }

        try {
            const nft =  await getNFTInfo(collection, `${i}`, openSeaKey);
            nfts = nfts.concat(nft);
            i++;
        } catch (e: any) {
            // Account for the fact that some collections are 0 indexed, some arent. If we dont find an NFT at 0, try 1
            if (e.name === OS_NFT_NOT_FOUND && i === 0) {
                i++;
                continue;
            } else {
                console.log(e);
                break;
            }
        }

    }

    return nfts;
};

/**
 * Get all of a collection's NFTs from OS. Gets the first 10,050 via pagination, but as the max offset is 10,000, after
 * that if there are still NFTs to be had, it gets them individually
 * @param collection
 * @returns
 */
export const getAllNFTsFromOs = async (collection: string, openSeaKey?: string): Promise<OpenSeaAssetData[]> => {
    let nfts: OpenSeaAssetData[] = [];
    nfts = nfts.concat(await getNFTsFromOSPagination(collection, openSeaKey));

    const idsAlready = nfts.map(n => parseInt(n.token_id));
    // Skipping the IDs of the NFTs we already have, go from 0 ++ until we hit a 404
    nfts = nfts.concat(await getNFTsNotInTokenList(collection, idsAlready, openSeaKey));
    console.log(idsAlready.length);

    nfts.sort((a, b) => parseInt(a.token_id) - parseInt(b.token_id));

    return nfts;
};
