import { FreyaClient, OdinFunAPI, Ed25519KeyIdentity, Helpers, OdinFunToken } from '../src';

interface TradingConfig {
  maxBuyAmountBTC: number;
  minMarketCapUSD: number;
  maxMarketCapUSD: number;
  minVolumeUSD: number;
  minBondingCurveProgress: number;
  profitTargetPercent: number;
  stopLossPercent: number;
  slippageTolerance: number;
}

interface Position {
  tokenId: string;
  symbol: string;
  buyPrice: number;
  amount: bigint;
  buyTimestamp: number;
}

class TradingBot {
  private freyaClient: FreyaClient;
  private apiClient: OdinFunAPI;
  private identity: Ed25519KeyIdentity;
  private config: TradingConfig;
  private positions: Map<string, Position> = new Map();
  private isRunning = false;

  constructor(identity: Ed25519KeyIdentity, config: TradingConfig) {
    this.identity = identity;
    this.freyaClient = new FreyaClient(identity);
    this.apiClient = new OdinFunAPI();
    this.apiClient.setIdentity(identity);
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('Initializing trading bot...');
    console.log('Principal:', this.identity.getPrincipal().toString());
    
    await this.apiClient.authenticate();
    
    const depositAddress = await this.freyaClient.getMyDepositAddress();
    console.log('Deposit Address:', depositAddress);
    
    console.log('Trading Configuration:');
    console.log('- Max buy amount:', this.config.maxBuyAmountBTC, 'BTC');
    console.log('- Market cap range:', this.config.minMarketCapUSD, '-', this.config.maxMarketCapUSD, 'USD');
    console.log('- Min volume:', this.config.minVolumeUSD, 'USD');
    console.log('- Min bonding curve progress:', this.config.minBondingCurveProgress, '%');
    console.log('- Profit target:', this.config.profitTargetPercent, '%');
    console.log('- Stop loss:', this.config.stopLossPercent, '%');
  }

  async findTradingOpportunities(): Promise<OdinFunToken[]> {
    const opportunities: OdinFunToken[] = [];
    
    // Get hot tokens
    const hotTokens = await this.apiClient.getHotTokens(20);
    
    for (const token of hotTokens) {
      if (this.isValidTradingOpportunity(token)) {
        opportunities.push(token);
      }
    }
    
    // Sort by volume descending
    opportunities.sort((a, b) => b.volumeUsd24h - a.volumeUsd24h);
    
    return opportunities.slice(0, 5); // Top 5 opportunities
  }

  private isValidTradingOpportunity(token: OdinFunToken): boolean {
    // Skip if already have position
    if (this.positions.has(token.id)) {
      return false;
    }
    
    // Check market cap range
    if (token.marketCapUsd < this.config.minMarketCapUSD || 
        token.marketCapUsd > this.config.maxMarketCapUSD) {
      return false;
    }
    
    // Check volume
    if (token.volumeUsd24h < this.config.minVolumeUSD) {
      return false;
    }
    
    // Check bonding curve progress
    if (token.bondingCurveProgress < this.config.minBondingCurveProgress) {
      return false;
    }
    
    // Avoid graduated tokens for this strategy
    if (token.isGraduated) {
      return false;
    }
    
    // Check recent price momentum (avoid falling tokens)
    if (token.change24h < -10) { // Avoid tokens down more than 10% in 24h
      return false;
    }
    
    return true;
  }

  async executeBuy(token: OdinFunToken): Promise<boolean> {
    try {
      const buyAmountBTC = Math.min(this.config.maxBuyAmountBTC, 0.01); // Max 0.01 BTC per trade
      const buyAmountSats = Helpers.convertToSatoshis(buyAmountBTC);
      
      console.log(`Attempting to buy ${token.symbol} for ${buyAmountBTC} BTC`);
      
      const buyResponse = await this.freyaClient.buyToken(
        token.id,
        buyAmountSats,
        this.config.slippageTolerance
      );
      
      if (buyResponse.ok) {
        const balance = await this.freyaClient.getMyBalance(token.id);
        
        const position: Position = {
          tokenId: token.id,
          symbol: token.symbol,
          buyPrice: token.priceUsd,
          amount: balance,
          buyTimestamp: Date.now()
        };
        
        this.positions.set(token.id, position);
        
        console.log(`✅ Successfully bought ${token.symbol}`);
        console.log(`   Price: $${token.priceUsd}`);
        console.log(`   Amount: ${Helpers.convertToTokenAmount(balance)} ${token.symbol}`);
        
        return true;
      } else {
        console.log(`❌ Failed to buy ${token.symbol}: ${buyResponse.err}`);
        return false;
      }
    } catch (error) {
      console.error(`Error buying ${token.symbol}:`, error);
      return false;
    }
  }

