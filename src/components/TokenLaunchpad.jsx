// import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { MINT_SIZE, TOKEN_2022_PROGRAM_ID, createMintToInstruction, createAssociatedTokenAccountInstruction, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType, mintTo, getOrCreateAssociatedTokenAccount, getAssociatedTokenAddressSync } from "@solana/spl-token"
// import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';


// export function TokenLaunchpad() {
//     const { connection } = useConnection();
//     const wallet = useWallet();

//     async function createToken() {
//         const mintKeypair = Keypair.generate();
//         const metadata = {
//             mint: mintKeypair.publicKey,
//             name: 'KIRA',
//             symbol: 'KIR    ',
//             uri: 'https://cdn.100xdevs.com/metadata.json',
//             additionalMetadata: [],
//         };
        

//         const mintLen = getMintLen([ExtensionType.MetadataPointer]);
//         const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

//         const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

//         const transaction = new Transaction().add(
//             SystemProgram.createAccount({
//                 fromPubkey: wallet.publicKey,
//                 newAccountPubkey: mintKeypair.publicKey,
//                 space: mintLen,
//                 lamports,
//                 programId: TOKEN_2022_PROGRAM_ID,
//             }),
//             createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
//             createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
//             createInitializeInstruction({
//                 programId: TOKEN_2022_PROGRAM_ID,
//                 mint: mintKeypair.publicKey,
//                 metadata: mintKeypair.publicKey,
//                 name: metadata.name,
//                 symbol: metadata.symbol,
//                 uri: metadata.uri,
//                 mintAuthority: wallet.publicKey,
//                 updateAuthority: wallet.publicKey,
//             }),
//         );
            
//         transaction.feePayer = wallet.publicKey;
//         transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
//         transaction.partialSign(mintKeypair);

//         await wallet.sendTransaction(transaction, connection);

//         console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
//         const associatedToken = getAssociatedTokenAddressSync(
//             mintKeypair.publicKey,
//             wallet.publicKey,
//             false,
//             TOKEN_2022_PROGRAM_ID,
//         );

//         console.log(associatedToken.toBase58());

//         const transaction2 = new Transaction().add(
//             createAssociatedTokenAccountInstruction(
//                 wallet.publicKey,
//                 associatedToken,
//                 wallet.publicKey,
//                 mintKeypair.publicKey,
//                 TOKEN_2022_PROGRAM_ID,
//             ),
//         );

//         await wallet.sendTransaction(transaction2, connection);

//         const transaction3 = new Transaction().add(
//             createMintToInstruction(mintKeypair.publicKey, associatedToken, wallet.publicKey, 1000000000, [], TOKEN_2022_PROGRAM_ID)
//         );

//         await wallet.sendTransaction(transaction3, connection);

//         console.log("Minted!")
//     }

//     return  <div style={{
//         height: '100vh',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         flexDirection: 'column'
//     }}>
//         <h1>Solana Token Launchpad</h1>
//         <input className='inputText' type='text' placeholder='Name'></input> <br />
//         <input className='inputText' type='text' placeholder='Symbol'></input> <br />
//         <input className='inputText' type='text' placeholder='Image URL'></input> <br />
//         <input className='inputText' type='text' placeholder='Initial Supply'></input> <br />
//         <button onClick={createToken} className='btn'>Create a token</button>
//     </div>
// }




import React, { useState } from 'react';
import { Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    TOKEN_2022_PROGRAM_ID,
    createMintToInstruction,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddressSync,
    createInitializeMintInstruction,
} from '@solana/spl-token';
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';

