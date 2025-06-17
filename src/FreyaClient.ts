import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import {
  Token,
  TradeRequest,
  TradeResponse,
  WithdrawRequest,
  WithdrawResponse,
  AddRequest,
  AddResponse,
  MintRequest,
  MintResponse,
  EtchRequest,
  EtchResponse,
  ExternalMintRequest,
  LiquidityRequest,
  LiquidityResponse,
  LiquiditySwap,
  TokenDeltas,
  OperationAndId,
  TradeType,
  LiquidityType
} from './models';
import { Helpers } from './utils/helpers';

// Candid interface definition for the Freya canister
const idlFactory = ({ IDL }: { IDL: any }) => {
  // Define all the types according to the canister interface
  const TradeType = IDL.Variant({
    'Buy': IDL.Null,
    'Sell': IDL.Null,
  });

  const TradeAmount = IDL.Record({
    'btcAmount': IDL.Opt(IDL.Nat),
    'tokenAmount': IDL.Opt(IDL.Nat),
  });

  const TradeSettings = IDL.Record({
    'slippageTolerance': IDL.Opt(IDL.Float32),
    'maxGasAmount': IDL.Opt(IDL.Nat),
  });

  const TradeRequest = IDL.Record({
    'tokenId': IDL.Text,
    'tradeType': TradeType,
    'amount': TradeAmount,
    'tradeSettings': IDL.Opt(TradeSettings),
  });

  const TradeResponse = IDL.Variant({
    'ok': IDL.Bool,
    'err': IDL.Text,
  });

  const WithdrawProtocol = IDL.Variant({
    'btc': IDL.Record({ 'destinationAddress': IDL.Text }),
  });

  const WithdrawRequest = IDL.Record({
    'protocol': WithdrawProtocol,
    'amount': IDL.Nat,
    'tokenId': IDL.Opt(IDL.Text),
  });

  const WithdrawResponse = IDL.Variant({
    'ok': IDL.Text,
    'err': IDL.Text,
  });

  const BondingCurveSettings = IDL.Record({
    'virtualBtcInPool': IDL.Nat,
    'virtualTokensInPool': IDL.Nat,
    'preCutAllocation': IDL.Nat,
    'preCutPrice': IDL.Nat,
    'preCutPoolBTC': IDL.Nat,
    'soldTokens': IDL.Nat,
    'reservedBTCForCut': IDL.Nat,
    'poolFeeTier': IDL.Nat32,
  });

  const MetadataRecord = IDL.Record({
    'key': IDL.Text,
    'value': IDL.Text,
  });

  const Metadata = IDL.Record({
    'description': IDL.Opt(IDL.Text),
    'image': IDL.Opt(IDL.Text),
    'name': IDL.Opt(IDL.Text),
    'symbol': IDL.Opt(IDL.Text),
    'baseAsset': IDL.Opt(IDL.Text),
    'website': IDL.Opt(IDL.Text),
    'X': IDL.Opt(IDL.Text),
    'telegram': IDL.Opt(IDL.Text),
    'whitepaper': IDL.Opt(IDL.Text),
    'discord': IDL.Opt(IDL.Text),
    'totalSupply': IDL.Opt(IDL.Nat),
    'properties': IDL.Opt(IDL.Vec(MetadataRecord)),
  });

  const Rune = IDL.Record({
    'id': IDL.Opt(IDL.Tuple(IDL.Nat32, IDL.Nat32)),
    'name': IDL.Opt(IDL.Text),
  });

  const LiquidityPool = IDL.Record({
    'lpTokenId': IDL.Opt(IDL.Text),
    'currentLiquidity': IDL.Opt(IDL.Nat),
    'lockedLiquidity': IDL.Opt(IDL.Nat),
  });

  const LockedTokenState = IDL.Record({
    'totalLockedTokens': IDL.Nat,
    'availableFromBlock': IDL.Opt(IDL.Nat),
    'unlockWindowDurationBlocks': IDL.Opt(IDL.Nat),
  });

  const Token = IDL.Record({
    'id': IDL.Text,
    'bondingCurveSettings': IDL.Opt(BondingCurveSettings),
    'creator': IDL.Opt(IDL.Principal),
    'currentSupply': IDL.Nat,
    'lockedState': IDL.Opt(LockedTokenState),
    'maxSupply': IDL.Nat,
    'supplyForLiquidityPool': IDL.Opt(IDL.Nat),
    'metadata': IDL.Opt(Metadata),
    'liquidityPool': IDL.Opt(LiquidityPool),
    'btcAddress': IDL.Opt(IDL.Text),
    'rune': IDL.Opt(Rune),
    'icrcCanister': IDL.Opt(IDL.Principal),
  });

  const AddRequest = IDL.Record({
    'nonce': IDL.Nat,
    'name': IDL.Text,
    'symbol': IDL.Text,
    'description': IDL.Opt(IDL.Text),
    'decimals': IDL.Nat8,
    'totalSupply': IDL.Nat,
    'logo': IDL.Opt(IDL.Text),
    'website': IDL.Opt(IDL.Text),
    'x': IDL.Opt(IDL.Text),
    'telegram': IDL.Opt(IDL.Text),
    'discord': IDL.Opt(IDL.Text),
  });

  const AddResponse = IDL.Variant({
    'ok': IDL.Text,
    'err': IDL.Text,
  });

  const MintRequest = IDL.Record({
    'tokenId': IDL.Text,
    'amount': IDL.Nat,
    'to': IDL.Principal,
  });

  const MintResponse = IDL.Variant({
    'ok': IDL.Nat,
    'err': IDL.Text,
  });

  const EtchRequest = IDL.Record({
    'tokenId': IDL.Text,
    'rune': Rune,
  });

  const EtchResponse = IDL.Variant({
    'ok': IDL.Bool,
    'err': IDL.Text,
  });

  const ExternalMintRequest = IDL.Record({
    'tokenId': IDL.Text,
    'amount': IDL.Nat,
    'to': IDL.Principal,
  });

  const LiquidityType = IDL.Variant({
    'Add': IDL.Null,
    'Remove': IDL.Null,
  });

  const LiquidityRequest = IDL.Record({
    'tokenId': IDL.Text,
    'liquidityType': LiquidityType,
    'amount': IDL.Nat,
  });

  const LiquidityResponse = IDL.Variant({
    'ok': IDL.Bool,
    'err': IDL.Text,
  });

  const LiquiditySwap = IDL.Record({
    'tokenAId': IDL.Text,
    'tokenAAmount': IDL.Nat,
    'tokenBId': IDL.Text,
    'tokenBMinAmount': IDL.Nat,
  });

  const TokenDeltas = IDL.Vec(IDL.Tuple(IDL.Text, IDL.Int));

  const OperationType = IDL.Variant({
    'Access': IDL.Null,
    'Mint': IDL.Null,
    'Other': IDL.Null,
    'Token': IDL.Null,
    'Trade': IDL.Null,
    'Transaction': IDL.Null,
  });

  const Operation = IDL.Record({
    'operationType': OperationType,
    'createdAt': IDL.Nat,
    'details': IDL.Reserved,
  });

  const OperationAndId = IDL.Record({
    'id': IDL.Nat,
    'operation': Operation,
  });

  return IDL.Service({
    'token_trade': IDL.Func([TradeRequest], [TradeResponse], []),
    'token_withdraw': IDL.Func([WithdrawRequest], [WithdrawResponse], []),
    'get_token': IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(Token)], ['query']),
    'get_balance': IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], ['query']),
    'get_locked_tokens': IDL.Func([IDL.Text], [LockedTokenState], ['query']),
    'get_operation': IDL.Func([IDL.Text, IDL.Nat], [IDL.Opt(Operation)], ['query']),
    'get_operations': IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(OperationAndId)], ['query']),
    'get_stats': IDL.Func([IDL.Text], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))], ['query']),
    'get_token_index': IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'get_deposit_address': IDL.Func([IDL.Principal], [IDL.Text], ['query']),
    'token_add': IDL.Func([AddRequest], [AddResponse], []),
    'token_mint': IDL.Func([MintRequest], [MintResponse], []),
    'token_etch': IDL.Func([EtchRequest], [EtchResponse], []),
    'external_mint': IDL.Func([ExternalMintRequest], [MintResponse], []),
    'token_liquidity': IDL.Func([LiquidityRequest], [LiquidityResponse], []),
    'token_deposit': IDL.Func([IDL.Text, IDL.Nat], [IDL.Nat], []),
    'swap_pooled': IDL.Func([LiquiditySwap], [TokenDeltas], []),
  });
};

