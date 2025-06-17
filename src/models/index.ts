import { Principal } from '@dfinity/principal';

export interface BondingCurveSettings {
  virtualBtcInPool: bigint;
  virtualTokensInPool: bigint;
  preCutAllocation: bigint;
  preCutPrice: bigint;
  preCutPoolBTC: bigint;
  soldTokens: bigint;
  reservedBTCForCut: bigint;
  poolFeeTier: number;
}

export interface MetadataRecord {
  key: string;
  value: string;
}

export interface Metadata {
  description?: string;
  image?: string;
  name?: string;
  symbol?: string;
  baseAsset?: string;
  website?: string;
  X?: string;
  telegram?: string;
  whitepaper?: string;
  discord?: string;
  totalSupply?: bigint;
  properties?: MetadataRecord[];
}

export interface Rune {
  id?: [number, number];
  name?: string;
}

export interface LiquidityPool {
  lpTokenId?: string;
  currentLiquidity?: bigint;
  lockedLiquidity?: bigint;
}

export interface Token {
  id: string;
  bondingCurveSettings?: BondingCurveSettings;
  creator?: Principal;
  currentSupply: bigint;
  lockedState?: LockedTokenState;
  maxSupply: bigint;
  supplyForLiquidityPool?: bigint;
  metadata?: Metadata;
  liquidityPool?: LiquidityPool;
  btcAddress?: string;
  rune?: Rune;
  icrcCanister?: Principal;
}

export interface LockedTokenState {
  totalLockedTokens: bigint;
  availableFromBlock?: bigint;
  unlockWindowDurationBlocks?: bigint;
}

export interface TradeAmount {
  btcAmount?: bigint;
  tokenAmount?: bigint;
}

export interface TradeSettings {
  slippageTolerance?: number;
  maxGasAmount?: bigint;
}

export enum TradeType {
  Buy = 'Buy',
  Sell = 'Sell'
}

export interface TradeRequest {
  tokenId: string;
  tradeType: TradeType;
  amount: TradeAmount;
  tradeSettings?: TradeSettings;
}

export interface TradeResponse {
  ok?: boolean;
  err?: string;
}

export interface WithdrawProtocol {
  btc?: { destinationAddress: string };
}

export interface WithdrawRequest {
  protocol: WithdrawProtocol;
  amount: bigint;
  tokenId?: string;
}

export interface WithdrawResponse {
  ok?: string;
  err?: string;
}

export interface AddRequest {
  nonce: bigint;
  name: string;
  symbol: string;
  description?: string;
  decimals: number;
  totalSupply: bigint;
  logo?: string;
  website?: string;
  x?: string;
  telegram?: string;
  discord?: string;
}

export interface AddResponse {
  ok?: string;
  err?: string;
}

export interface MintRequest {
  tokenId: string;
  amount: bigint;
  to: Principal;
}

export interface MintResponse {
  ok?: bigint;
  err?: string;
}

export interface EtchRequest {
  tokenId: string;
  rune: Rune;
}

export interface EtchResponse {
  ok?: boolean;
  err?: string;
}

export interface ExternalMintRequest {
  tokenId: string;
  amount: bigint;
  to: Principal;
}

export enum LiquidityType {
  Add = 'Add',
  Remove = 'Remove'
}

export interface LiquidityRequest {
  tokenId: string;
  liquidityType: LiquidityType;
  amount: bigint;
}

export interface LiquidityResponse {
  ok?: boolean;
  err?: string;
}

export interface LiquiditySwap {
  tokenAId: string;
  tokenAAmount: bigint;
  tokenBId: string;
  tokenBMinAmount: bigint;
}

export interface TokenDeltas {
  [tokenId: string]: bigint;
}

export enum OperationType {
  Access = 'Access',
  Mint = 'Mint',
  Other = 'Other',
  Token = 'Token',
  Trade = 'Trade',
  Transaction = 'Transaction'
}

export interface Operation {
  operationType: OperationType;
  createdAt: bigint;
  details: any;
}

export interface OperationAndId {
  id: bigint;
  operation: Operation;
}

// JSON API Models
export interface AuthRequest {
  publicKey: string;
  signature: string;
  timestamp: string;
  referrer: string;
}

export interface AuthToken {
  token: string;
}

export interface BTCInfo {
  priceUsd: number;
}

export interface OdinUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  principal: string;
  publicKey: string;
  btcAddress: string;
  btcPubKey: string;
  btcAddressExplicit?: string;
  userName?: string;
  isCreator: boolean;
  profileUrl?: string;
  referredBy?: string;
  totalProfitUsd?: number;
  totalBuyVolume: number;
  totalSellVolume: number;
  totalReferrals: number;
  totalRewards: number;
  rank?: number;
}

export interface TokenTarget {
  description?: string;
  id: string;
  isGraduated: boolean;
  isHot: boolean;
  isOfficial: boolean;
  totalSupply: string;
  symbol: string;
  name: string;
  creator: string;
  createdAt: Date;
  image: string;
  marketCapUsd: number;
  volumeUsd24h: number;
  priceUsd: number;
  priceBtc: string;
  tradingStartAt: Date;
  txCount: number;
  holderCount: number;
  change24h: number;
  high24h: number;
  low24h: number;
  runeId?: string;
  runeName?: string;
  btcAddress?: string;
  reservedBtcForLP?: string;
  website?: string;
  x?: string;
  telegram?: string;
  discord?: string;
  baseAsset?: string;
  whitepaper?: string;
}

export interface OdinFunToken extends TokenTarget {
  volume5m: number;
  volume1h: number;
  userCount: number;
  pooledTokens: string;
  pooledBtc: string;
  liquidityTotalUsd: number;
  bondingCurveProgress: number;
  currentSupply: string;
  comments: number;
  virtualBtcInPool: string;
  virtualTokensInPool: string;
  totalReplies: number;
  recentCommentorImageUrls: string[];
}

export interface TokenTrades {
  id: string;
  amount: string;
  priceBtc: string;
  priceUsd: number;
  createdAt: Date;
  tradeType: string;
  userName: string;
  profileUrl?: string;
  volumeUsd: number;
  volumeBtc: string;
}

export interface UserBalance {
  tokenId: string;
  amount: string;
  percentOwnership: number;
  name: string;
  symbol: string;
  image: string;
  marketCapUsd: number;
  totalProfitUsd: number;
  unrealizedProfitUsd: number;
  realizedProfitUsd: number;
  totalCostBasis: number;
  totalRevenue: number;
  totalValueUsd: number;
}

export interface Holders {
  principal: string;
  btcAddress: string;
  amount: string;
  percentOwnership: number;
  rank: number;
  userName?: string;
  profileUrl?: string;
}

export interface CommentRequest {
  content: string;
  parentId?: string;
  tokenId?: string;
}