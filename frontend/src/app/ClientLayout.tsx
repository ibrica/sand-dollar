'use client';

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Theme } from '@radix-ui/themes';
import { ReactNode } from 'react';
import '@mysten/dapp-kit/dist/index.css';
import '@radix-ui/themes/styles.css';

// Create a client
const queryClient = new QueryClient();

const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
};

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Theme appearance="dark">
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networks} defaultNetwork="testnet">
          <WalletProvider autoConnect>
            {children}
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </Theme>
  );
} 