import bs58 from 'bs58';
import { Principal } from '@dfinity/principal';

export class Base58Encoder {
  static encode(data: Uint8Array): string {
    return bs58.encode(data);
  }

  static decode(encoded: string): Uint8Array {
    return bs58.decode(encoded);
  }
}

export class DataEncoder {
  static encodeText(text: string): Uint8Array {
    return new TextEncoder().encode(text);
  }

  static decodeText(data: Uint8Array): string {
    return new TextDecoder().decode(data);
  }

  static hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static principalToText(principal: Principal): string {
    return principal.toText();
  }

  static textToPrincipal(text: string): Principal {
    return Principal.fromText(text);
  }
}