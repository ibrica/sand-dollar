'use client';

import { useState } from 'react';
import { ConnectWallet } from '@/components/ConnectWallet';
import { CreateEscrow } from '@/components/CreateEscrow';
import { ConnectExistingNft } from '@/components/ConnectExistingNft';
import { RedeemNft } from '@/components/RedeemNft';
import { useWallet } from '@/components/WalletProvider';
import { Hero } from '@/components/Hero';
import { Logo } from '@/components/Logo';

export default function Home() {
  const { accounts } = useWallet();
  const currentAccount = accounts?.[0];
  const [activeTab, setActiveTab] = useState<'create' | 'connect' | 'redeem'>('create');
  
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="container flex justify-between items-center">
          <Logo size={48} color="gradient" />
          <ConnectWallet />
        </div>
      </header>

      {/* Hero Section */}
      <Hero />
      
      {/* Main Content */}
      <div className="container py-16">
        {currentAccount && (
          <div className="mb-6 card">
            <div className="flex flex-col sm:flex-row border-b border-border mb-6">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-3 px-4 font-medium border-b-2 ${
                  activeTab === 'create' 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-text-secondary hover:text-white'
                }`}
              >
                Create New NFT
              </button>
              <button
                onClick={() => setActiveTab('connect')}
                className={`py-3 px-4 font-medium border-b-2 ${
                  activeTab === 'connect' 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-text-secondary hover:text-white'
                }`}
              >
                Use Existing NFT
              </button>
              <button
                onClick={() => setActiveTab('redeem')}
                className={`py-3 px-4 font-medium border-b-2 ${
                  activeTab === 'redeem' 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-text-secondary hover:text-white'
                }`}
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
        )}
        
        {!currentAccount && (
          <div className="text-center p-12 card">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="mb-6 text-text-secondary">Connect your wallet to create yield-generating NFTs</p>
            <div className="flex justify-center">
              <ConnectWallet />
            </div>
          </div>
        )}
      </div>
      
      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo size={32} color="gradient" />
              <p className="text-text-secondary mt-2">Create yield-generating NFTs on the Sui blockchain</p>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-text-secondary hover:text-accent">Docs</a>
              <a href="#" className="text-text-secondary hover:text-accent">GitHub</a>
              <a href="#" className="text-text-secondary hover:text-accent">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
} 