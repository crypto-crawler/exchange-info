import { ExchangeInfo } from './pojo/exchange_info';
import * as Biki from './exchange/biki';
import * as Binance from './exchange/binance';
import * as Bitfinex from './exchange/bitfinex';
import * as Bitstamp from './exchange/bitstamp';
import * as BitFlyer from './exchange/bitflyer';
import * as Coinbase from './exchange/coinbase';
import * as Coincheck from './exchange/coincheck';
import * as Huobi from './exchange/huobi';
import * as Kraken from './exchange/kraken';
import * as MXC from './exchange/mxc';
import * as Newdex from './exchange/newdex';
import * as OKExSpot from './exchange/okex_spot';
import * as Poloniex from './exchange/poloniex';
import * as Upbit from './exchange/upbit';
import * as WhaleEx from './exchange/whaleex';
import * as Zaif from './exchange/zaif';
import * as ZB from './exchange/zb';

export * from './pojo/pair_info';
export { ExchangeInfo } from './pojo/exchange_info';

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

/**
 * Get all informaton about a crypto exchange.
 *
 * @param exchangeName The name of the exchange
 */
export default async function getExchangeInfo(
  exchangeName: SupportedExchange,
): Promise<ExchangeInfo> {
  try {
    switch (exchangeName) {
      case 'Biki':
        return Biki.getExchangeInfo();
      case 'Binance':
        return Binance.getExchangeInfo();
      case 'Bitfinex':
        return Bitfinex.getExchangeInfo();
      case 'Bitstamp':
        return Bitstamp.getExchangeInfo();
      case 'Coinbase':
        return Coinbase.getExchangeInfo();
      case 'Coincheck':
        return Coincheck.getExchangeInfo();
      case 'Huobi':
        return Huobi.getExchangeInfo();
      case 'Kraken':
        return Kraken.getExchangeInfo();
      case 'MXC':
        return MXC.getExchangeInfo();
      case 'Newdex':
        return Newdex.getExchangeInfo();
      case 'OKEx_Spot':
        return OKExSpot.getExchangeInfo();
      case 'Poloniex':
        return Poloniex.getExchangeInfo();
      case 'Upbit':
        return Upbit.getExchangeInfo();
      case 'WhaleEx':
        return WhaleEx.getExchangeInfo();
      case 'Zaif':
        return Zaif.getExchangeInfo();
      case 'ZB':
        return ZB.getExchangeInfo();
      case 'bitFlyer':
        return BitFlyer.getExchangeInfo();
      default:
        throw new Error(`Unknown exchange: ${exchangeName}`);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e); // TODO: remove this after official release
    throw e;
  }
}
