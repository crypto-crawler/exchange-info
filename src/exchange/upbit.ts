import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { convertArrayToMap, PairInfo, UpbitPairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: UpbitPairInfo): string {
  return pairInfo.market;
}

function extractNormalizedPair(pairInfo: UpbitPairInfo): string {
  const arr = pairInfo.market.split('-');
  assert.equal(arr.length, 2);
  return `${arr[1]}_${arr[0]}`;
}

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PairInfo }> {
  assert.equal(filter, 'All');
  const response = await axios.get('https://api.upbit.com/v1/market/all');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, '');
  const arr = response.data as Array<UpbitPairInfo>;

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.exchange = 'Upbit';
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    p.price_precision = 0; // TODO
    p.base_precision = 0;
    p.quote_precision = 0;
    p.min_quote_quantity = 0;
    /* eslint-enable no-param-reassign */
  });

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'Upbit',
    api_doc: 'https://docs.upbit.com/',
    websocket_endpoint: 'wss://crix-ws.upbit.com/websocket',
    restful_endpoint: 'https://api.upbit.com/v1',
    is_dex: false,
    status: true,
    maker_fee: 0.001,
    taker_fee: 0.001,
    pairs: {},
  };

  info.pairs = await getPairs(filter);
  return info;
}
