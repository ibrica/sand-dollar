'use client';

import { useWallet } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { createContext, useContext, ReactNode } from 'react';

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  signAndExecuteTransactionBlock: (transaction: TransactionBlock) => Promise<{ digest: string }>;
  signTransactionBlock: (transaction: TransactionBlock) => Promise<Uint8Array>;
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
  const { 
    currentAccount,
    isConnecting,
    signAndExecuteTransactionBlock: walletSignAndExecute,
    signTransactionBlock: walletSignTransaction
  } = useWallet();

  const connected = !!currentAccount;

  const signAndExecuteTransactionBlock = async (transaction: TransactionBlock) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    const result = await walletSignAndExecute({
      transactionBlock: transaction,
    });

    return { digest: result.digest };
  };

  const signTransactionBlock = async (transaction: TransactionBlock) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    const result = await walletSignTransaction({
      transactionBlock: transaction,
    });

    return result.bytes;
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting: isConnecting,
        signAndExecuteTransactionBlock,
        signTransactionBlock,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  return useContext(WalletContext);
}