# OpenSea

Hello, welcome to PopRank's OpenSea package! In this package, we have logic that gets NFT info from OpenSea, and logic that then transforms these OpenSea objects into NFTs of our own PopRank types.

Additionally, we have an example section, where you can put in a collection's slug, and then we'll pull every NFT for that collection from OpenSea, transform it, calculate rarity, and print it to an html file so you can see the end result!

## Example

In order to run the example, you need to have Node / NPM installed. To run a typescript file, we suggest installing `ts-node` such that you can run `npx ts-node <filename>.ts`.

There are numerous how-to's online about this that can explain it better than we can.

If you have an API key and want to use it, add a `.env` file in the `/example` folder w/:
```
OPENSEA_KEY=<key>
```

Now just go to our `/example` folder, run `npx ts-node example.ts`, and voila! It'll take some time to get all NFTs if it's for a 5k+ collection, so we recommend grabbing a cup of tea.

Once it's finished running, it'll save the output in case you want to use the results multiple times without having to make hundreds of requests to OS.

We then transform it into our shape and calculate the rarity of all NFTs in the collection, saving that output too.

Finally, we write the top 100 NFTs to a very simple HTML page, so you can visually see the rarity rankings without any app / complex work :).

Enjoy!
