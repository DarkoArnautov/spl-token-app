"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@solana/wallet-adapter-react";
import { Checkbox } from "./ui/checkbox";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  AuthorityType,
  createSetAuthorityInstruction,
} from "@solana/spl-token";
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

export default function TokenForm() {
  const { publicKey, sendTransaction, wallet } = useWallet();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(9);
  const [totalSupply, setTotalSupply] = useState(10000);
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [mintAuthority, setMintAuthority] = useState("");
  const [freezeAuthority, setFreezeAuthority] = useState("");
  const [updateAuthority, setUpdateAuthority] = useState("");
  const [isFreeze, setIsFreeze] = useState(false);
  const [isMint, setIsMint] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const deploy_gas_fee = 0.0001;
  const authority_gas_fee = 0.001;

  const handleSubmit = async () => {
    if (!publicKey || !wallet) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );
      const sender = publicKey;
      const recipient = new PublicKey(
        "9HGmUC2vFDeSgMQ88K8T9pSXJBuuRhkAkuPAMTjnNhFD"
      );
      const amount = (deploy_gas_fee + authority_gas_fee) * 1e9;
      const balance = await connection.getBalance(publicKey);
      if (amount >= balance) {
        console.log("Insufficient Balance");
        return;
      }
      const sendTransactions = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: recipient,
          lamports: amount,
        })
      );
      const sendsignature = await sendTransaction(
        sendTransactions,
        connection,
        {
          signers: [],
        }
      );
      if (sendsignature) {
        const zero_Address = new PublicKey("11111111111111111111111111111111");
        const mint = Keypair.generate();
        const lamports = await getMinimumBalanceForRentExemptMint(connection);

        const current_mintAuthority = new PublicKey(publicKey);
        const freezeAuthority_wallet =
          isFreeze && freezeAuthority
            ? new PublicKey(freezeAuthority)
            : zero_Address;

        const updateAuthority_wallet =
          isUpdate && updateAuthority
            ? new PublicKey(updateAuthority)
            : zero_Address;

        const transaction = new Transaction();

        // Step 1: Create the mint account
        transaction.add(
          SystemProgram.createAccount({
            fromPubkey: publicKey,
            newAccountPubkey: mint.publicKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_PROGRAM_ID,
          })
        );

        // Step 2: Initialize mint
        transaction.add(
          createInitializeMint2Instruction(
            mint.publicKey,
            decimals,
            current_mintAuthority,
            freezeAuthority_wallet,
            TOKEN_PROGRAM_ID
          )
        );

        // Step 3: Create Associated Token Account (ATA)
        const tokenAccount = await getAssociatedTokenAddress(
          mint.publicKey,
          publicKey
        );
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            tokenAccount,
            publicKey,
            mint.publicKey
          )
        );

        // Step 4: Mint tokens to ATA
        const totalSupply_amount =
          BigInt(totalSupply) * BigInt(10) ** BigInt(decimals);
        transaction.add(
          createMintToInstruction(
            mint.publicKey,
            tokenAccount,
            current_mintAuthority,
            totalSupply_amount,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        // Step 5: Create Metadata Account
        const metadataPDA = PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            PROGRAM_ID.toBuffer(),
            mint.publicKey.toBuffer(),
          ],
          PROGRAM_ID
        )[0];

        const data = {
          name: name,
          symbol: symbol,
          uri: "https://example.com",
          sellerFeeBasisPoints: 0, // 5% royalties
          creators: null,
          collection: null,
          uses: null,
        };

        transaction.add(
          createCreateMetadataAccountV3Instruction(
            {
              metadata: metadataPDA,
              mint: mint.publicKey,
              mintAuthority: current_mintAuthority,
              payer: publicKey,
              updateAuthority: updateAuthority_wallet,
            },
            {
              createMetadataAccountArgsV3: {
                data,
                isMutable: true,
                collectionDetails: null,
              },
            }
          )
        );

        // Step 6: Set Mint Authority (if needed)
        const newAuthority =
          isMint && mintAuthority ? new PublicKey(mintAuthority) : zero_Address;
        transaction.add(
          createSetAuthorityInstruction(
            mint.publicKey,
            publicKey,
            AuthorityType.MintTokens,
            newAuthority,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        // Sign and send the single transaction
        const signature = await sendTransaction(transaction, connection, {
          signers: [mint], // Only signers required are included
        });

        console.log("✅ All operations completed in one transaction!");
        console.log("Transaction Signature:", signature);
      } else {
        console.error("❌ Transaction failed.");
        return;
      }
    } catch (error) {
      console.error("❌ Error creating token:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create SPL Token</h2>
      <div className="mb-4">
        <label>Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="mb-4">
        <label>Symbol</label>
        <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
      </div>
      <div className="mb-4">
        <label>Decimals</label>
        <Input
          value={decimals}
          type="number"
          onChange={(e) => setDecimals(Number(e.target.value))}
          min={9}
        />
      </div>
      <div className="mb-4">
        <label>TotalSupply</label>
        <Input
          value={totalSupply}
          type="number"
          onChange={(e) => setTotalSupply(Number(e.target.value))}
          min={1}
        />
      </div>
      <div className="mb-4">
        <label>LogoURL</label>
        <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
      </div>
      <div className="mb-4">
        <label>Description</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <div className="flex justify-start items-center mb-2">
          <Checkbox
            id="mint-authority"
            checked={isMint}
            onCheckedChange={(checked) => setIsMint(!!checked)}
          />
          <label
            htmlFor="mint-authority"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2"
          >
            Mint Authority (not recommended)
          </label>
        </div>
        {isMint ? (
          <Input
            value={mintAuthority}
            onChange={(e) => setMintAuthority(e.target.value)}
          />
        ) : (
          <></>
        )}
      </div>
      <div className="mb-4">
        <div className="flex justify-start items-center mb-2">
          <Checkbox
            id="freeze-authority"
            checked={isFreeze}
            onCheckedChange={(checked) => setIsFreeze(!!checked)}
          />
          <label
            htmlFor="freeze-authority"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2"
          >
            Freeze Authority (not recommended)
          </label>
        </div>
        {isFreeze ? (
          <Input
            value={freezeAuthority}
            onChange={(e) => setFreezeAuthority(e.target.value)}
          />
        ) : (
          <></>
        )}
      </div>
      <div className=" ">
        <div className="flex justify-start items-center mb-2">
          <Checkbox
            id="update-authority"
            checked={isUpdate}
            onCheckedChange={(checked) => setIsUpdate(!!checked)}
          />
          <label
            htmlFor="update-authority"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2"
          >
            Update Authority
          </label>
        </div>
        {isUpdate ? (
          <Input
            value={updateAuthority}
            onChange={(e) => setUpdateAuthority(e.target.value)}
          />
        ) : (
          <></>
        )}
      </div>
      <Button onClick={handleSubmit}>Create</Button>
    </div>
  );
}
