# OpenSea

Hello, welcome to PopRank's OpenSea package! In this package, we have logic that gets NFT info from OpenSea, and logic that then transforms these OpenSea objects into NFTs of our own PopRank types.

Additionally, we have an example section, where you can put in a collection's slug, and then we'll pull every NFT for that collection from OpenSea, transform it, calculate rarity, and print it to an html file so you can see the end result!

Please join us in our [Discord](https://discord.com/invite/9R5RzdUbXb) too, we'd love to chat with you


## Example

In order to run the example, you need to have Node / NPM installed. To run a typescript file, we suggest installing `npx` such that you can run `npx ts-node <filename>.ts`.

There are numerous how-to's online about this that can explain it better than we can.

If you have an API key and want to use it, add a `.env` file in the `/example` folder that looks like below. Note that the API key is optional in this case, as OpenSea's /assets endpoint isn't api-key gated, specifying a key will just help with the rate limiting.
```
OPENSEA_KEY=<key>
```

Now just go to our `/example` folder, run `npx ts-node example.ts`, and voila! It'll take some time to get all NFTs if it's for a 1k+ collection, so we recommend grabbing a cup of tea.

Once it's finished running, it'll save the output in case you want to use the results multiple times without having to make hundreds of requests to OS.

We then transform it into our shape and save the result. If you want to calculate the rarity of the newly-transformed NFTs, you can go to our [@poprank/rankings](https://www.npmjs.com/package/@poprank/rankings) package, drop the JSON file there, and use our `example.ts`.
