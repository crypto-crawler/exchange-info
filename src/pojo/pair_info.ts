/* eslint-disable camelcase */
export interface PairInfo {
  raw_pair: string;
  normalized_pair: string;
  [key: string]: any;
}

export interface NewdexPairInfo extends PairInfo {
  pair_id: number;
  price_precision: number;
  status: number;
  base_symbol: {
    contract: string;
    sym: string;
  };
  quote_symbol: {
    contract: string;
    sym: string;
  };
  manager: string;
  list_time: string;
  pair_symbol: string;
  current_price: string;
  pair_fee: 0;
}

export interface WhaleExPairInfo extends PairInfo {
  name: string;
  baseCurrency: string;
  basePrecision: number;
  quoteCurrency: string;
  quotePrecision: number;
  baseVolume: string;
  priceChangePercent: string;
  enable: boolean;
  baseContract: string;
}

export interface BinancePairInfo extends PairInfo {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
}

export interface BitstampPairInfo extends PairInfo {
  base_decimals: number;
  minimum_order: string;
  name: string;
  counter_decimals: number;
  trading: string;
  url_symbol: string;
  description: string;
}
