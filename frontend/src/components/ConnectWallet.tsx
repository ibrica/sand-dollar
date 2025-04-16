'use client';

import { useState } from 'react';
import { useWallet } from './WalletProvider';

export function ConnectWallet() {
  const { wallets, selectedWallet, connectWallet, disconnectWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = async (walletName: string) => {
    await connectWallet(walletName);
    setIsOpen(false);
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
  };

  if (selectedWallet) {
    return (
      <button 
        onClick={handleDisconnect}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        Disconnect {selectedWallet.name}
      </button>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        Connect Wallet
      </button>
      
      {isOpen && (
        <div className="absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {wallets.map((wallet) => (
              <button
                key={wallet.name}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleConnect(wallet.name)}
              >
                {wallet.icon && (
                  <img 
                    src={wallet.icon} 
                    alt={`${wallet.name} icon`} 
                    className="w-5 h-5 mr-2" 
                  />
                )}
                {wallet.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 