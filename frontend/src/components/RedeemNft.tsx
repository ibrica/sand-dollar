'use client';

import { useState, useEffect } from 'react';
import { useCurrentWallet, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useForm, SubmitHandler } from 'react-hook-form';
import { redeemEscrow, burnEscrowNft, getOwnedObjects } from '@/lib/sui';

type RedeemNftFormInputs = {
  nftObjectId: string;
  escrowId: string;
  action: 'redeem' | 'burn';
};

export function RedeemNft() {
  const { currentWallet, isConnected } = useCurrentWallet();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [nfts, setNfts] = useState<any[]>([]);
  const [escrows, setEscrows] = useState<any[]>([]);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RedeemNftFormInputs>();
  const currentAccount = currentWallet?.accounts[0];
  const selectedAction = watch('action');

  useEffect(() => {
    if (currentAccount?.address) {
      fetchUserNfts();
      fetchUserEscrows();
    }
  }, [currentAccount]);

  const fetchUserNfts = async () => {
    if (!currentAccount?.address) return;
    
    try {
      const userNfts = await getOwnedObjects(
        currentAccount.address,
        `${process.env.NEXT_PUBLIC_PACKAGE_ID}::sand_dollar::EscrowNFT`
      );
      setNfts(userNfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const fetchUserEscrows = async () => {
    if (!currentAccount?.address) return;
    
    try {
      const userEscrows = await getOwnedObjects(
        currentAccount.address,
        `${process.env.NEXT_PUBLIC_PACKAGE_ID}::sand_dollar::Escrow`
      );
      setEscrows(userEscrows);
    } catch (error) {
      console.error('Error fetching escrows:', error);
    }
  };

  const onSubmit: SubmitHandler<RedeemNftFormInputs> = async (data) => {
    if (!currentAccount || !currentWallet) return;
    
    setIsLoading(true);
    try {
      if (data.action === 'redeem') {
        await redeemEscrow(
          async (transaction) => {
            const response = await signAndExecuteTransaction({
              transaction: transaction.serialize(),
            });
            return { digest: response.digest };
          },
          async (effects) => {
            // Handle transaction effects
            console.log('Transaction effects:', effects);
          },
          data.escrowId,
          data.nftObjectId,
          '0x2::nft::NFT', // NFT type
          '0x2::sui::SUI', // Coin type
          currentAccount,
        );
        alert('NFT redeemed successfully!');
      } else {
        await burnEscrowNft(
          async (transaction) => {
            const response = await signAndExecuteTransaction({
              transaction: transaction.serialize(),
            });
            return { digest: response.digest };
          },
          async (effects) => {
            // Handle transaction effects
            console.log('Transaction effects:', effects);
          },
          data.nftObjectId,
          currentAccount,
        );
        alert('NFT burned successfully!');
      }
    } catch (error) {
      console.error('Error processing NFT:', error);
      alert('Failed to process NFT. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentAccount) {
    return <div className="text-center">Please connect your wallet to redeem or burn NFTs.</div>;
  }

  return (
    <div className="bg-background-light p-6 rounded-lg shadow-md border border-border">
      <h2 className="text-xl font-bold mb-4 text-white">Redeem or Burn NFT</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white">Action</label>
          <select
            {...register('action', { required: 'Please select an action' })}
            className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm text-white focus:outline-none focus:ring-accent focus:border-accent"
          >
            <option value="redeem">Redeem NFT</option>
            <option value="burn">Burn NFT</option>
          </select>
          {errors.action && <p className="text-error text-xs mt-1">{errors.action.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">NFT</label>
          <select
            {...register('nftObjectId', { required: 'Please select an NFT' })}
            className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm text-white focus:outline-none focus:ring-accent focus:border-accent"
          >
            <option value="">Select an NFT</option>
            {nfts.map((nft) => (
              <option key={nft.data.objectId} value={nft.data.objectId}>
                {nft.data.objectId.substring(0, 8)}...
              </option>
            ))}
          </select>
          {errors.nftObjectId && <p className="text-error text-xs mt-1">{errors.nftObjectId.message}</p>}
        </div>
        
        {selectedAction === 'redeem' && (
          <div>
            <label className="block text-sm font-medium text-white">Escrow</label>
            <select
              {...register('escrowId', { required: selectedAction === 'redeem' ? 'Please select an escrow' : false })}
              className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm text-white focus:outline-none focus:ring-accent focus:border-accent"
            >
              <option value="">Select an escrow</option>
              {escrows.map((escrow) => (
                <option key={escrow.data.objectId} value={escrow.data.objectId}>
                  {escrow.data.objectId.substring(0, 8)}...
                </option>
              ))}
            </select>
            {errors.escrowId && <p className="text-error text-xs mt-1">{errors.escrowId.message}</p>}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-600 disabled:text-gray-400"
        >
          {isLoading ? 'Processing...' : selectedAction === 'redeem' ? 'Redeem NFT' : 'Burn NFT'}
        </button>
      </form>
    </div>
  );
} 