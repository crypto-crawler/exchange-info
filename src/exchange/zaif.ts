import { strict as assert } from 'assert';
import axios from 'axios';
import { normalizePair } from 'crypto-pair';
import { ExchangeInfo } from '../pojo/exchange_info';
import { convertArrayToMap, PairInfo, ZaifPairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: ZaifPairInfo): string {
  return pairInfo.currency_pair;
}

function extractNormalizedPair(pairInfo: ZaifPairInfo): string {
  const arr = pairInfo.currency_pair.split('_');
  assert.equal(arr.length, 2);
  return pairInfo.currency_pair.toUpperCase();
}

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PairInfo }> {
  assert.equal(filter, 'All');
  const response = await axios.get('https://api.zaif.jp/api/1/currency_pairs/all');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = response.data as Array<ZaifPairInfo>;

  arr.forEach((p) => {
    /* eslint-disable no-param-reassign */
    p.exchange = 'Zaif';
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    assert.equal(p.normalized_pair, normalizePair(p.raw_pair, 'Zaif'));
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
    name: 'Zaif',
    api_doc: 'https://zaif-api-document.readthedocs.io/ja/latest/index.html',
    websocket_endpoint: 'wss://ws.zaif.jp/stream?currency_pair=',
    restful_endpoint: 'https://api.zaif.jp/api/1',
    is_dex: false,
    status: true,
    maker_fee: 0.0, // see https://zaif.jp/fee?lang=en
    taker_fee: 0.0,
    pairs: {},
  };

  info.pairs = await getPairs(filter);
  return info;
}
