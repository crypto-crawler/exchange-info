import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { BitfinexPairInfo, convertArrayToMap, PairInfo } from '../pojo/pair_info';

async function getNameMapping(): Promise<{ [key: string]: string }> {
  const response = await axios.get('https://api-pub.bitfinex.com/v2/conf/pub:map:currency:sym');
  const arr = response.data[0] as [string, string][];
  const result: { [key: string]: string } = {};
  arr.forEach(x => {
    const [key, value] = x;
    result[key] = value;
  });
  return result;
}

function extractNormalizedPair(pairInfo: PairInfo, mapping: { [key: string]: string }): string {
  const rawPair = pairInfo.raw_pair.toUpperCase();
  if (rawPair.includes(':')) {
    return rawPair.replace(/:/g, '_').toUpperCase();
  }

  let baseSymbol = rawPair.substring(0, rawPair.length - 3);
  if (baseSymbol in mapping) baseSymbol = mapping[baseSymbol];

  let quoteSymbol = rawPair.substring(rawPair.length - 3);
  if (quoteSymbol in mapping) quoteSymbol = mapping[quoteSymbol];

  return `${baseSymbol}_${quoteSymbol}`;
}

/* eslint-disable no-param-reassign */
function populateCommonFields(
  pairInfo: BitfinexPairInfo,
  mapping: { [key: string]: string },
): void {
  pairInfo.exchange = 'Bitfinex';
  pairInfo.raw_pair = pairInfo.pair;
  pairInfo.normalized_pair = extractNormalizedPair(pairInfo, mapping);
  pairInfo.base_precision = 8; // see https://github.com/bitfinexcom/bfx-api-node-util/blob/master/lib/precision.js
  pairInfo.quote_precision = pairInfo.price_precision;
  pairInfo.min_base_quantity = parseFloat(pairInfo.minimum_order_size);
}
/* eslint-enable no-param-reassign */

export async function getPairs(): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://api.bitfinex.com/v1/symbols_details');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');

  const mapping = await getNameMapping();
  const arr = response.data as BitfinexPairInfo[];

  arr.forEach(p => populateCommonFields(p, mapping));

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
