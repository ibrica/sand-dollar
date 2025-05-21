'use client';

import { useState, useEffect } from 'react';
import { useCurrentWallet, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useForm, SubmitHandler } from 'react-hook-form';
import { YieldProvider, getUserCoins, CONTRACT_CONFIG } from '@/lib/sui';
import { Transaction } from '@mysten/sui/transactions';

type CreateEscrowFormInputs = {
  amount: string;
  yieldProvider: string;
  coinObject: string;
};

export function CreateEscrow() {
  const { currentWallet } = useCurrentWallet();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [coins, setCoins] = useState<any[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateEscrowFormInputs>();

  const currentAccount = currentWallet?.accounts[0];

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
    if (!currentAccount || !currentWallet) return;
    
    setIsLoading(true);
    try {
      const amount = BigInt(parseFloat(data.amount) * 1_000_000_000); // Convert to MIST (9 decimals)
      const yieldProvider = parseInt(data.yieldProvider) as YieldProvider;
      
      // Get the selected coin
      const selectedCoin = coins.find(coin => coin.coinObjectId === data.coinObject);
      
      if (!selectedCoin) {
        throw new Error('Selected coin not found');
      }

      // Check if we have enough balance
      const totalAmount = amount + BigInt(10_000_000); // Amount + gas (0.01 SUI)
      if (BigInt(selectedCoin.balance) < totalAmount) {
        throw new Error(`Insufficient balance. You need at least ${Number(totalAmount) / 1_000_000_000} SUI (including gas)`);
      }

      console.log('Creating transaction using Inputs.SuiCoinObject...');
      
      // Create a fresh transaction
      const tx = new Transaction();
      
      // Set sender address
      tx.setSender(currentAccount.address);
      
      // Set gas budget
      tx.setGasBudget(10000000n); // 0.01 SUI
      
      // Get reference to clock object
      const clock = tx.object('0x6');
      
      // Use the selected coin directly with a specific amount
      const escrowCoin = tx.splitCoins(tx.object(data.coinObject), [
        tx.pure.u64(amount)
      ]);
      
      // Use the contract function
      tx.moveCall({
        target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::create_escrow_mint_nft`,
        typeArguments: ['0x2::sui::SUI'],
        arguments: [escrowCoin, tx.pure.u8(yieldProvider), clock],
      });
      
      console.log('Transaction built, attempting to execute...');
      
      // Execute the transaction
      const response = await signAndExecuteTransaction({
        transaction: tx.serialize(),
      });
      
      console.log('Transaction executed:', response.digest);
      
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
    <div className="bg-background-light p-6 rounded-lg shadow-md border border-border">
      <h2 className="text-xl font-bold mb-4 text-white">Create New Yield NFT</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          {isLoading ? 'Creating...' : 'Create Yield NFT'}
        </button>
      </form>
    </div>
  );
} 