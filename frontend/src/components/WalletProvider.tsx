'use client';

import { useCurrentWallet, useSignTransaction, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { createContext, useContext, ReactNode } from 'react';
import { fromB64 } from '@mysten/sui/utils';

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  signAndExecuteTransactionBlock: (transaction: Transaction) => Promise<{ digest: string }>;
  signTransactionBlock: (transaction: Transaction) => Promise<Uint8Array>;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  signAndExecuteTransactionBlock: async () => {
    throw new Error('Wallet not connected');
  },
  signTransactionBlock: async () => {
    throw new Error('Wallet not connected');
  },
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const { currentWallet, isConnected, isConnecting } = useCurrentWallet();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutateAsync: signTransaction } = useSignTransaction();

  const connected = isConnected;

  const handleSignAndExecuteTransactionBlock = async (transaction: Transaction) => {
    if (!currentWallet) {
      throw new Error('Wallet not connected');
    }

    const result = await signAndExecuteTransaction({
      transaction: transaction.serialize(),
    });

    return { digest: result.digest };
  };

  const handleSignTransactionBlock = async (transaction: Transaction) => {
    if (!currentWallet) {
      throw new Error('Wallet not connected');
    }

    const result = await signTransaction({
      transaction: transaction.serialize(),
    });

    return fromB64(result.bytes);
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting: isConnecting,
        signAndExecuteTransactionBlock: handleSignAndExecuteTransactionBlock,
        signTransactionBlock: handleSignTransactionBlock,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}