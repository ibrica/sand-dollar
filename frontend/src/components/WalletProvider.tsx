'use client';

import { WalletKitProvider } from '@mysten/wallet-kit';
import { NETWORK_TO_RPC } from "@mysten/wallet-adapter-base";
import { getRpcUrl } from '@/lib/sui';
import { ReactNode } from 'react';

const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'devnet';

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WalletKitProvider
      features={['sui:signTransactionBlock']}
      enableUnsafeBurner={false}
      config={{
        preferredWallets: ['Sui Wallet', 'Suiet', 'Ethos Wallet'],
        chain: NETWORK as 'devnet' | 'testnet' | 'mainnet',
      }}
    >
      {children}
    </WalletKitProvider>
  );
} 