"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@solana/wallet-adapter-react";
import { Checkbox } from "./ui/checkbox";
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  getMinimumBalanceForRentExemptMint,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMint2Instruction,
} from "@solana/spl-token";

export default function TokenForm() {
  const { publicKey, sendTransaction } = useWallet();
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

  // const deploy_gas_fee = 0.1;
  // const authority_gas_fee = 0.1;

  const handleSubmit1 = async () => {
    if (!publicKey) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );

      const mint = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const mintAuthority_wallet =
        isMint && mintAuthority ? new PublicKey(mintAuthority) : null;
      const freezeAuthority_wallet =
        isFreeze && freezeAuthority ? new PublicKey(freezeAuthority) : null;

      const updateAuthority_wallet =
        isUpdate && updateAuthority
          ? new PublicKey(updateAuthority)
          : mintAuthority_wallet;

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),

        createInitializeMint2Instruction(
          mint.publicKey,
          decimals,
          publicKey,
          freezeAuthority_wallet,
          TOKEN_PROGRAM_ID
        )
      );

      // ✅ Step 1: Get Token Metadata PDA
      const metadataProgramId = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
      ); // Metaplex Token Metadata Program
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          metadataProgramId.toBuffer(),
          mint.publicKey.toBuffer(),
        ],
        metadataProgramId
      );

      // ✅ Step 2: Create Metadata Account
      const metadataTransaction = createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: mint,
          mintAuthority: mintAuthority,
          payer: new PublicKey(publicKey),
          updateAuthority: updateAuthority,
          systemProgram: SystemProgram.programId, // Required system program
          rent: PublicKey.default, // Rent sysvar account
        },
        {
          data: {
            name: "Your Token Name",
            symbol: "YOUR_SYMBOL",
            uri: "", // Metadata URI (e.g., IPFS link)
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
          isMutable: true,
        }
      );

      // if (updateAuthority_wallet) {
      //   transaction.add(
      //     setAuthority(
      //       mint.publicKey,
      //       mintAuthority_wallet,
      //       "MintTokens",
      //       updateAuthority_wallet,
      //       [mintAuthority_wallet]
      //     )
      //   );
      // }

      transaction.add(metadataTransaction);

      // ✅ Step 3: Create Associated Token Account for the Mint
      // const associatedTokenAddress = await getAssociatedTokenAddress(
      //   mint.publicKey,
      //   publicKey
      // );
      // transaction.add(
      //   createAssociatedTokenAccountInstruction(
      //     publicKey,
      //     associatedTokenAddress,
      //     publicKey,
      //     mint.publicKey
      //   )
      // );

      // ✅ Step 4: Mint Tokens to the Token Account
      // const mintTxSignature = await mintTo(
      //     connection,
      //     wallet?.signer, // Fee payer
      //     mint.publicKey, // Mint account
      //     associatedTokenAddress, // Destination token account
      //     mintAuthority_wallet, // Mint authority
      //     [], // Signers (empty if mintAuthority_wallet is publicKey)
      //     BigInt(totalSupply) * BigInt(10) ** BigInt(decimals) // Ensure precision
      //   );

      const signature = await sendTransaction(transaction, connection, {
        signers: [mint],
      });

      console.log(
        "✅ Token Mint Created! Mint Address:",
        mint.publicKey.toBase58()
      );
      console.log("Transaction Signature:", signature);
    } catch (error) {
      console.error("❌ Error creating token:", error);
    }
  };

  const handleSubmit1 = async () => {
    if (!publicKey || !wallet) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );
      const zero_Address = new PublicKey("11111111111111111111111111111111");
      const mint = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const mintAuthority_wallet = new PublicKey(publicKey);
      const freezeAuthority_wallet =
        isFreeze && freezeAuthority
          ? new PublicKey(freezeAuthority)
          : zero_Address;

      const updateAuthority_wallet =
        isUpdate && updateAuthority
          ? new PublicKey(updateAuthority)
          : zero_Address;

      const transactionTokenCreation = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),

        createInitializeMint2Instruction(
          mint.publicKey,
          decimals,
          mintAuthority_wallet,
          freezeAuthority_wallet,
          TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendTransaction(
        transactionTokenCreation,
        connection,
        {
          signers: [mint],
        }
      );

      console.log(
        "✅ Token Mint Created! Mint Address:",
        mint.publicKey.toBase58()
      );
      console.log("Transaction Signature:", signature);
      const totalSupply_amount =
        BigInt(totalSupply) * BigInt(10) ** BigInt(decimals);
      const tokenAccount = await getAssociatedTokenAddress(
        mint.publicKey,
        publicKey
      );

      const createATAIx = createAssociatedTokenAccountInstruction(
        publicKey, // payer
        tokenAccount, // associated token account address
        publicKey, // owner of the token account
        mint.publicKey // mint
      );

      const mintToIx = createMintToInstruction(
        mint.publicKey, // mint address
        tokenAccount, // destination token account
        mintAuthority_wallet, // authority (must match the mint authority set earlier)
        totalSupply_amount, // amount to mint (in base units)
        [],
        TOKEN_PROGRAM_ID
      );

      const transactionSecond = new Transaction().add(createATAIx, mintToIx);
      const mintSignature = await sendTransaction(
        transactionSecond,
        connection,
        {
          // If the mint authority is different from your wallet, include its Keypair in signers.
          signers: [],
        }
      );

      console.log(
        "✅ Total Supply Minted! Token Account:",
        tokenAccount.toBase58()
      );
      console.log("Transaction Signature:", mintSignature);

      const metadataPDA = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
        ],
        PROGRAM_ID
      )[0];
      console.log("name, symbol:", name, symbol);
      const data = {
        name: name,
        symbol: symbol,
        uri: "https://example.com", // Metadata URI
        sellerFeeBasisPoints: 0, // 5% royalties
        creators: null, // Optional: list of creators
        collection: null,
        uses: null,
      };
      const metadataInstruction = createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: mint.publicKey,
          mintAuthority: mintAuthority_wallet,
          payer: publicKey,
          updateAuthority: updateAuthority_wallet,
        },
        {
          createMetadataAccountArgsV3: {
            data,
            isMutable: true,
            collectionDetails: null, // Allow updates
          },
        }
      );

      const metadataTransaction = new Transaction().add(metadataInstruction);
      const signatureFour = await sendTransaction(
        metadataTransaction,
        connection,
        {
          signers: [],
        }
      );
      console.log("Transaction meta Signature:", signatureFour);

      const newAuthority =
        isMint && mintAuthority ? new PublicKey(mintAuthority) : null;

      const transactionthird = new Transaction().add(
        createSetAuthorityInstruction(
          mint.publicKey,
          publicKey,
          AuthorityType.MintTokens,
          newAuthority,
          [],
          TOKEN_PROGRAM_ID
        )
      );
      const updateSignature = await sendTransaction(
        transactionthird,
        connection,
        {
          // If the mint authority is different from your wallet, include its Keypair in signers.
          signers: [],
        }
      );
      console.log("Transaction Signature:", updateSignature);
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
function createCreateMetadataAccountV3Instruction(
  arg0: {
    metadata: PublicKey;
    mint: Keypair;
    mintAuthority: string;
    payer: any;
    updateAuthority: string;
    systemProgram: PublicKey; // Required system program
    rent: PublicKey;
  },
  arg1: {
    data: {
      name: string;
      symbol: string;
      uri: string; // Metadata URI (e.g., IPFS link)
      sellerFeeBasisPoints: number;
      creators: null;
      collection: null;
      uses: null;
    };
    isMutable: boolean;
  }
) {
  throw new Error("Function not implemented.");
}
