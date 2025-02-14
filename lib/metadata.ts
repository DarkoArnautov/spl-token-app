import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

// Arweave storage setup
export async function uploadMetadata(
  connection: Connection,
  wallet: Keypair,
  name: string,
  symbol: string,
  description: string,
  image: string
) {
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(bundlrStorage({ address: "https://devnet.bundlr.network" }));

  const { uri } = await metaplex.nfts().uploadMetadata({
    name,
    symbol,
    description,
    image,
  });

  return uri; // This is the Arweave URL for metadata
}
