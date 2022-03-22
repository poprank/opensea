import { calculateRarity } from '@poprank/rankings';
import * as dotenv from 'dotenv';
import fs from 'fs';
import { OpenSeaAssetData } from '../src';
import { parseAllNfts } from '../src/nfts';
import { getAllNFTsFromOs } from '../src/os';

dotenv.config();

const getFilePath = (collection: string, savePath?: string)=>`${savePath ?? './'}${collection}-os.json`;

/**
 * Simple helper to save the NFTs we get from OS, so that if you're playing around with different
 * rarity calculations / whatever, you don't have to make hundreds of requests to OS each time
 * @param collection
 * @param savePath
 */
const saveAllNftsFromOs = async (collection: string, openSeaKey?: string, savePath?: string): Promise<void> => {
    const nfts = await getAllNFTsFromOs(collection, openSeaKey);

    const nftsCleaned = nfts.map(nft => nft.image_url ? nft : undefined).filter(n => !!n);
    // if (nfts.length !== nftsCleaned.length) {
    //     console.log("SOME NFTS ARE UNREVEALED!!!! comment this out to save the NFTs, then update.ts will update all of their metadata");
    //     return;
    // }
    // console.log(nftsCleaned.find(n => n?.token_id === '272'));
    const jsonString = JSON.stringify(nftsCleaned);

    await fs.writeFile(getFilePath(collection, savePath), jsonString, err => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
};

const exampleCalculateRarityOfAllNfts = async (collection: string, savePath?: string)=>{
    const data = fs.readFileSync(getFilePath(collection, savePath), { encoding: 'utf8', flag: 'r' });
    const savedNfts: OpenSeaAssetData[] = JSON.parse(data);
    const { nfts } = parseAllNfts(savedNfts, collection, true);

    const { nftsWithRarityAndRank } = calculateRarity(nfts);

    nftsWithRarityAndRank.sort((a, b)=>a.rarityTraitSumRank - b.rarityTraitSumRank);

    const top5 = nftsWithRarityAndRank.slice(0, 5);
    console.log('And your top 5 are:');
    top5.forEach(nft=>{console.log(`#${nft.rarityTraitSumRank} ID: ${nft.id}, name: ${nft.name}, url:${nft.imageUrl}`);});

    const jsonString = JSON.stringify(nftsWithRarityAndRank);

    fs.writeFile(`./${collection}.json`, jsonString, err => {
        if (err) {
            console.log('Error writing file', err);
        }
    });
};


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const saveAndCalculateRarity = async (collection: string, savePath?: string)=>{
    if (!fs.existsSync(getFilePath(collection, savePath))) {
        const openSeaKey = process.env.OPENSEA_KEY;
        await saveAllNftsFromOs(collection, openSeaKey, savePath);
    }

    // Wait for 5s to ensure the file is saved, as even if we write the file synchronously
    // there can still be a second or two until the file is accessible
    await new Promise((resolve) => {
        setTimeout(resolve, 5000);
    });

    exampleCalculateRarityOfAllNfts(collection, savePath);
};

saveAndCalculateRarity('boredapeyachtclub');