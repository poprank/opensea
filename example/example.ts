import { calculateRarity } from '@poprank/rankings';
import * as dotenv from 'dotenv';
import fs from 'fs';
import { getAllNFTsFromOs, OpenSeaAssetData, parseAllNfts } from '../src';

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

    const jsonString = JSON.stringify(nfts);

    fs.writeFile(getFilePath(collection, savePath), jsonString, err => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
};


const exampleCalculateRarityOfAllNfts = (collection: string, savePath?: string)=>{
    const data = fs.readFileSync(getFilePath(collection, savePath), { encoding: 'utf8', flag: 'r' });
    const savedNfts: OpenSeaAssetData[] = JSON.parse(data);
    const { nfts } = parseAllNfts(savedNfts, collection, true);

    const { nftsWithRarityAndRank } = calculateRarity(nfts);

    nftsWithRarityAndRank.sort((a, b)=>a.rarityTraitSumRank - b.rarityTraitSumRank);


    return nftsWithRarityAndRank;
};


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

    const nftsWithRarityAndRank = exampleCalculateRarityOfAllNfts(collection, savePath);
    const jsonString = JSON.stringify(nftsWithRarityAndRank);

    fs.writeFile(`./${collection}.json`, jsonString, err => {
        if (err) {
            console.log('Error writing file', err);
        }
    });

    const top5 = nftsWithRarityAndRank.slice(0, 5);
    console.log('And your top 5 are:');
    top5.forEach(nft=>{console.log(`#${nft.rarityTraitSumRank} ID: ${nft.id}, name: ${nft.name}, url:${nft.imageUrl}`);});

    const htmlStr = `
    <head>
        <style type="text/css">
            .nft{
                display:flex;
                flex-direction: column;
                height:400;
                width:300;
            }

            .nft-info{
                color:#1F1F1F;
                font-size: 36px;
                margin-left: 16px;
            }

            .rankings{
                display:flex;
                flex-wrap: wrap;
                justify-content: space-between;
                flex-direction: row;
            }
        </style>
    </head>
    <body>
        <div class="rankings">
        ${nftsWithRarityAndRank.slice(0, 100).map(n=>`
            <div class="nft">
                <span class="nft-info">${n.rarityTraitSumRank}</span>
                <img src="${n.imageUrl}"></img>
                <span class="nft-info">${n.name}</span>
            </div>
            `)}
        </div>
    </body>`;

    fs.writeFile(`./${collection}-example.html`, htmlStr, err => {
        if (err) {
            console.log('Error writing file', err);
        }
    });

};

saveAndCalculateRarity('boredapeyachtclub');