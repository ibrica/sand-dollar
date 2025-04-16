'use client';

import { useState, useEffect } from 'react';
import { useWallet } from './WalletProvider';
import { useForm, SubmitHandler } from 'react-hook-form';
import { createEscrowMintNft, getUserCoins, YieldProvider } from '@/lib/sui';

type CreateEscrowFormInputs = {
  amount: string;
  yieldProvider: string;
  coinObject: string;
};

export function CreateEscrow() {
  const { accounts, selectedWallet, signAndExecuteTransaction, reportTransactionEffects } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [coins, setCoins] = useState<any[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateEscrowFormInputs>();

  const currentAccount = accounts?.[0];

  useEffect(() => {
    if (currentAccount?.address) {
      fetchUserCoins();
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

  const onSubmit: SubmitHandler<CreateEscrowFormInputs> = async (data) => {
    if (!currentAccount || !selectedWallet) return;
    
    setIsLoading(true);
    try {
      const amount = BigInt(parseFloat(data.amount) * 1_000_000_000); // Convert to MIST (9 decimals)
      const yieldProvider = parseInt(data.yieldProvider) as YieldProvider;
      
      await createEscrowMintNft(
        {
          signAndExecuteTransaction: (tx, account) => signAndExecuteTransaction(tx, account),
          reportTransactionEffects: reportTransactionEffects
        },
        '0x2::sui::SUI', // Coin type
        data.coinObject,
        amount,
        yieldProvider,
        currentAccount
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
    return <div className="text-center">Please connect your wallet to create an escrow.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create New Yield NFT</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Coin Object</label>
          <select
            {...register('coinObject', { required: 'Please select a coin' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a coin</option>
            {coins.map((coin) => (
              <option key={coin.coinObjectId} value={coin.coinObjectId}>
                {coin.coinObjectId.substring(0, 8)}... - {(Number(coin.balance) / 1_000_000_000).toFixed(2)} SUI
              </option>
            ))}
          </select>
          {errors.coinObject && <p className="text-red-500 text-xs mt-1">{errors.coinObject.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount (SUI)</label>
          <input
            type="number"
            step="0.000000001"
            min="0.000000001"
            {...register('amount', { 
              required: 'Amount is required',
              min: { value: 0.000000001, message: 'Amount must be greater than 0' }
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Yield Provider</label>
          <select
            {...register('yieldProvider', { required: 'Please select a yield provider' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="0">None</option>
            <option value="1">Navi</option>
            <option value="2">SuiLend</option>
          </select>
          {errors.yieldProvider && <p className="text-red-500 text-xs mt-1">{errors.yieldProvider.message}</p>}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isLoading ? 'Creating...' : 'Create Yield NFT'}
        </button>
      </form>
    </div>
  );
} 