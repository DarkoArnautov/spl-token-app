import { NextRequest, NextResponse } from "next/server";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
// import { uploadMetadata } from "@/lib/metadata";
// import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

export async function POST(req: NextRequest) {
  try {
    const { name, symbol, decimals, description, image, owner } = await req.json();
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const mint = Keypair.generate();
    const ownerPublicKey = new PublicKey(owner);
    console.log("ownerPublicKey:", ownerPublicKey)
    // Upload metadata
    // const metadataUri = await uploadMetadata(connection, mint, name, symbol, description, image);

    // Create SPL Token
    const mintAddress = await createMint(
      connection,
      ownerPublicKey,       // Payer (wallet that pays fees)
      ownerPublicKey,       // Mint authority
      null,                 // Freeze authority (null means no freezing)
      decimals,             // Token decimal places
      mint                  // Mint keypair
    );
    console.log("mintAddress:", mintAddress)

    // // Attach metadata to token
    // const metadataAccount = PublicKey.findProgramAddressSync(
    //   [Buffer.from("metadata"), PublicKey.default.toBuffer(), mint.publicKey.toBuffer()],
    //   new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    // )[0];

    // const instruction = createCreateMetadataAccountV3Instruction(
    //   {
    //     metadata: metadataAccount,
    //     mint: mint.publicKey,
    //     mintAuthority: ownerPublicKey,
    //     payer: ownerPublicKey,
    //     updateAuthority: ownerPublicKey,
    //   },
    //   {
    //     createMetadataAccountArgsV3: {
    //       data: {
    //         name,
    //         symbol,
    //         uri: metadataUri,
    //         sellerFeeBasisPoints: 0,
    //         creators: null,
    //         collection: null,
    //         uses: null,
    //       },
    //       isMutable: true,
    //     },
    //   }
    // );

    // return NextResponse.json({ success: true, mint: mint.publicKey.toBase58() });
    return NextResponse.json({ success: true, mint: "aaa" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
