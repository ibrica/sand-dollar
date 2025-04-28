'use client';

import { useCurrentWallet } from '@mysten/dapp-kit';
import { type WalletWithFeatures } from '@mysten/wallet-standard';
import { type StandardConnectFeature, type StandardEventsFeature, type SuiFeatures } from '@mysten/wallet-standard';
import { createContext, useContext, ReactNode } from 'react';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

interface WalletContextType {
  signAndExecuteTransaction: (tx: TransactionBlock, account: WalletAccount) => Promise<any>;
  signTransactionBlock: (transaction: TransactionBlock) => Promise<void>;
  reportTransactionEffects: (effects: any, account: WalletAccount) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useCurrentWallet();
  const currentWallet = wallet.currentWallet as WalletWithFeatures<StandardConnectFeature & StandardEventsFeature & SuiFeatures>;
  const currentAccount = currentWallet?.accounts[0];

  const signAndExecuteTransaction = async (transaction: TransactionBlock, account: WalletAccount) => {
    if (!currentWallet) {
      throw new Error('Wallet not connected');
    }
    if (!currentAccount) {
      throw new Error('No account selected');
    }
    const signAndExecuteFeature = currentWallet.features['sui:signAndExecuteTransactionBlock'];
    if (!signAndExecuteFeature) {
      throw new Error('Wallet does not support signAndExecuteTransactionBlock');
    }

    return await signAndExecuteFeature.signAndExecuteTransactionBlock({
      transactionBlock: transaction as any,
      account: currentAccount,
      chain: currentWallet.chains[0],
    });
  };

  const signTransactionBlock = async (transaction: TransactionBlock) => {
    if (!currentWallet) {
      throw new Error('Wallet not connected');
    }
    if (!currentAccount) {
      throw new Error('No account selected');
    }
    const signFeature = currentWallet.features['sui:signTransactionBlock'];
    if (!signFeature) {
      throw new Error('Wallet does not support signTransactionBlock');
    }

    await signFeature.signTransactionBlock({
      transactionBlock: transaction as any,
      account: currentAccount,
      chain: currentWallet.chains[0],
    });
  };

  const reportTransactionEffects = async (effects: any, account: WalletAccount) => {
    // This is a placeholder function that can be expanded based on your needs
    console.log('Transaction effects:', effects);
  };

  return (
    <WalletContext.Provider value={{ signAndExecuteTransaction, signTransactionBlock, reportTransactionEffects }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 