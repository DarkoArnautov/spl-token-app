import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

export async function POST(req: NextRequest) {
  try {
    const { sender, receiver, mint, amount } = await req.json();
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    const senderPublicKey = new PublicKey(sender);
    const receiverPublicKey = new PublicKey(receiver);
    const mintPublicKey = new PublicKey(mint);

    // Get or create associated token accounts
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderPublicKey,
      mintPublicKey,
      senderPublicKey
    );

    const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderPublicKey,
      mintPublicKey,
      receiverPublicKey
    );

    // Transfer tokens
    await transfer(
      connection,
      senderPublicKey,
      senderTokenAccount.address,
      receiverTokenAccount.address,
      senderPublicKey,
      amount
    );

    return NextResponse.json({ success: true, message: "Tokens transferred successfully!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
