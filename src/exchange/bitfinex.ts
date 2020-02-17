import { strict as assert } from 'assert';
import axios from 'axios';
import { normalizePair } from 'crypto-pair';
import { ExchangeInfo } from '../pojo/exchange_info';
import { BitfinexPairInfo, convertArrayToMap, PairInfo } from '../pojo/pair_info';

async function getNameMapping(): Promise<{ [key: string]: string }> {
  const response = await axios.get('https://api-pub.bitfinex.com/v2/conf/pub:map:currency:sym');
  const arr = response.data[0] as [string, string][];
  const result: { [key: string]: string } = {};
  arr.sort().forEach(x => {
    const [key, value] = x;
    result[key] = value.toUpperCase();
  });
  return result;
}

function extractNormalizedPair(pairInfo: PairInfo, mapping: { [key: string]: string }): string {
  const rawPair = pairInfo.raw_pair.toUpperCase();
  let baseSymbol = '';
  let quoteSymbol = '';
  if (rawPair.includes(':')) {
    [baseSymbol, quoteSymbol] = rawPair.split(':');
  } else {
    baseSymbol = rawPair.slice(0, rawPair.length - 3);
    quoteSymbol = rawPair.slice(rawPair.length - 3);
  }

  if (baseSymbol in mapping) baseSymbol = mapping[baseSymbol];
  if (quoteSymbol in mapping) quoteSymbol = mapping[quoteSymbol];

  if (baseSymbol === 'HOT') baseSymbol = 'HYDRO';
  if (baseSymbol === 'ORS') baseSymbol = 'ORSGROUP';

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
  assert.equal(pairInfo.normalized_pair, normalizePair(pairInfo.raw_pair, 'Bitfinex'));
  pairInfo.base_precision = 8; // see https://github.com/bitfinexcom/bfx-api-node-util/blob/master/lib/precision.js
  pairInfo.quote_precision = pairInfo.price_precision;
  pairInfo.min_base_quantity = parseFloat(pairInfo.minimum_order_size);
  pairInfo.spot_enabled = true;
  pairInfo.futures_enabled = pairInfo.margin;
}
/* eslint-enable no-param-reassign */

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://api.bitfinex.com/v1/symbols_details');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');

  const mapping = await getNameMapping();
  let arr = (response.data as BitfinexPairInfo[]).filter(
    pairInfo => !pairInfo.pair.endsWith(':ustf0'),
  ); // Remove Derivatives

  arr.forEach(p => populateCommonFields(p, mapping));

  if (filter !== 'All') {
    arr = arr.filter(p => p.expiration === 'NA');
    if (filter === 'Futures') {
      arr = arr.filter(p => p.futures_enabled);
    }
  }

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
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

  info.pairs = await getPairs(filter);
  return info;
}
