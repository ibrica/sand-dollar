# Sand Dollar Frontend

This is a Next.js frontend application for the Sand Dollar smart contract, which allows users to create yield-generating NFTs on the Sui blockchain.

## Features

- Create new yield NFTs by sending coins and getting back a newly minted NFT
- Connect existing NFTs to coins to generate yield
- Redeem NFTs to get money back when the lock period ends
- Burn NFTs that were minted by the smart contract

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Sui wallet extension (Sui Wallet, Suiet, or Ethos Wallet)

### Configuration

Create a `.env.local` file in the root directory with the following content:

```
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_PACKAGE_ID=<your_package_id>
NEXT_PUBLIC_MODULE_NAME=sand_dollar
NEXT_PUBLIC_LOCAL_RPC=http://localhost:9000
NEXT_PUBLIC_DEVNET_RPC=https://fullnode.devnet.sui.io:443
NEXT_PUBLIC_TESTNET_RPC=https://fullnode.testnet.sui.io:443
NEXT_PUBLIC_MAINNET_RPC=https://fullnode.mainnet.sui.io:443
```

Replace `<your_package_id>` with the actual package ID of your deployed Sand Dollar contract.

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## Deployment

### Vercel Deployment

1. Push your code to a Git repository.
2. Import your project into Vercel.
3. Configure environment variables in Vercel project settings.
4. Deploy your application.

## Smart Contract Integration

The frontend interacts with the Sand Dollar smart contract which provides the following functionality:

- `create_escrow_mint_nft`: Creates a new escrow with a newly minted NFT
- `create_escrow_with_nft`: Creates a new escrow with an existing NFT
- `redeem_escrow`: Redeems an escrow to get coins back when the lock period ends
- `burn_escrow_nft`: Burns an NFT minted by the smart contract

## License

[MIT License](LICENSE)