export class FreyaClient {
  private actor: any;
  private agent: HttpAgent;
  private canisterId: string;
  private identity: Identity;

  constructor(
    identity: Identity,
    canisterId: string = 'z2vm5-gaaaa-aaaaj-azw6q-cai',
    host: string = 'https://icp0.io'
  ) {
    this.identity = identity;
    this.canisterId = canisterId;
    this.agent = new HttpAgent({
      host,
      identity,
    });

    // Only fetch root key in local development
    if (host.includes('localhost')) {
      this.agent.fetchRootKey();
    }

    this.actor = Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId: this.canisterId,
    });
  }

  // Trading methods
  async trade(request: TradeRequest): Promise<TradeResponse> {
    return await this.actor.token_trade(request);
  }

  async buyToken(tokenId: string, btcAmount: bigint, slippageTolerance?: number): Promise<TradeResponse> {
    const request: TradeRequest = {
      tokenId,
      tradeType: TradeType.Buy,
      amount: { btcAmount },
      tradeSettings: slippageTolerance ? { slippageTolerance } : undefined,
    };
    return await this.trade(request);
  }

  async sellToken(tokenId: string, tokenAmount: bigint, slippageTolerance?: number): Promise<TradeResponse> {
    const request: TradeRequest = {
      tokenId,
      tradeType: TradeType.Sell,
      amount: { tokenAmount },
      tradeSettings: slippageTolerance ? { slippageTolerance } : undefined,
    };
    return await this.trade(request);
  }

  // Withdrawal methods
  async withdraw(request: WithdrawRequest): Promise<WithdrawResponse> {
    return await this.actor.token_withdraw(request);
  }

  async withdrawBTC(destinationAddress: string, amount: bigint, tokenId?: string): Promise<WithdrawResponse> {
    const request: WithdrawRequest = {
      protocol: { btc: { destinationAddress } },
      amount,
      tokenId,
    };
    return await this.withdraw(request);
  }

  // Query methods
  async getToken(user: string, tokenId: string): Promise<Token | undefined> {
    const result = await this.actor.get_token(user, tokenId);
    return result.length > 0 ? result[0] : undefined;
  }

  async getBalance(user: string, tokenOwner: string, tokenId: string): Promise<bigint> {
    return await this.actor.get_balance(user, tokenOwner, tokenId);
  }

  async getLockedTokens(user: string): Promise<LockedTokenState> {
    return await this.actor.get_locked_tokens(user);
  }

  async getOperation(user: string, operationId: bigint): Promise<Operation | undefined> {
    const result = await this.actor.get_operation(user, operationId);
    return result.length > 0 ? result[0] : undefined;
  }

  async getOperations(fromId: bigint, toId: bigint): Promise<OperationAndId[]> {
    return await this.actor.get_operations(fromId, toId);
  }

  async getStats(user: string): Promise<Record<string, string>> {
    const result = await this.actor.get_stats(user);
    const stats: Record<string, string> = {};
    for (const [key, value] of result) {
      stats[key] = value;
    }
    return stats;
  }

  async getTokenIndex(tokenId: string): Promise<bigint> {
    return await this.actor.get_token_index(tokenId);
  }

  async getMyBalance(tokenId: string): Promise<bigint> {
    const principal = await this.agent.getPrincipal();
    const user = principal.toString();
    return await this.getBalance(user, user, tokenId);
  }

  async getDepositAddress(principal: Principal): Promise<string> {
    return await this.actor.get_deposit_address(principal);
  }

  async getMyDepositAddress(): Promise<string> {
    const principal = await this.agent.getPrincipal();
    return await this.getDepositAddress(principal);
  }

  // Token management methods
  async add(request: AddRequest): Promise<AddResponse> {
    return await this.actor.token_add(request);
  }

  async mint(request: MintRequest): Promise<MintResponse> {
    return await this.actor.token_mint(request);
  }

  async etch(request: EtchRequest): Promise<EtchResponse> {
    return await this.actor.token_etch(request);
  }

  async externalMint(request: ExternalMintRequest): Promise<MintResponse> {
    return await this.actor.external_mint(request);
  }

  async tokenDeposit(tokenId: string, amount: bigint): Promise<bigint> {
    return await this.actor.token_deposit(tokenId, amount);
  }

  // Liquidity methods
  async liquidity(request: LiquidityRequest): Promise<LiquidityResponse> {
    return await this.actor.token_liquidity(request);
  }

  async addLiquidity(tokenId: string, amount: bigint): Promise<LiquidityResponse> {
    const request: LiquidityRequest = {
      tokenId,
      liquidityType: LiquidityType.Add,
      amount,
    };
    return await this.liquidity(request);
  }

  async removeLiquidity(tokenId: string, amount: bigint): Promise<LiquidityResponse> {
    const request: LiquidityRequest = {
      tokenId,
      liquidityType: LiquidityType.Remove,
      amount,
    };
    return await this.liquidity(request);
  }

  async swapPooled(swap: LiquiditySwap): Promise<TokenDeltas> {
    const result = await this.actor.swap_pooled(swap);
    // Convert array of tuples to object
    const deltas: TokenDeltas = {};
    for (const [tokenId, amount] of result) {
      deltas[tokenId] = amount;
    }
    return deltas;
  

  // Utility methods
  static convertToBTC = Helpers.convertToBTC;
  static convertToSatoshis = Helpers.convertToSatoshis;
  static convertToTokenAmount = Helpers.convertToTokenAmount;
  static convertFromTokenAmount = Helpers.convertFromTokenAmount;
  static calculatePercentDifference = Helpers.calculatePercentDifference;
}