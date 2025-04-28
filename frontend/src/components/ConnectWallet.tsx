'use client';

import { ConnectButton } from '@mysten/dapp-kit';
import { Button } from './ui/Button';

export function ConnectWallet() {
  return (
    <ConnectButton 
      className="!bg-primary hover:!bg-primary/90 !text-white !px-6 !py-2 !rounded-lg !font-medium !text-base"
    />
  );
} 