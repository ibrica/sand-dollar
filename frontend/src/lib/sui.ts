import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { toB64 } from '@mysten/sui.js/utils';

// Network configuration
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'devnet';
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
const MODULE_NAME = process.env.NEXT_PUBLIC_MODULE_NAME || 'sand_dollar';

// Get RPC URL based on selected network
export function getRpcUrl(): string {
  switch (NETWORK) {
    case 'local':
      return process.env.NEXT_PUBLIC_LOCAL_RPC || 'http://localhost:9000';
    case 'devnet':
      return (
        process.env.NEXT_PUBLIC_DEVNET_RPC ||
        'https://fullnode.devnet.sui.io:443'
      );
    case 'testnet':
      return (
        process.env.NEXT_PUBLIC_TESTNET_RPC ||
        'https://fullnode.testnet.sui.io:443'
      );
    case 'mainnet':
      return (
        process.env.NEXT_PUBLIC_MAINNET_RPC ||
        'https://fullnode.mainnet.sui.io:443'
      );
    default:
      return (
        process.env.NEXT_PUBLIC_DEVNET_RPC ||
        'https://fullnode.devnet.sui.io:443'
      );
  }
}

// Create Sui client
export const suiClient = new SuiClient({ url: getRpcUrl() });

// Contract config
export const CONTRACT_CONFIG = {
  packageId: PACKAGE_ID,
  moduleName: MODULE_NAME,
};

// Yield provider options
export enum YieldProvider {
  None = 0,
  Navi = 1,
  SuiLend = 2,
}

// Interface that defines the necessary wallet methods
export interface WalletInterface {
  signAndExecuteTransaction: (tx: any, account: any) => Promise<any>;
  signTransaction?: (tx: any, account: any) => Promise<any>;
  reportTransactionEffects?: (effects: any, account: any) => Promise<void>;
}

// Function to create escrow with minting a new NFT
export async function createEscrowMintNft(
  wallet: WalletInterface,
  coinType: string,
  coinObjectId: string,
  amount: bigint,
  yieldProvider: YieldProvider,
  account: any
) {
  const tx = new TransactionBlock();

  // Split the coin if needed
  const coin = tx.splitCoins(tx.object(coinObjectId), [tx.pure(amount)]);

  // Get clock object
  const clock = tx.object('0x6');

  // Call the contract function
  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::create_escrow_mint_nft`,
    typeArguments: [coinType],
    arguments: [coin, tx.pure(yieldProvider), clock],
  });

  // Execute the transaction
  const result = await wallet.signAndExecuteTransaction(tx, account);

  // Report transaction effects if supported
  if (wallet.reportTransactionEffects && result.effects) {
    await wallet.reportTransactionEffects(
      typeof result.effects === 'string'
        ? result.effects
        : toB64(result.effects),
      account
    );
  }

  return result;
}

// Function to create escrow with existing NFT
export async function createEscrowWithNft(
  wallet: WalletInterface,
  coinType: string,
  coinObjectId: string,
  amount: bigint,
  nftObjectId: string,
  nftType: string,
  yieldProvider: YieldProvider,
  account: any
) {
  const tx = new TransactionBlock();

  // Split the coin if needed
  const coin = tx.splitCoins(tx.object(coinObjectId), [tx.pure(amount)]);

  // Get clock object
  const clock = tx.object('0x6');

  // Call the contract function
  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::create_escrow_with_nft`,
    typeArguments: [nftType, coinType],
    arguments: [coin, tx.object(nftObjectId), tx.pure(yieldProvider), clock],
  });

  // Execute the transaction
  const result = await wallet.signAndExecuteTransaction(tx, account);

  // Report transaction effects if supported
  if (wallet.reportTransactionEffects && result.effects) {
    await wallet.reportTransactionEffects(
      typeof result.effects === 'string'
        ? result.effects
        : toB64(result.effects),
      account
    );
  }

  return result;
}

// Function to redeem escrow
export async function redeemEscrow(
  wallet: WalletInterface,
  escrowId: string,
  nftObjectId: string,
  nftType: string,
  coinType: string,
  account: any
) {
  const tx = new TransactionBlock();

  // Get clock object
  const clock = tx.object('0x6');

  // Call the contract function
  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::redeem_escrow`,
    typeArguments: [nftType, coinType],
    arguments: [tx.object(nftObjectId), tx.object(escrowId), clock],
  });

  // Execute the transaction
  const result = await wallet.signAndExecuteTransaction(tx, account);

  // Report transaction effects if supported
  if (wallet.reportTransactionEffects && result.effects) {
    await wallet.reportTransactionEffects(
      typeof result.effects === 'string'
        ? result.effects
        : toB64(result.effects),
      account
    );
  }

  return result;
}

// Function to burn escrow NFT
export async function burnEscrowNft(
  wallet: WalletInterface,
  nftObjectId: string,
  account: any
) {
  const tx = new TransactionBlock();

  // Call the contract function
  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::burn_escrow_nft`,
    arguments: [tx.object(nftObjectId)],
  });

  // Execute the transaction
  const result = await wallet.signAndExecuteTransaction(tx, account);

  // Report transaction effects if supported
  if (wallet.reportTransactionEffects && result.effects) {
    await wallet.reportTransactionEffects(
      typeof result.effects === 'string'
        ? result.effects
        : toB64(result.effects),
      account
    );
  }

  return result;
}

// Function to get owned objects
export async function getOwnedObjects(owner: string, type?: string) {
  const objects = await suiClient.getOwnedObjects({
    owner,
    options: {
      showContent: true,
      showType: true,
    },
    filter: type ? { StructType: type } : undefined,
  });

  return objects.data;
}

// Function to get user coins
export async function getUserCoins(
  owner: string,
  coinType: string = '0x2::sui::SUI'
) {
  const coins = await suiClient.getCoins({
    owner,
    coinType,
  });

  return coins.data;
}
