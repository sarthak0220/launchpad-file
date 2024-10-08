// import './App.css'
// import { TokenLaunchpad } from './components/TokenLaunchpad'

// // wallet adapter imports
// import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import {
//     WalletModalProvider,
//     WalletDisconnectButton,
//     WalletMultiButton
// } from '@solana/wallet-adapter-react-ui';
// import '@solana/wallet-adapter-react-ui/styles.css';

// function App() {
//   return (
//     <div style={{width: "100vw"}}>
//       <ConnectionProvider endpoint={"https://solana-devnet.g.alchemy.com/v2/5s39tvHYyh2BmMWkYcANPYPj_mls4Rl_"}>
//         <WalletProvider wallets={[]} autoConnect>
//             <WalletModalProvider>
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 padding: 20
//               }}>
//                 <WalletMultiButton />
//                 <WalletDisconnectButton />
//               </div>
//               <TokenLaunchpad></TokenLaunchpad>
//             </WalletModalProvider>
//         </WalletProvider>
//       </ConnectionProvider>
//     </div>
//   )
// }

// export default App


import React from 'react';
import './App.css';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import {TokenLaunchpad} from './components/TokenLaunchpad'; // Adjust the path as necessary
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
    const network = 'devnet'; // Change this to 'mainnet-beta' for production
    const endpoint = clusterApiUrl(network);
    
    // Initialize wallets
    const wallets = [new PhantomWalletAdapter()];

    return (
        <div style={{ width: "100vw" }}>
            <ConnectionProvider endpoint={"https://solana-devnet.g.alchemy.com/v2/Qk1Voxc-z_bVt9ohMGAf4sHa5bT4XQbx"}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 20 }}>
                            <WalletMultiButton />
                            <WalletDisconnectButton />
                        </div>
                        <TokenLaunchpad />
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </div>
    );
}

export default App;