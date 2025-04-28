'use client';

import { useState, useEffect } from 'react';
import { useWallet } from './WalletProvider';
import { useForm, SubmitHandler } from 'react-hook-form';
import { 
  createEscrowWithNft, 
  getOwnedObjects, 
  getUserCoins, 
  YieldProvider 
} from '@/lib/sui';

type ConnectNftFormInputs = {
  amount: string;
  yieldProvider: string;
  coinObject: string;
  nftObject: string;
};

export function ConnectExistingNft() {
  const { accounts, selectedWallet, signAndExecuteTransaction, reportTransactionEffects } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [coins, setCoins] = useState<any[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ConnectNftFormInputs>();
  
  const currentAccount = accounts?.[0];

  useEffect(() => {
    if (currentAccount?.address) {
      fetchUserCoins();
      fetchUserNfts();
    }
  }, [currentAccount]);

  const fetchUserCoins = async () => {
    if (!currentAccount?.address) return;
    
    try {
      const userCoins = await getUserCoins(currentAccount.address);
      setCoins(userCoins);
    } catch (error) {
      console.error('Error fetching coins:', error);
    }
  };

  const fetchUserNfts = async () => {
    if (!currentAccount?.address) return;
    
    try {
      // Get all objects and filter for potential NFTs
      const objects = await getOwnedObjects(currentAccount.address);
      const potentialNfts = objects.filter(obj => 
        obj.data?.type?.includes('::') && 
        !obj.data?.type?.includes('::coin::') && 
        !obj.data?.type?.includes('::escrow::')
      );
      setNfts(potentialNfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const onSubmit: SubmitHandler<ConnectNftFormInputs> = async (data) => {
    if (!currentAccount || !selectedWallet) return;
    
    setIsLoading(true);
    try {
      const amount = BigInt(parseFloat(data.amount) * 1_000_000_000); // Convert to MIST (9 decimals)
      const yieldProvider = parseInt(data.yieldProvider) as YieldProvider;
      
      await createEscrowWithNft(
        signAndExecuteTransaction,
        reportTransactionEffects,
        '0x2::sui::SUI', // Coin type
        data.coinObject,
        amount,
        data.nftObject,
        '0x2::nft::NFT', // NFT type
        yieldProvider,
        currentAccount,
      );
      
      alert('Escrow created successfully!');
    } catch (error) {
      console.error('Error creating escrow:', error);
      alert('Failed to create escrow. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentAccount) {
    return <div className="text-center">Please connect your wallet to use existing NFTs.</div>;
  }

  return (
    <div className="bg-background-light p-6 rounded-lg shadow-md border border-border">
      <h2 className="text-xl font-bold mb-4 text-white">Connect Existing NFT to Yield</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white">NFT</label>
          <select
            {...register('nftObject', { required: 'Please select an NFT' })}
            className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm text-white focus:outline-none focus:ring-accent focus:border-accent"
          >
            <option value="">Select an NFT</option>
            {nfts.map((nft) => (
              <option key={nft.data?.objectId} value={nft.data?.objectId}>
                {nft.data?.objectId.substring(0, 8)}... - {nft.data?.type?.split('::').pop()}
              </option>
            ))}
          </select>
          {errors.nftObject && <p className="text-error text-xs mt-1">{errors.nftObject.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white">Coin Object</label>
          <select
            {...register('coinObject', { required: 'Please select a coin' })}
            className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm text-white focus:outline-none focus:ring-accent focus:border-accent"
          >
            <option value="">Select a coin</option>
            {coins.map((coin) => (
              <option key={coin.coinObjectId} value={coin.coinObjectId}>
                {coin.coinObjectId.substring(0, 8)}... - {(Number(coin.balance) / 1_000_000_000).toFixed(2)} SUI
              </option>
            ))}
          </select>
          {errors.coinObject && <p className="text-error text-xs mt-1">{errors.coinObject.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white">Amount (SUI)</label>
          <input
            type="number"
            step="0.000000001"
            min="0.000000001"
            {...register('amount', { 
              required: 'Amount is required',
              min: { value: 0.000000001, message: 'Amount must be greater than 0' }
            })}
            className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm text-white focus:outline-none focus:ring-accent focus:border-accent"
          />
          {errors.amount && <p className="text-error text-xs mt-1">{errors.amount.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white">Yield Provider</label>
          <select
            {...register('yieldProvider', { required: 'Please select a yield provider' })}
            className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm text-white focus:outline-none focus:ring-accent focus:border-accent"
          >
            <option value="0">None</option>
            <option value="1">Navi</option>
            <option value="2">SuiLend</option>
          </select>
          {errors.yieldProvider && <p className="text-error text-xs mt-1">{errors.yieldProvider.message}</p>}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-600 disabled:text-gray-400"
        >
          {isLoading ? 'Creating...' : 'Connect NFT to Yield'}
        </button>
      </form>
    </div>
  );
} 