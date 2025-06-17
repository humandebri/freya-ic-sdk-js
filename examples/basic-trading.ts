import { FreyaClient, OdinFunAPI, Ed25519KeyIdentity, Helpers } from '../src';

async function basicTradingExample() {
  console.log('=== Basic Trading Example ===');
  
  // Generate or load identity
  const identity = Ed25519KeyIdentity.generate();
  console.log('Identity Principal:', identity.getPrincipal().toString());
  
  // Initialize clients
  const freyaClient = new FreyaClient(identity);
  const apiClient = new OdinFunAPI();
  apiClient.setIdentity(identity);
  
  try {
    // Register and authenticate
    console.log('Registering identity...');
    await apiClient.registerIdentity();
    
    console.log('Authenticating...');
    await apiClient.authenticate();
    
    // Get deposit address
    console.log('Getting deposit address...');
    const depositAddress = await freyaClient.getMyDepositAddress();
    console.log('Deposit Address:', depositAddress);
    
    // Get available tokens
    console.log('Fetching available tokens...');
    const tokens = await apiClient.getTokens(5);
    console.log('Available tokens:', tokens.map(t => ({ symbol: t.symbol, name: t.name, price: t.priceUsd })));
    
    if (tokens.length > 0) {
      const token = tokens[0];
      console.log(`\nSelected token: ${token.symbol} (${token.name})`);
      console.log(`Current price: $${token.priceUsd}`);
      console.log(`Market cap: $${token.marketCapUsd}`);
      
      // Check balance
      const balance = await freyaClient.getMyBalance(token.id);
      console.log(`Current balance: ${Helpers.convertToTokenAmount(balance)} ${token.symbol}`);
      
      // Simulate a small buy order (0.001 BTC)
      const buyAmount = Helpers.convertToSatoshis(0.001);
      console.log(`\nSimulating buy order: ${Helpers.convertToBTC(buyAmount)} BTC`);
      
      // Note: Uncomment the following lines to execute actual trades
      /*
      const buyResponse = await freyaClient.buyToken(token.id, buyAmount, 1.0);
      if (buyResponse.ok) {
        console.log('Buy order successful!');
        
        // Check new balance
        const newBalance = await freyaClient.getMyBalance(token.id);
        console.log(`New balance: ${Helpers.convertToTokenAmount(newBalance)} ${token.symbol}`);
      } else {
        console.log('Buy order failed:', buyResponse.err);
      }
      */
      
      // Get token details from canister
      const tokenDetails = await freyaClient.getToken(token.id);
      if (tokenDetails) {
        console.log('\nToken details from canister:');
        console.log(`Current supply: ${Helpers.convertToTokenAmount(tokenDetails.currentSupply)}`);
        console.log(`Max supply: ${Helpers.convertToTokenAmount(tokenDetails.maxSupply)}`);
        console.log(`Creator: ${tokenDetails.creator?.toString()}`);
        
        if (tokenDetails.bondingCurveSettings) {
          const bcs = tokenDetails.bondingCurveSettings;
          console.log(`Virtual BTC in pool: ${Helpers.convertToBTC(bcs.virtualBtcInPool)} BTC`);
          console.log(`Virtual tokens in pool: ${Helpers.convertToTokenAmount(bcs.virtualTokensInPool)}`);
          console.log(`Sold tokens: ${Helpers.convertToTokenAmount(bcs.soldTokens)}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  basicTradingExample().catch(console.error);
}