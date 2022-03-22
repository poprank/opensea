import { calcMetaTraits, DisplayType, NftInit, TraitBase } from '@poprank/rankings';
import { OpenSeaAssetData } from './types';

// Methods to transform OS NFTs into our own shape

/**
 * Parse an array of OS traits into our own, base type
 * @param traits
 * @param col
 * @returns
 */
export const parseNftTraits = (traits: OpenSeaAssetData['traits'], col: string): TraitBase[] => {
    const outTraits: TraitBase[] = [];

    traits.forEach(n => {
        // Bastard Gan Punks have some real funky encoding for the "CURSED" punk
        // Convert to a normal string until we store byte arrays instead of strings
        const value = col === 'bastard-gan-punks-v2' && n.trait_type === 'BASTARDNESS' && n.trait_count === 5 && n.value.length === 31 ? 'CURSED BASTARD' : `${n.value}`;
        const typeValue = n.trait_type;
        let displayType: DisplayType = n.display_type === 'number' ? 'number' : null;

        // OpenSea seem to have inconsistent `display_type`s, where sometimes a 'number' is still null.
        // Manually specify which traits are `display_type:number` here in the meantime
        if (col === 'rotae-by-nadieh-bremer') {
            if (typeValue === 'wheels' || typeValue === 'symmetry')
                displayType = 'number';
        }

        outTraits.push({
            typeValue: typeValue,
            value,
            category: 'Traits',
            displayType,
        });
    });

    return outTraits;
};


/**
 * Goes through all NFTs, adding them to an array of nfts minus rarity (rarity can only be calculated after
 * we know the complete collection's trait counts)
 * @param savedNfts
 * @param col
 * @param poprankMeta
 * @returns
 */
export const parseAllNfts = (
    savedNfts: OpenSeaAssetData[],
    col: string,
    addMeta?: boolean,
) => {
    const nfts: NftInit[] = [];
    savedNfts.forEach((nft: OpenSeaAssetData) => {
        const nftBaseTraits: TraitBase[] = parseNftTraits(nft.traits, col);
        const nftOutTraits: TraitBase[] = [...nftBaseTraits.slice()];

        // Add all the base traits to the traits we'll add to the NFT, and calculate all "matches"
        nftOutTraits.push(...calcMetaTraits(nftBaseTraits, col, addMeta));


        nfts.push({
            collection: col,
            id: `${nft.token_id}`,
            name: nft.name ?? `#${nft.token_id}`,
            address: nft.asset_contract.address,
            imageUrl: nft.image_url,
            metadataUrl: nft.token_metadata,
            rating: 1200,
            timesSeen: 0,
            timesWon: 0,
            aestheticRank: 0,
            traits: nftOutTraits,
        });
    });

    return { nfts };
};