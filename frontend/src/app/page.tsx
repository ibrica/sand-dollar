'use client';

import { useState } from 'react';
import { ConnectWallet } from '@/components/ConnectWallet';
import { CreateEscrow } from '@/components/CreateEscrow';
import { ConnectExistingNft } from '@/components/ConnectExistingNft';
import { RedeemNft } from '@/components/RedeemNft';
import { useWallet } from '@/components/WalletProvider';

export default function Home() {
  const { accounts } = useWallet();
  const currentAccount = accounts?.[0];
  const [activeTab, setActiveTab] = useState<'create' | 'connect' | 'redeem'>('create');
  
  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Sand Dollar - Yield NFTs</h1>
            <ConnectWallet />
          </div>
          
          {currentAccount && (
            <div className="bg-white p-3 rounded shadow text-sm">
              <p>Connected: <span className="font-mono">{currentAccount.address.substring(0, 10)}...{currentAccount.address.substring(currentAccount.address.length - 6)}</span></p>
            </div>
          )}
        </header>
        
        {currentAccount && (
          <>
            <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex-1 py-3 px-4 font-medium ${activeTab === 'create' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Create New NFT
                </button>
                <button
                  onClick={() => setActiveTab('connect')}
                  className={`flex-1 py-3 px-4 font-medium ${activeTab === 'connect' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Use Existing NFT
                </button>
                <button
                  onClick={() => setActiveTab('redeem')}
                  className={`flex-1 py-3 px-4 font-medium ${activeTab === 'redeem' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Redeem/Burn
                </button>
              </div>
              
              <div className="p-6">
                {activeTab === 'create' && <CreateEscrow />}
                {activeTab === 'connect' && <ConnectExistingNft />}
                {activeTab === 'redeem' && <RedeemNft />}
              </div>
            </div>
          </>
        )}
        
        {!currentAccount && (
          <div className="text-center p-12 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Welcome to Sand Dollar</h2>
            <p className="mb-6">Connect your wallet to create yield-generating NFTs</p>
            <div className="flex justify-center">
              <ConnectWallet />
            </div>
          </div>
        )}
        
        <footer className="mt-10 text-center text-gray-500 text-sm">
          <p>Sand Dollar - Create yield-generating NFTs on the Sui blockchain</p>
        </footer>
      </div>
    </main>
  );
} 