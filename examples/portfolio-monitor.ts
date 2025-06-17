import { OdinFunAPI, Ed25519KeyIdentity, Helpers } from '../src';

async function portfolioMonitorExample() {
  console.log('=== Portfolio Monitor Example ===');
  
  // Load identity from environment or generate new one
  let identity: Ed25519KeyIdentity;
  if (process.env.IDENTITY_JSON) {
    identity = Ed25519KeyIdentity.fromJSON(process.env.IDENTITY_JSON);
    console.log('Loaded existing identity');
  } else {
    identity = Ed25519KeyIdentity.generate();
    console.log('Generated new identity');
    console.log('Export this identity to reuse:', identity.toJSON());
  }
  
  console.log('Principal:', identity.getPrincipal().toString());
  
  // Initialize API client
  const apiClient = new OdinFunAPI();
  apiClient.setIdentity(identity);
  
  try {
    // Authenticate
    console.log('Authenticating...');
    await apiClient.authenticate();
    
    // Get user profile
    console.log('Fetching user profile...');
    const user = await apiClient.getUser();
    console.log(`User: ${user.userName || 'Anonymous'}`);
    console.log(`BTC Address: ${user.btcAddress}`);
    console.log(`Total Profit: $${user.totalProfitUsd || 0}`);
    console.log(`Total Buy Volume: ${user.totalBuyVolume}`);
    console.log(`Total Sell Volume: ${user.totalSellVolume}`);
    
    // Get portfolio balances
    console.log('\nFetching portfolio...');
    const balances = await apiClient.getUserBalances();
    
    if (balances.length === 0) {
      console.log('No tokens in portfolio');
      return;
    }
    
    console.log('\n=== PORTFOLIO SUMMARY ===');
    let totalValueUsd = 0;
    let totalProfitUsd = 0;
    
    for (const balance of balances) {
      console.log(`\n${balance.symbol} (${balance.name})`);
      console.log(`  Amount: ${balance.amount}`);
      console.log(`  Ownership: ${balance.percentOwnership.toFixed(2)}%`);
      console.log(`  Market Cap: $${balance.marketCapUsd.toLocaleString()}`);
      console.log(`  Value: $${balance.totalValueUsd.toFixed(2)}`);
      console.log(`  Unrealized P/L: $${balance.unrealizedProfitUsd.toFixed(2)}`);
      console.log(`  Realized P/L: $${balance.realizedProfitUsd.toFixed(2)}`);
      console.log(`  Total P/L: $${balance.totalProfitUsd.toFixed(2)}`);
      
      totalValueUsd += balance.totalValueUsd;
      totalProfitUsd += balance.totalProfitUsd;
    }
    
    console.log('\n=== TOTALS ===');
    console.log(`Total Portfolio Value: $${totalValueUsd.toFixed(2)}`);
    console.log(`Total Profit/Loss: $${totalProfitUsd.toFixed(2)}`);
    console.log(`Total Return: ${totalValueUsd > 0 ? ((totalProfitUsd / (totalValueUsd - totalProfitUsd)) * 100).toFixed(2) : 0}%`);
    
    // Get recent trades
    console.log('\nFetching recent trades...');
    const recentTrades = await apiClient.getUserTrades(undefined, 10);
    
    if (recentTrades.length > 0) {
      console.log('\n=== RECENT TRADES ===');
      for (const trade of recentTrades) {
        const date = new Date(trade.createdAt).toLocaleDateString();
        console.log(`${date} - ${trade.tradeType} ${trade.volumeBtc} BTC worth of tokens ($${trade.volumeUsd.toFixed(2)})`);
      }
    }
    
    // Get BTC price for reference
    const btcInfo = await apiClient.getBTCPrice();
    console.log(`\nCurrent BTC Price: $${btcInfo.priceUsd}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Monitor portfolio continuously
async function continuousMonitor(intervalSeconds: number = 60) {
  console.log(`Starting continuous portfolio monitoring (every ${intervalSeconds} seconds)...`);
  
  while (true) {
    try {
      await portfolioMonitorExample();
      console.log(`\nNext update in ${intervalSeconds} seconds...\n`);
      await Helpers.sleep(intervalSeconds * 1000);
    } catch (error) {
      console.error('Monitor error:', error);
      await Helpers.sleep(intervalSeconds * 1000);
    }
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--continuous')) {
    const interval = parseInt(args[args.indexOf('--interval') + 1]) || 60;
    continuousMonitor(interval).catch(console.error);
  } else {
    portfolioMonitorExample().catch(console.error);
  }
}