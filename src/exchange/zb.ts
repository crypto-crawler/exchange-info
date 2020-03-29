import { strict as assert } from 'assert';
import axios from 'axios';
import { normalizePair } from 'crypto-pair';
import { ExchangeInfo } from '../pojo/exchange_info';
import { convertArrayToMap, PairInfo, ZBPairInfo } from '../pojo/pair_info';

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PairInfo }> {
  assert.equal(filter, 'All');
  const response = await axios.get('http://api.zb.plus/data/v1/markets');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');

  const arr: ZBPairInfo[] = [];
  const myMap = response.data as { [key: string]: ZBPairInfo };
  Object.keys(myMap).forEach((key) => {
    const p = myMap[key];
    p.exchange = 'ZB';
    p.raw_pair = key;
    p.normalized_pair = key.toUpperCase();
    assert.equal(p.normalized_pair, normalizePair(p.raw_pair, 'ZB'));
    p.price_precision = 0; // TODO
    p.base_precision = 0;
    p.quote_precision = 0;
    p.min_quote_quantity = 0;
    arr.push(p);
  });

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'ZB',
    api_doc: 'https://web.zb.com/i/developer',
    websocket_endpoint: 'wss://api.zb.cn/websocket',
    restful_endpoint: 'http://api.zb.plus/data/v1',
    is_dex: false,
    status: true,
    maker_fee: 0.001, // see https://whaleex.zendesk.com/hc/zh-cn/articles/360015324891-%E4%BA%A4%E6%98%93%E6%89%8B%E7%BB%AD%E8%B4%B9
    taker_fee: 0.001,
    pairs: {},
  };

  info.pairs = await getPairs(filter);
  return info;
}
