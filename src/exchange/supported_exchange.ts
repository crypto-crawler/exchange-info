export const EXCHANGES = [
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

export type SupportedExchange = typeof EXCHANGES[number];
