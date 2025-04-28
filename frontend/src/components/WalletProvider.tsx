'use client';

import { ReactNode, createContext, useContext } from 'react';
import { 
  SuiClientProvider, 
  WalletProvider as DappKitWalletProvider,
  createNetworkConfig,
  useCurrentWallet,
  useSuiClient
} from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { toB64 } from '@mysten/sui.js/utils';
import { WalletAccount } from '@mysten/wallet-standard';

type Network = 'testnet' | 'mainnet' | 'devnet' | 'localnet';
const NETWORK = (process.env.NEXT_PUBLIC_NETWORK || 'testnet') as Network;

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  devnet: { url: getFullnodeUrl('devnet') },
  localnet: { url: process.env.NEXT_PUBLIC_LOCAL_RPC || 'http://localhost:9000' },
});

interface WalletContextType {
  signAndExecuteTransaction: (tx: TransactionBlock, account: WalletAccount) => Promise<any>;
  signTransaction: (tx: TransactionBlock, account: WalletAccount) => Promise<any>;
  reportTransactionEffects: (effects: any, account: WalletAccount) => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  signAndExecuteTransaction: async () => null,
  signTransaction: async () => null,
  reportTransactionEffects: async () => {},
});

export const useWalletContext = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

function WalletProviderContent({ children }: WalletProviderProps) {
  const wallet = useCurrentWallet();
  const suiClient = useSuiClient();

  const signAndExecuteTransaction = async (
    tx: TransactionBlock,
    account: WalletAccount
  ) => {
    if (!wallet.isConnected || !wallet.currentWallet) {
      throw new Error('No wallet connected');
    }

    const feature = wallet.currentWallet.features['sui:signAndExecuteTransactionBlock'];
    if (!feature) {
      throw new Error('Wallet does not support signAndExecuteTransactionBlock');
    }

    const result = await feature.signAndExecuteTransactionBlock({
      transactionBlock: tx as any, // Type assertion needed due to SDK type mismatch
      account,
      chain: `sui:${NETWORK}`,
    });

    return result;
  };

  const signTransaction = async (
    tx: TransactionBlock,
    account: WalletAccount
  ) => {
    if (!wallet.isConnected || !wallet.currentWallet) {
      throw new Error('No wallet connected');
    }

    const feature = wallet.currentWallet.features['sui:signTransactionBlock'];
    if (!feature) {
      throw new Error('Wallet does not support signTransactionBlock');
    }

    return feature.signTransactionBlock({
      transactionBlock: tx as any, // Type assertion needed due to SDK type mismatch
      account,
      chain: `sui:${NETWORK}`,
    });
  };

  const reportTransactionEffects = async (effects: any, account: WalletAccount) => {
    if (!wallet.isConnected || !wallet.currentWallet) return;

    const feature = wallet.currentWallet.features['sui:reportTransactionEffects'];
    if (!feature) return;

    await feature.reportTransactionEffects({
      effects,
      account,
      chain: `sui:${NETWORK}`,
    });
  };

  return (
    <WalletContext.Provider
      value={{
        signAndExecuteTransaction,
        signTransaction,
        reportTransactionEffects,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork={NETWORK}>
      <DappKitWalletProvider>
        <WalletProviderContent>{children}</WalletProviderContent>
      </DappKitWalletProvider>
    </SuiClientProvider>
  );
}; 