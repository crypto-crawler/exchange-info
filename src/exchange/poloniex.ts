import { strict as assert } from 'assert';
import axios from 'axios';
import { normalizePair } from 'crypto-pair';
import { ExchangeInfo } from '../pojo/exchange_info';
import { PoloniexPairInfo } from '../pojo/pair_info';

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PoloniexPairInfo }> {
  assert.equal(filter, 'All');
  const response = await axios.get('https://poloniex.com/public?command=returnTicker');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');

  const result: { [key: string]: PoloniexPairInfo } = {};
  const myMap = response.data as { [key: string]: PoloniexPairInfo };
  Object.keys(myMap).forEach(key => {
    const p = myMap[key];
    p.exchange = 'Poloniex';
    p.raw_pair = key;
    const tmp = key.split('_');
    p.normalized_pair = `${tmp[1]}_${tmp[0]}`;
    assert.equal(p.normalized_pair, normalizePair(p.raw_pair, 'Poloniex'));
    p.price_precision = 0; // TODO
    p.base_precision = 0;
    p.quote_precision = 0;
    p.min_quote_quantity = 0;
    if (p.isFrozen === '0') {
      result[p.normalized_pair] = p;
    }
  });

  return result;
}

export async function getExchangeInfo(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'Poloniex',
    api_doc: 'https://docs.poloniex.com/',
    websocket_endpoint: 'wss://api2.poloniex.com',
    restful_endpoint: 'https://poloniex.com/public',
    is_dex: false,
    status: true,
    maker_fee: 0.0015, // see https://poloniex.com/fees/
    taker_fee: 0.0025,
    pairs: {},
  };

  info.pairs = await getPairs(filter);
  return info;
}
