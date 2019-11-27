import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { BitstampPairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: BitstampPairInfo): string {
  return pairInfo.name;
}

function extractNormalizedPair(pairInfo: BitstampPairInfo): string {
  return pairInfo.name.replace('/', '_');
}

export async function getPairs(): Promise<BitstampPairInfo[]> {
  const response = await axios.get('https://www.bitstamp.net/api/v2/trading-pairs-info/');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = response.data as Array<BitstampPairInfo>;

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    /* eslint-enable no-param-reassign */
  });

  return arr.filter(x => x.trading === 'Enabled');
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'Bitstamp',
    api_doc: 'https://www.bitstamp.net/api/',
    websocket_endpoint: 'wss://ws.bitstamp.net',
    restful_endpoint: 'https://www.bitstamp.net/api/v2',
    is_dex: false,
    status: true,
    maker_fee: 0.005, // see https://www.bitstamp.net/fee-schedule/
    taker_fee: 0.005,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
