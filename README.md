# Sand Dollar

Sand Dollar is a project for creating yield-generating NFTs on the Sui blockchain. Users can lock coins, associate them with NFTs, and generate yield through different providers.

## Project Structure

The project is organized into two main parts:

### 1. Smart Contract (`/contract`)

The Sui Move smart contract that handles:

- Creating escrow positions with newly minted NFTs
- Creating escrow positions with existing NFTs
- Redemption of escrow positions
- Burning of NFTs

### 2. Frontend Application (`/frontend`)

A Next.js application that provides a user interface for interacting with the smart contract:

- Creating new yield NFTs
- Using existing NFTs for yield generation
- Redeeming NFTs to get coins back
- Burning NFTs that were minted by the smart contract

## Getting Started

### Smart Contract

1. Navigate to the contract directory:

```bash
cd contract
```

2. Build the contract:

```bash
sui move build
```

3. Deploy the contract:

```bash
sui client publish --gas-budget 100000000
```

4. Note the package ID from the deployment output.

### Frontend

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Create a `.env.local` file with the following content:

```
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_PACKAGE_ID=<your_package_id>  # Replace with the package ID from step 4 above
NEXT_PUBLIC_MODULE_NAME=sand_dollar
NEXT_PUBLIC_LOCAL_RPC=http://localhost:9000
NEXT_PUBLIC_DEVNET_RPC=https://fullnode.devnet.sui.io:443
NEXT_PUBLIC_TESTNET_RPC=https://fullnode.testnet.sui.io:443
NEXT_PUBLIC_MAINNET_RPC=https://fullnode.mainnet.sui.io:443
```

3. Install dependencies:

```bash
npm install
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the application.

## Features

- **Create New Yield NFT**: Lock coins and get a newly minted NFT
- **Use Existing NFT**: Connect an existing NFT to locked coins
- **Redeem/Burn**: Redeem the escrow position to get coins back or burn NFTs

## License

[MIT License](LICENSE)
