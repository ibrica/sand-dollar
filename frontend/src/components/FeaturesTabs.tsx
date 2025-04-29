'use client';

import { useState } from 'react';
import { CreateEscrow } from './CreateEscrow';
import { ConnectExistingNft } from './ConnectExistingNft';
import { RedeemNft } from './RedeemNft';

type Tab = 'create' | 'existing' | 'redeem';

export function FeaturesTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('create');

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'create'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Create New NFT
        </button>
        <button
          onClick={() => setActiveTab('existing')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'existing'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Use Existing NFT
        </button>
        <button
          onClick={() => setActiveTab('redeem')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'redeem'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Redeem/Burn
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'create' && <CreateEscrow />}
        {activeTab === 'existing' && <ConnectExistingNft />}
        {activeTab === 'redeem' && <RedeemNft />}
      </div>
    </div>
  );
} 