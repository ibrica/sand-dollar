import { SuiClient } from '@mysten/sui/client';
import { getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { toB64 } from '@mysten/sui/utils';
import { type WalletAccount } from '@mysten/wallet-standard';

const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'testnet';
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

export const CONTRACT_CONFIG = {
  packageId: PACKAGE_ID,
  moduleName: MODULE_NAME,
};

export enum YieldProvider {
  None = 0,
  Navi = 1,
  SuiLend = 2,
}

export async function createEscrowMintNft(
  signAndExecuteTransactionBlock: (
    transaction: Transaction
  ) => Promise<{ digest: string }>,
  reportTransactionEffects: (effects: any) => Promise<void>,
  coinType: string,
  coinObjectId: string,
  amount: bigint,
  yieldProvider: YieldProvider,
  account: WalletAccount
) {
  const tx = new Transaction();

  tx.setSender(account.address);

  // Get the coin for contract payment
  const coinForContract = tx.splitCoins(tx.object(coinObjectId), [
    tx.pure.u64(amount),
  ]);

  // Get a separate coin for gas
  const gasCoins = await suiClient.getCoins({
    owner: account.address,
    coinType: '0x2::sui::SUI',
    limit: 1,
  });

  if (!gasCoins.data || gasCoins.data.length === 0) {
    throw new Error('No gas coins found');
  }

  const gasCoin = gasCoins.data[0];

  // Set the gas payment using the separate gas coin
  tx.setGasPayment([
    {
      objectId: gasCoin.coinObjectId,
      version: gasCoin.version,
      digest: gasCoin.digest,
    },
  ]);

  const clock = tx.object('0x6');

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::create_escrow_mint_nft`,
    typeArguments: [coinType],
    arguments: [coinForContract, tx.pure.u8(yieldProvider), clock],
  });

  const result = await signAndExecuteTransactionBlock(tx);

  // Get transaction effects from the digest
  const effects = await suiClient.getTransactionBlock({
    digest: result.digest,
    options: { showEffects: true },
  });

  if (effects.effects) {
    await reportTransactionEffects(effects.effects);
  }

  return result;
}

export async function createEscrowWithNft(
  signAndExecuteTransactionBlock: (
    transaction: Transaction
  ) => Promise<{ digest: string }>,
  reportTransactionEffects: (effects: any) => Promise<void>,
  coinType: string,
  coinObjectId: string,
  amount: bigint,
  nftObjectId: string,
  nftType: string,
  yieldProvider: YieldProvider,
  account: WalletAccount
) {
  const tx = new Transaction();

  const coin = tx.splitCoins(tx.object(coinObjectId), [tx.pure.u64(amount)]);

  const clock = tx.object('0x6');

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::create_escrow_with_nft`,
    typeArguments: [nftType, coinType],
    arguments: [coin, tx.object(nftObjectId), tx.pure.u8(yieldProvider), clock],
  });

  const result = await signAndExecuteTransactionBlock(tx);

  // Get transaction effects from the digest
  const effects = await suiClient.getTransactionBlock({
    digest: result.digest,
    options: { showEffects: true },
  });

  if (effects.effects) {
    await reportTransactionEffects(effects.effects);
  }

  return result;
}

export async function redeemEscrow(
  signAndExecuteTransactionBlock: (
    transaction: Transaction
  ) => Promise<{ digest: string }>,
  reportTransactionEffects: (effects: any) => Promise<void>,
  escrowId: string,
  nftObjectId: string,
  nftType: string,
  coinType: string,
  account: WalletAccount
) {
  const tx = new Transaction();

  const clock = tx.object('0x6');

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::redeem_escrow`,
    typeArguments: [nftType, coinType],
    arguments: [tx.object(nftObjectId), tx.object(escrowId), clock],
  });

  const result = await signAndExecuteTransactionBlock(tx);

  // Get transaction effects from the digest
  const effects = await suiClient.getTransactionBlock({
    digest: result.digest,
    options: { showEffects: true },
  });

  if (effects.effects) {
    await reportTransactionEffects(effects.effects);
  }

  return result;
}

export async function burnEscrowNft(
  signAndExecuteTransactionBlock: (
    transaction: Transaction
  ) => Promise<{ digest: string }>,
  reportTransactionEffects: (effects: any) => Promise<void>,
  nftObjectId: string,
  account: WalletAccount
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::burn_escrow_nft`,
    arguments: [tx.object(nftObjectId)],
  });

  const result = await signAndExecuteTransactionBlock(tx);

  // Get transaction effects from the digest
  const effects = await suiClient.getTransactionBlock({
    digest: result.digest,
    options: { showEffects: true },
  });

  if (effects.effects) {
    await reportTransactionEffects(effects.effects);
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
