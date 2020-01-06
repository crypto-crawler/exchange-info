import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { BitfinexPairInfo, convertArrayToMap, PairInfo } from '../pojo/pair_info';

function extractNormalizedPair(pairInfo: PairInfo): string {
  const rawPair = pairInfo.raw_pair.toUpperCase();
  if (rawPair.includes(':')) {
    return rawPair.replace(/:/g, '_').toUpperCase();
  }
  return `${rawPair.substring(0, rawPair.length - 3)}_${rawPair.substring(rawPair.length - 3)}`;
}

/* eslint-disable no-param-reassign */
function populateCommonFields(pairInfo: BitfinexPairInfo): void {
  pairInfo.exchange = 'Bitfinex';
  pairInfo.raw_pair = pairInfo.pair;
  pairInfo.normalized_pair = extractNormalizedPair(pairInfo);
  pairInfo.base_precision = 8; // see https://github.com/bitfinexcom/bfx-api-node-util/blob/master/lib/precision.js
  pairInfo.quote_precision = pairInfo.price_precision;
  pairInfo.min_base_quantity = parseFloat(pairInfo.minimum_order_size);
}
/* eslint-enable no-param-reassign */

export async function getPairs(): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://api.bitfinex.com/v1/symbols_details');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = response.data as BitfinexPairInfo[];

  arr.forEach(p => populateCommonFields(p));

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'Bitfinex',
    api_doc: 'https://docs.bitfinex.com/docs',
    websocket_endpoint: 'wss://api-pub.bitfinex.com/ws/2',
    restful_endpoint: 'https://api.bitfinex.com/v1',
    is_dex: false,
    status: true,
    maker_fee: 0.001, // see https://www.bitfinex.com/fees
    taker_fee: 0.002,
    pairs: {},
  };

  info.pairs = await getPairs();
  return info;
}
