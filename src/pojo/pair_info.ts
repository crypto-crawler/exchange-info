/* eslint-disable camelcase */
import { SupportedExchange } from '../exchange/supported_exchange';

export interface PairInfo {
  exchange: SupportedExchange;
  raw_pair: string;
  normalized_pair: string;
  price_precision: number;
  base_precision: number;
  quote_precision: number;
  min_quote_quantity?: number;
  min_base_quantity?: number;
  base_contract?: string; // dex only
  quote_contract?: string; // dex only
  spot_enabled?: boolean;
  futures_enabled?: boolean;
  swap_enabled?: boolean;
  deposit_enabled?: boolean;
  withdraw_enabled?: boolean;
  [key: string]: any;
}

// eslint-disable-next-line import/prefer-default-export
export function convertArrayToMap(arr: PairInfo[]): { [key: string]: PairInfo } {
  const map: { [key: string]: PairInfo } = {};
  arr.forEach(p => {
    map[p.normalized_pair] = p;
  });
  return map;
}

export interface BitfinexPairInfo extends PairInfo {
  pair: string;
  initial_margin: string;
  minimum_margin: string;
  maximum_order_size: string;
  minimum_order_size: string;
  expiration: string;
  margin: boolean;
}

export interface NewdexPairInfo extends PairInfo {
  pair_id: number;
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
  pair_fee: number;
}

export interface WhaleExPairInfo extends PairInfo {
  name: string;
  baseCurrency: string;
  basePrecision: number;
  quoteCurrency: string;
  quotePrecision: number;
  precision: number;
  enable: boolean;
  status: 'ON' | 'OFF';
  baseContract: string;
  tickSize: string;
  lotSize: string;
  minQty: string;
  minNotional: string;
}

export interface BinancePairInfo extends PairInfo {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  filters: Array<{ filterType: string; [key: string]: any }>;
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

export interface PoloniexPairInfo extends PairInfo {
  id: number;
  last: string;
  lowestAsk: string;
  highestBid: string;
  percentChange: string;
  baseVolume: string;
  quoteVolume: string;
  isFrozen: string;
  high24hr: string;
  low24hr: string;
}

export interface UpbitPairInfo extends PairInfo {
  market: string;
  korean_name: string;
  english_name: string;
}

export interface ZaifPairInfo extends PairInfo {
  aux_unit_point: number;
  item_japanese: '\u30d3\u30c3\u30c8\u30b3\u30a4\u30f3';
  aux_unit_step: number;
  description: string;
  item_unit_min: number;
  event_number: number;
  currency_pair: string;
  is_token: boolean;
  aux_unit_min: number;
  aux_japanese: string;
  id: number;
  item_unit_step: number;
  name: string;
  seq: number;
  title: string;
}

export interface ZBPairInfo extends PairInfo {
  amountScale: number;
  priceScale: number;
}

export interface BikiPairInfo extends PairInfo {
  symbol: string;
  count_coin: string;
  amount_precision: number;
  base_coin: string;
  limit_volume_min: string;
}

export interface KrakenPairInfo extends PairInfo {
  altname: string;
  wsname: string;
  aclass_base: string;
  base: string;
  aclass_quote: string;
  quote: string;
  lot: string;
  pair_decimals: number;
  lot_decimals: number;
  lot_multiplier: number;
  fees: number[][];
  fees_maker: number[][];
  fee_volume_currency: string;
  margin_call: number;
  margin_stop: number;
}
