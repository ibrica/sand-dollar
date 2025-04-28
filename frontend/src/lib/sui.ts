import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { toB64 } from '@mysten/sui.js/utils';

console.log('process.env.NEXT_PUBLIC_NETWORK', process.env.NEXT_PUBLIC_NETWORK);
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'devnet';
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
const MODULE_NAME = process.env.NEXT_PUBLIC_MODULE_NAME || 'sand_dollar';

export function getRpcUrl(): string {
  switch (NETWORK) {
    case 'local':
      return process.env.NEXT_PUBLIC_LOCAL_RPC || 'http://localhost:9000';
    case 'devnet':
      return process.env.NEXT_PUBLIC_DEVNET_RPC || getFullnodeUrl('devnet');
    case 'testnet':
      return process.env.NEXT_PUBLIC_TESTNET_RPC || getFullnodeUrl('testnet');
    case 'mainnet':
      return process.env.NEXT_PUBLIC_MAINNET_RPC || getFullnodeUrl('mainnet');
    default:
      return process.env.NEXT_PUBLIC_TESTNET_RPC || getFullnodeUrl('testnet');
  }
}

export const suiClient = new SuiClient({ url: getRpcUrl() });

// Log the RPC URL being used
console.log('Using RPC URL:', getRpcUrl());

export const CONTRACT_CONFIG = {
  packageId: PACKAGE_ID,
  moduleName: MODULE_NAME,
};

export enum YieldProvider {
  None = 0,
  Navi = 1,
  SuiLend = 2,
}

export interface WalletInterface {
  signAndExecuteTransaction: (tx: any, account: any) => Promise<any>;
  signTransaction?: (tx: any, account: any) => Promise<any>;
  reportTransactionEffects?: (effects: any, account: any) => Promise<void>;
}

export async function createEscrowMintNft(
  wallet: WalletInterface,
  coinType: string,
  coinObjectId: string,
  amount: bigint,
  yieldProvider: YieldProvider,
  account: any
) {
  const tx = new TransactionBlock();

  const coin = tx.splitCoins(tx.object(coinObjectId), [tx.pure(amount)]);

  const clock = tx.object('0x6');

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::create_escrow_mint_nft`,
    typeArguments: [coinType],
    arguments: [coin, tx.pure(yieldProvider), clock],
  });

  // Serialize the transaction before sending
  const serializedTx = await tx.build();
  const result = await wallet.signAndExecuteTransaction(serializedTx, account);

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

  const coin = tx.splitCoins(tx.object(coinObjectId), [tx.pure(amount)]);

  const clock = tx.object('0x6');

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::create_escrow_with_nft`,
    typeArguments: [nftType, coinType],
    arguments: [coin, tx.object(nftObjectId), tx.pure(yieldProvider), clock],
  });

  const result = await wallet.signAndExecuteTransaction(tx, account);

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

export async function redeemEscrow(
  wallet: WalletInterface,
  escrowId: string,
  nftObjectId: string,
  nftType: string,
  coinType: string,
  account: any
) {
  const tx = new TransactionBlock();

  const clock = tx.object('0x6');

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::redeem_escrow`,
    typeArguments: [nftType, coinType],
    arguments: [tx.object(nftObjectId), tx.object(escrowId), clock],
  });

  const result = await wallet.signAndExecuteTransaction(tx, account);

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

export async function burnEscrowNft(
  wallet: WalletInterface,
  nftObjectId: string,
  account: any
) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::burn_escrow_nft`,
    arguments: [tx.object(nftObjectId)],
  });

  const result = await wallet.signAndExecuteTransaction(tx, account);

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