  async executeSell(position: Position, currentPrice: number, reason: string): Promise<boolean> {
    try {
      console.log(`Attempting to sell ${position.symbol} - Reason: ${reason}`);
      
      const sellResponse = await this.freyaClient.sellToken(
        position.tokenId,
        position.amount,
        this.config.slippageTolerance
      );
      
      if (sellResponse.ok) {
        const profitPercent = ((currentPrice - position.buyPrice) / position.buyPrice) * 100;
        
        console.log(`✅ Successfully sold ${position.symbol}`);
        console.log(`   Buy price: $${position.buyPrice}`);
        console.log(`   Sell price: $${currentPrice}`);
        console.log(`   Profit: ${profitPercent.toFixed(2)}%`);
        
        this.positions.delete(position.tokenId);
        return true;
      } else {
        console.log(`❌ Failed to sell ${position.symbol}: ${sellResponse.err}`);
        return false;
      }
    } catch (error) {
      console.error(`Error selling ${position.symbol}:`, error);
      return false;
    }
  }

  async checkPositions(): Promise<void> {
    for (const [tokenId, position] of this.positions) {
      try {
        const token = await this.apiClient.getToken(tokenId);
        const currentPrice = token.priceUsd;
        
        const profitPercent = ((currentPrice - position.buyPrice) / position.buyPrice) * 100;
        const holdTimeMinutes = (Date.now() - position.buyTimestamp) / (1000 * 60);
        
        console.log(`📊 ${position.symbol}: ${profitPercent.toFixed(2)}% (held ${holdTimeMinutes.toFixed(0)}m)`);
        
        // Check profit target
        if (profitPercent >= this.config.profitTargetPercent) {
          await this.executeSell(position, currentPrice, `Profit target reached: ${profitPercent.toFixed(2)}%`);
          continue;
        }
        
        // Check stop loss
        if (profitPercent <= -this.config.stopLossPercent) {
          await this.executeSell(position, currentPrice, `Stop loss triggered: ${profitPercent.toFixed(2)}%`);
          continue;
        }
        
        // Time-based exit (hold for max 2 hours)
        if (holdTimeMinutes > 120) {
          await this.executeSell(position, currentPrice, `Time-based exit: held for ${holdTimeMinutes.toFixed(0)} minutes`);
          continue;
        }
        
      } catch (error) {
        console.error(`Error checking position for ${position.symbol}:`, error);
      }
    }
  }

  async runTradingCycle(): Promise<void> {
    console.log('\n=== Trading Cycle ===');
    
    // Check existing positions first
    if (this.positions.size > 0) {
      console.log(`Checking ${this.positions.size} existing positions...`);
      await this.checkPositions();
    }
    
    // Look for new opportunities if we have room for more positions
    const maxPositions = 3;
    if (this.positions.size < maxPositions) {
      console.log('Looking for new trading opportunities...');
      const opportunities = await this.findTradingOpportunities();
      
      if (opportunities.length > 0) {
        console.log(`Found ${opportunities.length} opportunities:`);
        for (const token of opportunities) {
          console.log(`- ${token.symbol}: $${token.priceUsd} (${token.bondingCurveProgress}% bonding curve, ${token.volumeUsd24h} vol)`);
        }
        
        // Execute buy for the best opportunity
        const bestOpportunity = opportunities[0];
        await this.executeBuy(bestOpportunity);
      } else {
        console.log('No suitable trading opportunities found');
      }
    } else {
      console.log('Maximum positions reached, not looking for new opportunities');
    }
    
    console.log(`Current positions: ${this.positions.size}/${maxPositions}`);
  }

  async start(intervalSeconds: number = 30): Promise<void> {
    this.isRunning = true;
    console.log(`Starting trading bot (${intervalSeconds}s intervals)...`);
    
    while (this.isRunning) {
      try {
        await this.runTradingCycle();
        console.log(`Next cycle in ${intervalSeconds} seconds...\n`);
        await Helpers.sleep(intervalSeconds * 1000);
      } catch (error) {
        console.error('Trading cycle error:', error);
        await Helpers.sleep(intervalSeconds * 1000);
      }
    }
  }

  stop(): void {
    this.isRunning = false;
    console.log('Trading bot stopped');
  }
}

async function main() {
  // Load or generate identity
  let identity: Ed25519KeyIdentity;
  if (process.env.IDENTITY_JSON) {
    identity = Ed25519KeyIdentity.fromJSON(process.env.IDENTITY_JSON);
    console.log('Loaded existing identity');
  } else {
    identity = Ed25519KeyIdentity.generate();
    console.log('Generated new identity. Save this to reuse:');
    console.log(identity.toJSON());
  }
  
  // Trading configuration
  const config: TradingConfig = {
    maxBuyAmountBTC: 0.005, // Max 0.005 BTC per trade
    minMarketCapUSD: 10000,  // Min $10k market cap
    maxMarketCapUSD: 100000, // Max $100k market cap
    minVolumeUSD: 1000,      // Min $1k daily volume
    minBondingCurveProgress: 10, // Min 10% bonding curve progress
    profitTargetPercent: 15,     // 15% profit target
    stopLossPercent: 10,         // 10% stop loss
    slippageTolerance: 2.0       // 2% slippage tolerance
  };
  
  const bot = new TradingBot(identity, config);
  
  try {
    await bot.initialize();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      bot.stop();
      process.exit(0);
    });
    
    await bot.start(30); // Run every 30 seconds
  } catch (error) {
    console.error('Bot error:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}