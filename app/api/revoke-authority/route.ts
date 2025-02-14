import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { setAuthority, AuthorityType } from "@solana/spl-token";

export async function POST(req: NextRequest) {
  try {
    const { mint, owner, type } = await req.json();
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const ownerPublicKey = new PublicKey(owner);
    const mintPublicKey = new PublicKey(mint);

    let authorityType;
    if (type === "mint") authorityType = AuthorityType.MintTokens;
    else if (type === "freeze") authorityType = AuthorityType.FreezeAccount;
    else if (type === "update") authorityType = AuthorityType.AccountOwner;
    else throw new Error("Invalid authority type");

    await setAuthority(connection, ownerPublicKey, mintPublicKey, ownerPublicKey, authorityType, null);

    return NextResponse.json({ success: true, message: `Revoked ${type} authority!` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
