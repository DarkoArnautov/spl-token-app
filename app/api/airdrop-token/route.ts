import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

export async function POST(req: NextRequest) {
  try {
    const { sender, recipients, mint, amount } = await req.json();
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    const senderPublicKey = new PublicKey(sender);
    const mintPublicKey = new PublicKey(mint);

    for (const recipient of recipients) {
      const recipientPublicKey = new PublicKey(recipient);

      // Get or create associated token account
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        senderPublicKey,
        mintPublicKey,
        recipientPublicKey
      );

      // Airdrop tokens
      await mintTo(
        connection,
        senderPublicKey,
        mintPublicKey,
        recipientTokenAccount.address,
        senderPublicKey,
        amount
      );
    }

    return NextResponse.json({ success: true, message: "Airdrop completed!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
