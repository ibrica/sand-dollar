'use client';

import { useState } from 'react';
import { useCurrentWallet } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/Button';
import { ConnectWallet } from '@/components/ConnectWallet';
import { Logo } from '@/components/Logo';
import { FeaturesTabs } from '@/components/FeaturesTabs';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { isConnected } = useCurrentWallet();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Logo size={48} color="gradient" />
          <ConnectWallet />
        </div>
      </header>

      {/* Hero Section with Dashboard Preview */}
      <div className="relative isolate px-6 pt-8 lg:px-8">
        <div className="mx-auto max-w-7xl py-16 sm:py-24 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sand Dollar</span>
              </h1>
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mt-2">
                Yield-Generating NFTs<br />on Sui
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl">
                Create, manage, and trade NFTs that generate yield. Unlock the potential of your digital assets with Sand Dollar.
              </p>
              <div className="mt-10 flex gap-x-6">
                {!isConnected ? (
                  <ConnectWallet />
                ) : (
                  <Button size="lg" className="bg-primary hover:bg-secondary text-white">
                    Get Started
                  </Button>
                )}
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="lg:w-full">
              <Dashboard />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Only shown when wallet is connected */}
      {isConnected && (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-background rounded-2xl p-8 shadow-xl">
            <FeaturesTabs />
          </div>
        </div>
      )}
      
      <footer className="border-t border-border py-8 mt-auto">
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