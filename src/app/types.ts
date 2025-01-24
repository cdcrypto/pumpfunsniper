export interface TokenData {
  mint: string;
  traderPublicKey: string;
  timestamp?: string;
}

export interface TokenMessage {
  type: string;
  data: TokenData;
}
