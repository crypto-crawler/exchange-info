import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { BitstampPairInfo, convertArrayToMap, PairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: BitstampPairInfo): string {
  return pairInfo.url_symbol;
}

function extractNormalizedPair(pairInfo: BitstampPairInfo): string {
  return pairInfo.name.replace('/', '_');
}

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://www.bitstamp.net/api/v2/trading-pairs-info/');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');

  let arr = response.data as BitstampPairInfo[];
  if (filter !== 'All') {
    arr = arr.filter(x => x.trading === 'Enabled');
  }

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.exchange = 'Bitstamp';
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    p.price_precision = p.counter_decimals;
    p.base_precision = p.base_decimals;
    p.quote_precision = p.counter_decimals;
    p.min_quote_quantity = parseFloat(p.minimum_order.split(' ')[0]);
    /* eslint-enable no-param-reassign */
  });

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'Bitstamp',
    api_doc: 'https://www.bitstamp.net/api/',
    websocket_endpoint: 'wss://ws.bitstamp.net',
    restful_endpoint: 'https://www.bitstamp.net/api/v2',
    is_dex: false,
    status: true,
    maker_fee: 0.005, // see https://www.bitstamp.net/fee-schedule/
    taker_fee: 0.005,
    pairs: {},
  };

  info.pairs = await getPairs(filter);
  return info;
}
