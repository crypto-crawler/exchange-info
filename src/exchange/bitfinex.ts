import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { PairInfo } from '../pojo/pair_info';

function extractNormalizedPair(pairInfo: PairInfo): string {
  const rawPair = pairInfo.raw_pair.toUpperCase();
  if (rawPair.includes(':')) {
    return rawPair.replace(/:/g, '_').toUpperCase();
  }
  return `${rawPair.substring(0, rawPair.length - 3)}_${rawPair.substring(rawPair.length - 3)}`;
}

export async function getPairs(): Promise<PairInfo[]> {
  const response = await axios.get('https://api.bitfinex.com/v1/symbols');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = (response.data as string[]).map(x => ({ raw_pair: x } as PairInfo));

  arr.forEach(p => {
    p.normalized_pair = extractNormalizedPair(p); // eslint-disable-line no-param-reassign
  });
  return arr;
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'Bitfinex',
    api_doc: 'https://docs.bitfinex.com/docs',
    websocket_endpoint: 'wss://api-pub.bitfinex.com/ws/2',
    restful_endpoint: 'https://api.bitfinex.com/v1',
    is_dex: false,
    status: true,
    maker_fee: 0.001, // see https://www.bitfinex.com/fees
    taker_fee: 0.002,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
