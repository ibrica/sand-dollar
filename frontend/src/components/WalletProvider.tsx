'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { 
  getWallets, 
  type Wallet, 
  type WalletAccount,
  SuiFeatures,
  ConnectFeature, 
  EventsFeature,
  DisconnectFeature,
  SuiSignTransactionBlockFeature,
  SuiSignAndExecuteTransactionBlockFeature,
  SuiSignTransactionFeature,
  SuiSignAndExecuteTransactionFeature,
  SuiReportTransactionEffectsFeature,
  WalletsEventsListeners
} from '@mysten/wallet-standard';

// Define network type
const NETWORK = (process.env.NEXT_PUBLIC_NETWORK || 'devnet') as 'devnet' | 'testnet' | 'mainnet';

// Define wallet context type
interface WalletContextType {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  accounts: WalletAccount[];
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signAndExecuteTransaction: (transactionBlock: any, account: WalletAccount) => Promise<any>;
  signTransaction: (transactionBlock: any, account: WalletAccount) => Promise<any>;
  reportTransactionEffects: (effects: any, account: WalletAccount) => Promise<void>;
}

// Create context
const WalletContext = createContext<WalletContextType>({
  wallets: [],
  selectedWallet: null,
  accounts: [],
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  signAndExecuteTransaction: async () => null,
  signTransaction: async () => null,
  reportTransactionEffects: async () => {},
});

// Custom hook to use wallet context
export const useWallet = () => useContext(WalletContext);

// Helper function to check if a wallet has a specific feature
function hasFeature<T extends keyof SuiFeatures | keyof ConnectFeature | keyof EventsFeature | keyof DisconnectFeature>(
  wallet: Wallet,
  feature: T
): boolean {
  return !!wallet.features[feature];
}

// Wallet provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);

  // Initialize available wallets
  useEffect(() => {
    const availableWallets = getWallets().get();
    
    // Filter out duplicate wallets by name
    const uniqueWallets = Array.from(
      availableWallets.reduce((map, wallet) => {
        if (!map.has(wallet.name)) {
          map.set(wallet.name, wallet);
        }
        return map;
      }, new Map()).values()
    );
    
    setWallets([...uniqueWallets]);

    // Subscribe to wallet changes
    const unsubscribe = getWallets().on('walletsChanged' as keyof WalletsEventsListeners, () => {
      const updatedWallets = getWallets().get();
      // Apply the same filtering for updates
      const updatedUniqueWallets = Array.from(
        updatedWallets.reduce((map, wallet) => {
          if (!map.has(wallet.name)) {
            map.set(wallet.name, wallet);
          }
          return map;
        }, new Map()).values()
      );
      setWallets([...updatedUniqueWallets]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Connect to wallet
  const connectWallet = async (walletName: string) => {
    const wallet = wallets.find(w => w.name === walletName);
    if (!wallet) return;

    if (hasFeature(wallet, 'standard:connect')) {
      const connectFeature = wallet.features['standard:connect'] as ConnectFeature['standard:connect'];
      await connectFeature.connect();
      setSelectedWallet(wallet);
      setAccounts([...wallet.accounts]);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    if (selectedWallet && hasFeature(selectedWallet, 'standard:disconnect')) {
      const disconnectFeature = selectedWallet.features['standard:disconnect'] as DisconnectFeature['standard:disconnect'];
      await disconnectFeature.disconnect();
    }
    setSelectedWallet(null);
    setAccounts([]);
  };

  // Handle events from selected wallet
  useEffect(() => {
    if (!selectedWallet || !hasFeature(selectedWallet, 'standard:events')) return;

    const eventsFeature = selectedWallet.features['standard:events'] as EventsFeature['standard:events'];
    const unsubscribe = eventsFeature.on('change', (e: { accounts?: WalletAccount[] }) => {
      if (e.accounts) {
        setAccounts([...selectedWallet.accounts]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedWallet]);

  // Sign and execute transaction
  const signAndExecuteTransaction = async (transactionBlock: any, account: WalletAccount) => {
    if (!selectedWallet) throw new Error('No wallet connected');

    if (hasFeature(selectedWallet, 'sui:signAndExecuteTransaction')) {
      const signAndExecuteFeature = selectedWallet.features['sui:signAndExecuteTransaction'] as 
        SuiSignAndExecuteTransactionFeature['sui:signAndExecuteTransaction'];
      
      return signAndExecuteFeature.signAndExecuteTransaction({
        transaction: transactionBlock,
        account,
        chain: `sui:${NETWORK}`
      });
    } else if (hasFeature(selectedWallet, 'sui:signAndExecuteTransactionBlock')) {
      // Fallback for wallets that haven't updated yet
      const signAndExecuteBlockFeature = selectedWallet.features['sui:signAndExecuteTransactionBlock'] as 
        SuiSignAndExecuteTransactionBlockFeature['sui:signAndExecuteTransactionBlock'];
      
      return signAndExecuteBlockFeature.signAndExecuteTransactionBlock({
        transactionBlock,
        account,
        chain: `sui:${NETWORK}`,
        options: {
          showEffects: true,
          showEvents: true,
        }
      });
    }
    
    throw new Error('Wallet does not support transaction execution');
  };

  // Sign transaction only
  const signTransaction = async (transactionBlock: any, account: WalletAccount) => {
    if (!selectedWallet) throw new Error('No wallet connected');

    if (hasFeature(selectedWallet, 'sui:signTransaction')) {
      const signFeature = selectedWallet.features['sui:signTransaction'] as 
        SuiSignTransactionFeature['sui:signTransaction'];
      
      return signFeature.signTransaction({
        transaction: transactionBlock,
        account,
        chain: `sui:${NETWORK}`
      });
    } else if (hasFeature(selectedWallet, 'sui:signTransactionBlock')) {
      // Fallback for wallets that haven't updated yet
      const signBlockFeature = selectedWallet.features['sui:signTransactionBlock'] as 
        SuiSignTransactionBlockFeature['sui:signTransactionBlock'];
      
      return signBlockFeature.signTransactionBlock({
        transactionBlock,
        account,
        chain: `sui:${NETWORK}`
      });
    }
    
    throw new Error('Wallet does not support transaction signing');
  };

  // Report transaction effects
  const reportTransactionEffects = async (effects: any, account: WalletAccount) => {
    if (!selectedWallet || !hasFeature(selectedWallet, 'sui:reportTransactionEffects')) return;

    const reportFeature = selectedWallet.features['sui:reportTransactionEffects'] as 
      SuiReportTransactionEffectsFeature['sui:reportTransactionEffects'];
    
    await reportFeature.reportTransactionEffects({
      effects,
      account,
      chain: `sui:${NETWORK}`
    });
  };

  return (
    <WalletContext.Provider value={{
      wallets,
      selectedWallet,
      accounts,
      connectWallet,
      disconnectWallet,
      signAndExecuteTransaction,
      signTransaction,
      reportTransactionEffects
    }}>
      {children}
    </WalletContext.Provider>
  );
} 