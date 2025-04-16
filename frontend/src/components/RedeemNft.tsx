'use client';

import { useState, useEffect } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import { useForm, SubmitHandler } from 'react-hook-form';
import { redeemEscrow, burnEscrowNft, getOwnedObjects } from '@/lib/sui';

type RedeemFormInputs = {
  escrowObject: string;
  nftObject: string;
  coinType: string;
};

export function RedeemNft() {
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();
  const [isLoading, setIsLoading] = useState(false);
  const [escrows, setEscrows] = useState<any[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);
  const [burnableNfts, setBurnableNfts] = useState<any[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<RedeemFormInputs>();

  useEffect(() => {
    if (currentAccount?.address) {
      fetchUserEscrows();
      fetchUserNfts();
    }
  }, [currentAccount]);

  const fetchUserEscrows = async () => {
    if (!currentAccount?.address) return;
    
    try {
      const objects = await getOwnedObjects(currentAccount.address);
      const userEscrows = objects.filter(obj => 
        obj.data?.type?.includes('::escrow::')
      );
      setEscrows(userEscrows);
    } catch (error) {
      console.error('Error fetching escrows:', error);
    }
  };

  const fetchUserNfts = async () => {
    if (!currentAccount?.address) return;
    
    try {
      const objects = await getOwnedObjects(currentAccount.address);
      // Regular NFTs
      const userNfts = objects.filter(obj => 
        obj.data?.type?.includes('::') && 
        !obj.data?.type?.includes('::coin::') && 
        !obj.data?.type?.includes('::escrow::')
      );
      setNfts(userNfts);
      
      // Burnable NFTs (Sand Dollar NFTs)
      const sandDollarNfts = objects.filter(obj => 
        obj.data?.type?.includes('sand_dollar::sand_dollar::EscrowNFT')
      );
      setBurnableNfts(sandDollarNfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const onSubmit: SubmitHandler<RedeemFormInputs> = async (data) => {
    if (!currentAccount) return;
    
    setIsLoading(true);
    try {
      // Find the NFT type from selected NFT
      const selectedNft = nfts.find(nft => nft.data?.objectId === data.nftObject);
      const nftType = selectedNft?.data?.type || '';
      
      await redeemEscrow(
        {
          signAndExecuteTransactionBlock,
        },
        data.escrowObject,
        data.nftObject,
        nftType,
        data.coinType || '0x2::sui::SUI'
      );
      
      alert('Escrow redeemed successfully!');
      fetchUserEscrows();
      fetchUserNfts();
    } catch (error) {
      console.error('Error redeeming escrow:', error);
      alert('Failed to redeem escrow. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBurnNft = async (nftId: string) => {
    if (!currentAccount) return;
    
    setIsLoading(true);
    try {
      await burnEscrowNft(
        {
          signAndExecuteTransactionBlock,
        },
        nftId
      );
      
      alert('NFT burned successfully!');
      fetchUserNfts();
    } catch (error) {
      console.error('Error burning NFT:', error);
      alert('Failed to burn NFT. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentAccount) {
    return <div className="text-center">Please connect your wallet to redeem escrows or burn NFTs.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Redeem Escrow</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Escrow Object</label>
            <select
              {...register('escrowObject', { required: 'Please select an escrow' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an escrow</option>
              {escrows.map((escrow) => (
                <option key={escrow.data?.objectId} value={escrow.data?.objectId}>
                  {escrow.data?.objectId.substring(0, 8)}... - Escrow
                </option>
              ))}
            </select>
            {errors.escrowObject && <p className="text-red-500 text-xs mt-1">{errors.escrowObject.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">NFT Object</label>
            <select
              {...register('nftObject', { required: 'Please select an NFT' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an NFT</option>
              {nfts.map((nft) => (
                <option key={nft.data?.objectId} value={nft.data?.objectId}>
                  {nft.data?.objectId.substring(0, 8)}... - {nft.data?.type?.split('::').pop()}
                </option>
              ))}
            </select>
            {errors.nftObject && <p className="text-red-500 text-xs mt-1">{errors.nftObject.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Coin Type (leave empty for SUI)</label>
            <input
              type="text"
              {...register('coinType')}
              placeholder="0x2::sui::SUI"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {isLoading ? 'Redeeming...' : 'Redeem Escrow'}
          </button>
        </form>
      </div>
      
      {burnableNfts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Burn Sand Dollar NFTs</h2>
          
          <div className="space-y-4">
            {burnableNfts.map((nft) => (
              <div key={nft.data?.objectId} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span>{nft.data?.objectId.substring(0, 12)}... - Sand Dollar NFT</span>
                <button
                  onClick={() => handleBurnNft(nft.data?.objectId)}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Burn
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 