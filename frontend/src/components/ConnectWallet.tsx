'use client';

import { ConnectButton } from '@mysten/dapp-kit';

export function ConnectWallet() {
  return (
    <ConnectButton className="bg-primary hover:bg-secondary text-white rounded-lg px-6 py-2 font-medium transition-colors" />
  );
} 