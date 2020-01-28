import * as Biki from './exchange/biki';
import * as Binance from './exchange/binance';
import * as Bitfinex from './exchange/bitfinex';
import * as BitFlyer from './exchange/bitflyer';
import * as Bitstamp from './exchange/bitstamp';
import * as Coinbase from './exchange/coinbase';
import * as Coincheck from './exchange/coincheck';
import * as Huobi from './exchange/huobi';
import * as Kraken from './exchange/kraken';
import * as MXC from './exchange/mxc';
import * as Newdex from './exchange/newdex';
import * as OKExSpot from './exchange/okex_spot';
import * as Poloniex from './exchange/poloniex';
import { SupportedExchange } from './exchange/supported_exchange';
import * as Upbit from './exchange/upbit';
import * as WhaleEx from './exchange/whaleex';
import * as Zaif from './exchange/zaif';
import * as ZB from './exchange/zb';
import { ExchangeInfo } from './pojo/exchange_info';

export { SupportedExchange, SUPPORTED_EXCHANGES } from './exchange/supported_exchange';
export { ExchangeInfo } from './pojo/exchange_info';
export * from './pojo/pair_info';

/**
 * Get all informaton about a crypto exchange.
 *
 * @param exchangeName The name of the exchange
 * @param filter All, no filtering; Spot, only spot tradable pairs; Margin, only margin tradable pairs
 */
export default async function getExchangeInfo(
  exchangeName: SupportedExchange,
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
  try {
    switch (exchangeName) {
      case 'Biki':
        return Biki.getExchangeInfo(filter);
      case 'Binance':
        return Binance.getExchangeInfo(filter);
      case 'Bitfinex':
        return Bitfinex.getExchangeInfo(filter);
      case 'Bitstamp':
        return Bitstamp.getExchangeInfo(filter);
      case 'Coinbase':
        return Coinbase.getExchangeInfo(filter);
      case 'Coincheck':
        return Coincheck.getExchangeInfo(filter);
      case 'Huobi':
        return Huobi.getExchangeInfo(filter);
      case 'Kraken':
        return Kraken.getExchangeInfo(filter);
      case 'MXC':
        return MXC.getExchangeInfo(filter);
      case 'Newdex':
        return Newdex.getExchangeInfo(filter);
      case 'OKEx_Spot':
        return OKExSpot.getExchangeInfo(filter);
      case 'Poloniex':
        return Poloniex.getExchangeInfo(filter);
      case 'Upbit':
        return Upbit.getExchangeInfo(filter);
      case 'WhaleEx':
        return WhaleEx.getExchangeInfo(filter);
      case 'Zaif':
        return Zaif.getExchangeInfo(filter);
      case 'ZB':
        return ZB.getExchangeInfo(filter);
      case 'bitFlyer':
        return BitFlyer.getExchangeInfo(filter);
      default:
        throw new Error(`Unknown exchange: ${exchangeName}`);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e); // TODO: remove this after official release
    throw e;
  }
}
