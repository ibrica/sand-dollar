# SandDollar.fi

A decentralized application on the SUI blockchain for securely escrowing wrapped BTC tokens and minting NFTs.

## Overview

SandDollar.fi allows users to:

- Escrow wBTC (from SUI bridge) and lBTC (Lombard Liquid BTC) tokens
- Receive NFTs representing their escrowed positions
- Redeem their escrowed tokens using the NFTs

## Project Structure

```
sand-dollar/
├── Move.toml           # Package manifest
├── sources/            # Smart contract source files
│   └── sand_dollar.move
├── tests/             # Test files
│   ├── sand_dollar_tests.move
│   └── test_config.toml
└── .gitignore         # Git ignore rules
```

## Prerequisites

- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install)
- [Move CLI](https://github.com/move-language/move/releases)

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   sui move build
   ```

## Testing

The project includes a comprehensive test suite. To run tests:

1. Run all tests:

   ```bash
   sui move test
   ```

2. Run specific test scenarios:

   ```bash
   sui move test test_create_and_redeem_escrow
   sui move test test_create_escrow_with_zero_amount
   ```

3. Run tests with verbose output:

   ```bash
   sui move test --verbose
   ```

4. Run tests with coverage:
   ```bash
   sui move test --coverage
   ```

Test configuration can be found in `tests/test_config.toml`.

## Deployment

1. Build the package:

   ```bash
   sui move build
   ```

2. Deploy to SUI network:
   ```bash
   sui client publish --gas-budget 10000000
   ```

## Development Workflow

1. Make changes to the smart contract in `sources/`
2. Update tests in `tests/` if needed
3. Run tests to verify changes
4. Build and deploy if tests pass

## Security

This project is in development and has not been audited. Use at your own risk.

## License

MIT
