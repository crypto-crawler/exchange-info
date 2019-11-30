import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { PairInfo, convertArrayToMap } from '../pojo/pair_info';

function extractNormalizedPair(pairInfo: PairInfo): string {
  const rawPair = pairInfo.raw_pair.toUpperCase();
  if (rawPair.includes(':')) {
    return rawPair.replace(/:/g, '_').toUpperCase();
  }
  return `${rawPair.substring(0, rawPair.length - 3)}_${rawPair.substring(rawPair.length - 3)}`;
}

/* eslint-disable no-param-reassign */
function populateCommonFields(pairInfo: PairInfo): void {
  pairInfo.exchange = 'Bitfinex';
  pairInfo.normalized_pair = extractNormalizedPair(pairInfo);
  pairInfo.price_precision = 0; // TODO
  pairInfo.base_precision = 0;
  pairInfo.quote_precision = 0;
  pairInfo.min_order_volume = 0;
}
/* eslint-enable no-param-reassign */

export async function getPairs(): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://api.bitfinex.com/v1/symbols');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = (response.data as string[]).map(x => ({ raw_pair: x } as PairInfo));

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
