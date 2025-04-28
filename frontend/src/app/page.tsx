'use client';

import { useState } from 'react';
import { useCurrentWallet } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConnectWallet } from '@/components/ConnectWallet';
import { CreateEscrow } from '@/components/CreateEscrow';
import { ConnectExistingNft } from '@/components/ConnectExistingNft';
import { RedeemNft } from '@/components/RedeemNft';
import { Logo } from '@/components/Logo';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentWallet, isConnected } = useCurrentWallet();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Logo size={48} color="gradient" />
          <ConnectWallet />
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-7xl py-32 sm:py-48 lg:py-56">
          <div className="text-left">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Sand Dollar
            </h1>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mt-2">
              Yield-Generating NFTs<br />on Sui
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl">
              Create, manage, and trade NFTs that generate yield. Unlock the potential of your digital assets with Sand Dollar.
            </p>
            <div className="mt-10 flex gap-x-6">
              {isConnected ? (
                <Button size="lg" onClick={() => setIsModalOpen(true)}>
                  Get Started
                </Button>
              ) : (
                <ConnectWallet />
              )}
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="relative isolate px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="bg-background-light rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Dashboard Preview
            </h2>
            <p className="text-gray-300">
              Your NFT portfolio analytics at a glance
            </p>
            <div className="mt-6 aspect-video bg-background-dark rounded-lg flex items-center justify-center">
              <div className="text-gray-500">
                Preview coming soon...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Modal - Only shown when wallet is connected */}
      {isConnected && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Get Started with Sand Dollar"
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-2">Create New Yield NFT</h4>
              <CreateEscrow />
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <h4 className="text-lg font-medium text-white mb-2">Connect Existing NFT</h4>
              <ConnectExistingNft />
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <h4 className="text-lg font-medium text-white mb-2">Redeem or Burn NFT</h4>
              <RedeemNft />
            </div>
          </div>
        </Modal>
      )}
      
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
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