# Freya IC SDK for Node.js

A TypeScript/JavaScript SDK for interacting with Odin.fun DEX on the Internet Computer Protocol (ICP) blockchain.

## Installation

```bash
npm install freya-ic-sdk
```

## Quick Start

```typescript
import { FreyaClient, OdinFunAPI, Ed25519KeyIdentity } from 'freya-ic-sdk';

// Generate a new identity or load existing one
const identity = Ed25519KeyIdentity.generate();

// Initialize the Freya client for canister interactions
const freyaClient = new FreyaClient(identity);

// Initialize the API client for REST API interactions
const apiClient = new OdinFunAPI();
apiClient.setIdentity(identity);

// Authenticate with the API
await apiClient.authenticate();

// Get token information
const token = await freyaClient.getToken('token-id');
console.log('Token:', token);

// Execute a trade
const tradeResponse = await freyaClient.buyToken(
  'token-id',
  BigInt(1000000), // 0.01 BTC in satoshis
  0.5 // 0.5% slippage tolerance
);
```

## Features

### FreyaClient - Canister Interactions

- **Trading**: Buy/sell tokens with customizable slippage
- **Withdrawals**: Withdraw BTC to external addresses
- **Token Management**: Create, mint, and manage tokens
- **Liquidity**: Add/remove liquidity, swap pooled tokens
- **Queries**: Get token info, balances, deposit addresses

### OdinFunAPI - REST API Client

- **Authentication**: Ed25519 signature-based auth
- **User Management**: Profile updates, balance queries
- **Market Data**: Token prices, trading history, holders
- **Social Features**: Comments on token pages
- **Analytics**: Trading volumes, profit tracking

## Examples

### Trading Bot Example

```typescript
import { FreyaClient, OdinFunAPI, Ed25519KeyIdentity, Helpers } from 'freya-ic-sdk';

async function tradingBot() {
  // Setup
  const identity = Ed25519KeyIdentity.generate();
  const freyaClient = new FreyaClient(identity);
  const apiClient = new OdinFunAPI();
  apiClient.setIdentity(identity);
  
  await apiClient.authenticate();
  
  // Get hot tokens
  const hotTokens = await apiClient.getHotTokens(5);
  
  for (const token of hotTokens) {
    // Check token metrics
    if (token.bondingCurveProgress > 50 && token.volume24h > 10000) {
      // Buy token
      const btcAmount = Helpers.convertToSatoshis(0.001); // 0.001 BTC
      const buyResponse = await freyaClient.buyToken(token.id, btcAmount, 1.0);
      
      if (buyResponse.ok) {
        console.log(`Bought ${token.symbol} for 0.001 BTC`);
        
        // Set sell target at 20% profit
        const targetPrice = token.priceBtc * 1.2;
        // Implement price monitoring and auto-sell logic
      }
    }
  }
}
```

### Portfolio Manager Example

```typescript
async function portfolioManager() {
  const identity = Ed25519KeyIdentity.fromJSON(process.env.IDENTITY_JSON!);
  const apiClient = new OdinFunAPI();
  apiClient.setIdentity(identity);
  
  await apiClient.authenticate();
  
  // Get user balances
  const balances = await apiClient.getUserBalances();
  
  // Display portfolio
  console.log('Portfolio Summary:');
  let totalValueUsd = 0;
  
  for (const balance of balances) {
    console.log(`${balance.symbol}: ${balance.amount} (${balance.totalValueUsd} USD)`);
    console.log(`  Unrealized P/L: ${balance.unrealizedProfitUsd} USD`);
    console.log(`  Realized P/L: ${balance.realizedProfitUsd} USD`);
    totalValueUsd += balance.totalValueUsd;
  }
  
  console.log(`\nTotal Portfolio Value: ${totalValueUsd} USD`);
}
```

### Liquidity Provider Example

```typescript
async function liquidityProvider() {
  const identity = Ed25519KeyIdentity.fromJSON(process.env.IDENTITY_JSON!);
  const freyaClient = new FreyaClient(identity);
  
  // Add liquidity to a token
  const tokenId = 'token-id';
  const amount = BigInt(10000000); // 0.1 BTC
  
  const addResponse = await freyaClient.addLiquidity(tokenId, amount);
  
  if (addResponse.ok) {
    console.log('Successfully added liquidity');
    
    // Monitor LP position
    const token = await freyaClient.getToken(tokenId);
    console.log('Current pool liquidity:', Helpers.convertToBTC(token.liquidityPool?.currentLiquidity || 0n));
  }
}
```

## API Reference

### FreyaClient Methods

#### Trading
- `buyToken(tokenId: string, btcAmount: bigint, slippageTolerance?: number)`
- `sellToken(tokenId: string, tokenAmount: bigint, slippageTolerance?: number)`

#### Withdrawals
- `withdrawBTC(destinationAddress: string, amount: bigint, tokenId?: string)`

#### Token Management
- `add(request: AddRequest)` - Create new token
- `mint(request: MintRequest)` - Mint tokens
- `etch(request: EtchRequest)` - Add rune metadata

#### Liquidity
- `addLiquidity(tokenId: string, amount: bigint)`
- `removeLiquidity(tokenId: string, amount: bigint)`
- `swapPooled(swap: LiquiditySwap)`

#### Queries
- `getToken(tokenId: string)`
- `getTokens()`
- `getBalance(principal: Principal, tokenId: string)`
- `getMyBalance(tokenId: string)`
- `getDepositAddress(principal: Principal)`
- `getMyDepositAddress()`

### OdinFunAPI Methods

#### Authentication
- `registerIdentity()` - Register new identity
- `authenticate()` - Get auth token

#### User Management
- `getUser(userId?: string)`
- `updateUser(updates: Partial<OdinUser>)`
- `changeUsername(username: string)`
- `getUserBalances()`

#### Token Data
- `getTokens(limit?: number, offset?: number)`
- `getToken(tokenId: string)`
- `getTokenHolders(tokenId: string, limit?: number, offset?: number)`
- `getTokenTrades(tokenId: string, limit?: number, offset?: number)`
- `searchTokens(query: string)`
- `getHotTokens(limit?: number)`
- `getNewTokens(limit?: number)`

#### Market Data
- `getBTCPrice()`
- `getRecentTrades(limit?: number)`
- `getUserTrades(userId?: string, limit?: number, offset?: number)`

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## License

MIT