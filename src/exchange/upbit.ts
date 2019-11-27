import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { UpbitPairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: UpbitPairInfo): string {
  return pairInfo.market;
}

function extractNormalizedPair(pairInfo: UpbitPairInfo): string {
  const arr = pairInfo.market.split('-');
  assert.equal(arr.length, 2);
  return `${arr[1]}_${arr[0]}`;
}

export async function getPairs(): Promise<UpbitPairInfo[]> {
  const response = await axios.get('https://api.upbit.com/v1/market/all');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, '');
  const arr = response.data as Array<UpbitPairInfo>;

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    /* eslint-enable no-param-reassign */
  });

  return arr;
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'Upbit',
    api_doc: 'https://docs.upbit.com/',
    websocket_endpoint: 'wss://ws.newdex.io',
    restful_endpoint: 'https://api.upbit.com/v1',
    is_dex: false,
    status: true,
    maker_fee: 0.001,
    taker_fee: 0.001,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
