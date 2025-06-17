import axios, { AxiosInstance } from 'axios';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import {
  AuthRequest,
  AuthToken,
  BTCInfo,
  OdinUser,
  OdinFunToken,
  TokenTarget,
  TokenTrades,
  UserBalance,
  Holders,
  CommentRequest
} from './models';
import { DataEncoder } from './utils/encoders';
import { Helpers } from './utils/helpers';

export class OdinFunAPI {
  private client: AxiosInstance;
  private authToken?: string;
  private identity?: Ed25519KeyIdentity;

  constructor(baseUrl: string = 'https://api.odin.fun/v1/') {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });
  }

  // Identity and Authentication
  setIdentity(identity: Ed25519KeyIdentity): void {
    this.identity = identity;
  }

  async registerIdentity(): Promise<void> {
    if (!this.identity) {
      throw new Error('Identity not set');
    }

    const publicKey = this.identity.getPublicKey().toRaw();
    const publicKeyHex = DataEncoder.bytesToHex(new Uint8Array(publicKey));

    await this.client.post('/auth/register', {
      publicKey: publicKeyHex,
    });
  }

  async authenticate(): Promise<void> {
    if (!this.identity) {
      throw new Error('Identity not set');
    }

    const timestamp = Helpers.getCurrentTimestampSeconds().toString();
    const messageBytes = DataEncoder.encodeText(timestamp);
    
    const signature = await this.identity.sign(messageBytes);
    const signatureHex = DataEncoder.bytesToHex(new Uint8Array(signature));
    
    const publicKey = this.identity.getPublicKey().toRaw();
    const publicKeyHex = DataEncoder.bytesToHex(new Uint8Array(publicKey));

    const authRequest = {
      publicKey: publicKeyHex,
      signature: signatureHex,
      timestamp,
      referrer: 'eei35ur6uj' // Fixed referrer value from C# version
    };

    const response = await this.client.post<AuthToken>('/auth/authenticate', authRequest);
    this.authToken = response.data.token;
  }

  async ensureAuthenticated(): Promise<void> {
    if (!this.authToken) {
      await this.authenticate();
    }
  }

  // User endpoints
  async getUser(userId?: string): Promise<OdinUser> {
    await this.ensureAuthenticated();
    const endpoint = userId ? `/users/${userId}` : '/users/me';
    const response = await this.client.get<OdinUser>(endpoint);
    return response.data;
  }

  async updateUser(updates: Partial<OdinUser>): Promise<OdinUser> {
    await this.ensureAuthenticated();
    const response = await this.client.patch<OdinUser>('/users/me', updates);
    return response.data;
  }

  async changeUsername(username: string): Promise<void> {
    await this.ensureAuthenticated();
    await this.client.post('/users/me/change-username', { username });
  }

  async getUserBalances(): Promise<UserBalance[]> {
    await this.ensureAuthenticated();
    const response = await this.client.get<UserBalance[]>('/users/me/balances');
    return response.data;
  }

  async getUserByPrincipal(principal: string): Promise<OdinUser> {
    const response = await this.client.get<OdinUser>(`/users/principal/${principal}`);
    return response.data;
  }

  async getUserByUsername(username: string): Promise<OdinUser> {
    const response = await this.client.get<OdinUser>(`/users/username/${username}`);
    return response.data;
  }

  async getUsersByProfitRange(days: number = 7, limit: number = 10, offset: number = 0): Promise<OdinUser[]> {
    const response = await this.client.get<OdinUser[]>('/users/profits', {
      params: { days, limit, offset },
    });
    return response.data;
  }

  // Token endpoints
  async getTokens(limit: number = 20, offset: number = 0): Promise<OdinFunToken[]> {
    const response = await this.client.get<OdinFunToken[]>('/tokens', {
      params: { limit, offset },
    });
    return response.data;
  }

  async getToken(tokenId: string): Promise<OdinFunToken> {
    const response = await this.client.get<OdinFunToken>(`/tokens/${tokenId}`);
    return response.data;
  }

  async getTokenHolders(tokenId: string, limit: number = 50, offset: number = 0): Promise<Holders[]> {
    const response = await this.client.get<Holders[]>(`/tokens/${tokenId}/holders`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async getTokenTrades(tokenId: string, limit: number = 50, offset: number = 0): Promise<TokenTrades[]> {
    const response = await this.client.get<TokenTrades[]>(`/tokens/${tokenId}/trades`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async searchTokens(query: string): Promise<TokenTarget[]> {
    const response = await this.client.get<TokenTarget[]>('/tokens/search', {
      params: { q: query },
    });
    return response.data;
  }

  async getTokensByMarketCap(limit: number = 10, offset: number = 0): Promise<OdinFunToken[]> {
    const response = await this.client.get<OdinFunToken[]>('/tokens/by-market-cap', {
      params: { limit, offset },
    });
    return response.data;
  }

  async getHotTokens(limit: number = 10): Promise<OdinFunToken[]> {
    const response = await this.client.get<OdinFunToken[]>('/tokens/hot', {
      params: { limit },
    });
    return response.data;
  }

  async getNewTokens(limit: number = 10): Promise<OdinFunToken[]> {
    const response = await this.client.get<OdinFunToken[]>('/tokens/new', {
      params: { limit },
    });
    return response.data;
  }

  async getGraduatedTokens(limit: number = 10, offset: number = 0): Promise<OdinFunToken[]> {
    const response = await this.client.get<OdinFunToken[]>('/tokens/graduated', {
      params: { limit, offset },
    });
    return response.data;
  }

  // Trading data endpoints
  async getRecentTrades(limit: number = 50): Promise<TokenTrades[]> {
    const response = await this.client.get<TokenTrades[]>('/trades/recent', {
      params: { limit },
    });
    return response.data;
  }

  async getUserTrades(userId?: string, limit: number = 50, offset: number = 0): Promise<TokenTrades[]> {
    await this.ensureAuthenticated();
    const endpoint = userId ? `/users/${userId}/trades` : '/users/me/trades';
    const response = await this.client.get<TokenTrades[]>(endpoint, {
      params: { limit, offset },
    });
    return response.data;
  }

  async getUserPortfolio(userId?: string): Promise<UserBalance[]> {
    const endpoint = userId ? `/users/${userId}/portfolio` : '/users/me/portfolio';
    const response = await this.client.get<UserBalance[]>(endpoint);
    return response.data;
  }

  // Comment endpoints
  async postComment(comment: CommentRequest): Promise<void> {
    await this.ensureAuthenticated();
    await this.client.post('/comments', comment);
  }

  async getTokenComments(tokenId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    const response = await this.client.get(`/tokens/${tokenId}/comments`, {
      params: { limit, offset },
    });
    return response.data;
  }

  // Market data endpoints
  async getBTCPrice(): Promise<BTCInfo> {
    const response = await this.client.get<BTCInfo>('/btc');
    return response.data;
  }

  async getStats(): Promise<any> {
    const response = await this.client.get('/stats');
    return response.data;
  }

  // Utility methods
  static generateIdentity(): Ed25519KeyIdentity {
    return Ed25519KeyIdentity.generate();
  }

  static identityFromSeed(seed: Uint8Array): Ed25519KeyIdentity {
    return Ed25519KeyIdentity.fromSeed(seed);
  }

  static identityFromPem(pem: string): Ed25519KeyIdentity {
    return Ed25519KeyIdentity.fromPem(pem);
  }

  static identityFromJSON(json: string): Ed25519KeyIdentity {
    return Ed25519KeyIdentity.fromJSON(json);
  }

  getPrincipal(): Principal | undefined {
    return this.identity?.getPrincipal();
  }

  getPublicKey(): Uint8Array | undefined {
    return this.identity ? new Uint8Array(this.identity.getPublicKey().toRaw()) : undefined;
  }

  exportIdentity(): string | undefined {
    return this.identity?.toJSON();
  }
}