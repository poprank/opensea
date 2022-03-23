import * as dotenv from 'dotenv';
import fs from 'fs';
import { getAllNFTsFromOs, OpenSeaAssetData, parseAllNfts } from '../src';

dotenv.config();

const getFilePath = (collection: string, savePath?: string) => `${savePath ?? './'}${collection}-os.json`;

/**
 * Simple helper to save the NFTs we get from OS, so that if you're playing around with different
 * rarity calculations / whatever, you don't have to make hundreds of requests to OS each time
 * @param collection
 * @param savePath
 */
const saveAllNftsFromOs = async (collection: string, openSeaKey?: string, savePath?: string): Promise<void> => {
    const nfts = await getAllNFTsFromOs(collection, openSeaKey);

    const jsonString = JSON.stringify(nfts);

    fs.writeFile(getFilePath(collection, savePath), jsonString, err => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
};


const exampleCalculateRarityOfAllNfts = async (collection: string, savePath?: string) => {
    if (!fs.existsSync(getFilePath(collection, savePath))) {
        const openSeaKey = process.env.OPENSEA_KEY;
        await saveAllNftsFromOs(collection, openSeaKey, savePath);
    }

    // Wait for 5s to ensure the file is saved, as even if we write the file synchronously
    // there can still be a second or two until the file is accessible
    await new Promise((resolve) => {
        setTimeout(resolve, 5000);
    });

    const data = fs.readFileSync(getFilePath(collection, savePath), { encoding: 'utf8', flag: 'r' });
    const savedNfts: OpenSeaAssetData[] = JSON.parse(data);
    const { nfts } = parseAllNfts(savedNfts, collection);

    const jsonString = JSON.stringify(nfts);

    fs.writeFile(`./${collection}.json`, jsonString, err => {
        if (err) {
            console.log('Error writing file', err);
        }
    });
};


exampleCalculateRarityOfAllNfts('boredapeyachtclub');