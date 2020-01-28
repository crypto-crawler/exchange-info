export const SUPPORTED_EXCHANGES = [
  'Biki',
  'Binance',
  'Bitfinex',
  'Bitstamp',
  'Coinbase',
  'Coincheck',
  'Huobi',
  'Kraken',
  'MXC',
  'Newdex',
  'OKEx_Spot',
  'Poloniex',
  'Upbit',
  'WhaleEx',
  'Zaif',
  'ZB',
  'bitFlyer',
] as const;

export type SupportedExchange = typeof SUPPORTED_EXCHANGES[number];
