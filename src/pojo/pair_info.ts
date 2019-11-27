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

export interface CoinbasePairInfo extends PairInfo {
  id: string;
  base_currency: string;
  quote_currency: string;
  base_min_size: string;
  base_max_size: string;
  quote_increment: string;
  display_name: string;
  margin_enabled: boolean;
  status: string;
}

export interface HuobiPairInfo extends PairInfo {
  'base-currency': string;
  'quote-currency': string;
  'price-precision': number;
  'amount-precision': number;
  'symbol-partition': string;
  symbol: string;
  state: string;
  'value-precision': number;
  'min-order-amt': number;
  'max-order-amt': number;
  'min-order-value': number;
}

export interface OKExSpotPairInfo extends PairInfo {
  baseCurrency: number;
  brokerId: number;
  entityMarginStatus: number;
  entitySpotStatus: number;
  envType: number;
  groupId: number;
  id: number;
  isMarginOpen: boolean;
  listDisplay: number;
  marginRiskPreRatio: 1.2;
  marginRiskRatio: 1.1;
  marketFrom: number;
  matcherId: number;
  maxMarginLeverage: number;
  maxPriceDigit: number;
  maxSizeDigit: number;
  mergeTypes: string;
  minTradeSize: number;
  newTrade: boolean;
  oldTrade: boolean;
  online: number;
  productId: number;
  quoteCurrency: number;
  quoteIncrement: string;
  quotePrecision: number;
  sort: number;
  switchStatus: string;
  symbol: string;
  tradeStatus: number;
  tradingMode: number;
}
