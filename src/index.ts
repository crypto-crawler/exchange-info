import { ExchangeInfo } from './pojo/exchange_info';
import * as Newdex from './exchange/newdex';
import * as WhaleEx from './exchange/whaleex';
import * as Binance from './exchange/binance';

/**
 * Get all informaton about a crypto exchange.
 *
 * @param exchangeName The name of the exchange
 */
export default async function getExchangeInfo(
  exchangeName: 'Newdex' | 'WhaleEx' | 'Binance',
): Promise<ExchangeInfo> {
  switch (exchangeName) {
    case 'Newdex':
      return Newdex.getExchangeInfo();
    case 'WhaleEx':
      return WhaleEx.getExchangeInfo();
    case 'Binance':
      return Binance.getExchangeInfo();
    default:
      throw new Error(`Unknown exchange: ${exchangeName}`);
  }
}