export function TokenLaunchpad() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [initialSupply, setInitialSupply] = useState('');

    const createToken = async () => {
        try {
            if (!wallet || !wallet.publicKey) {
                alert('Wallet not connected! Please connect your wallet.');
                return;
            }

            // Log the wallet public key
            console.log("Wallet Public Key:", wallet.publicKey.toBase58());

            // Validate inputs
            if (!name || !symbol || !initialSupply || isNaN(initialSupply) || initialSupply <= 0) {
                alert('Please fill in valid values for name, symbol, and initial supply.');
                return;
            }

            const mintKeypair = Keypair.generate();
            const mintAuthority = wallet.publicKey;
            const decimals = 9;

            // Check wallet balance
            const balance = await connection.getBalance(wallet.publicKey);
            console.log("Wallet Balance (SOL):", balance / 1e9);
            if (balance < 0.002) { // Approximate cost of a transaction
                alert("Insufficient SOL balance for transaction fees.");
                return;
            }

            // Create the token mint account
            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: 82,
                    lamports: await connection.getMinimumBalanceForRentExemption(82),
                    programId: TOKEN_2022_PROGRAM_ID,
                }),
                createInitializeMintInstruction(mintKeypair.publicKey, decimals, mintAuthority, null, TOKEN_2022_PROGRAM_ID)
            );

            transaction.feePayer = wallet.publicKey;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            try {
                const signature = await wallet.sendTransaction(transaction, connection);
                await connection.confirmTransaction(signature, "confirmed");
                console.log(`Token mint created: ${mintKeypair.publicKey.toBase58()}`);
            } catch (error) {
                console.error("Error during mint account creation:", error);
                alert("Failed to create token mint account. Check console for details.");
                return;
            }

            // Create associated token account
            const associatedToken = getAssociatedTokenAddressSync(mintKeypair.publicKey, wallet.publicKey);
            console.log(`Associated Token Address: ${associatedToken.toBase58()}`);

            const transaction2 = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    associatedToken,
                    wallet.publicKey,
                    mintKeypair.publicKey,
                    TOKEN_2022_PROGRAM_ID
                )
            );

            transaction2.feePayer = wallet.publicKey;
            transaction2.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            try {
                const signature2 = await wallet.sendTransaction(transaction2, connection);
                await connection.confirmTransaction(signature2, "confirmed");
                console.log("Associated token account created!");
            } catch (error) {
                console.error("Error during associated token account creation:", error);
                alert("Failed to create associated token account. Check console for details.");
                return;
            }

            // Mint tokens to the associated token account
            const transaction3 = new Transaction().add(
                createMintToInstruction(
                    mintKeypair.publicKey,
                    associatedToken,
                    wallet.publicKey,
                    parseInt(initialSupply) * Math.pow(10, decimals),
                    [],
                    TOKEN_2022_PROGRAM_ID
                )
            );

            transaction3.feePayer = wallet.publicKey;
            transaction3.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            try {
                const signature3 = await wallet.sendTransaction(transaction3, connection);
                await connection.confirmTransaction(signature3, "confirmed");
                console.log(`${initialSupply} tokens minted successfully to ${associatedToken.toBase58()}!`);
            } catch (error) {
                console.error("Error during token minting:", error);
                alert("Failed to mint tokens. Check console for details.");
            }

        } catch (error) {
            console.error("Unexpected error during token creation:", error);
            alert("An unexpected error occurred. Please check the console for details.");
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            backgroundColor: '#f4f4f4',
            padding: '20px',
            borderRadius: '8px',
        }}>
            <h1>Solana Token Launchpad</h1>

            <input
                type='text'
                placeholder='Name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginBottom: '10px', padding: '10px', width: '300px' }}
            /> <br />

            <input
                type='text'
                placeholder='Symbol (4 characters)'
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                style={{ marginBottom: '10px', padding: '10px', width: '300px' }}
            /> <br />

            <input
                type='text'
                placeholder='Image URL'
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ marginBottom: '10px', padding: '10px', width: '300px' }}
            /> <br />

            <input
                type='number'
                placeholder='Initial Supply (tokens)'
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
                style={{ marginBottom: '20px', padding: '10px', width: '300px' }}
            /> <br />

            <button
                onClick={createToken}
                style={{ padding: '10px 20px', backgroundColor: '#6200ea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Create a Token
            </button>
        </div>
    );
}
