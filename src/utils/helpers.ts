export class Helpers {
  static convertToBTC(satoshis: bigint): number {
    return Number(satoshis) / 1000;
  }

  static convertToSatoshis(btc: number): bigint {
    return BigInt(Math.floor(btc * 1000));
  }

  static convertToTokenAmount(amount: bigint): number {
    return Number(amount) / 100_000_000_000;
  }

  static convertFromTokenAmount(amount: number): bigint {
    return BigInt(Math.floor(amount * 100_000_000_000));
  }

  static calculatePercentDifference(original: number, newValue: number): number {
    if (original === 0) return 0;
    return ((newValue - original) / original) * 100;
  }

  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  static getCurrentTimestampSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }
}