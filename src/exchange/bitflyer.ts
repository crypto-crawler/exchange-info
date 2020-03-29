import { strict as assert } from 'assert';
import axios from 'axios';
import { normalizePair } from 'crypto-pair';
import { ExchangeInfo } from '../pojo/exchange_info';
import { convertArrayToMap, PairInfo } from '../pojo/pair_info';

function extractRawPair(rawInfo: { product_code: string; alias: string }): string {
  return rawInfo.product_code;
}

function extractNormalizedPair(rawInfo: { product_code: string; alias: string }): string {
  return rawInfo.product_code;
}

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PairInfo }> {
  assert.equal(filter, 'All');
  const response = await axios.get('https://api.bitflyer.jp/v1/markets');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = (response.data as Array<{ product_code: string; alias: string }>).filter(
    (x) => x.product_code.includes('_') && !x.product_code.startsWith('FX_'),
  );

  const arr2 = arr.map((rawInfo) => {
    const rawPair = extractRawPair(rawInfo);
    const normalizedPair = extractNormalizedPair(rawInfo);
    assert.equal(normalizedPair, normalizePair(rawPair, 'bitFlyer'));
    const pairInfo: PairInfo = {
      exchange: 'bitFlyer',
      raw_pair: rawPair,
      normalized_pair: normalizedPair,
      price_precision: 0, // TODO
      base_precision: 0,
      quote_precision: 0,
      min_quote_quantity: 0,
    };
    return pairInfo;
  });
  return convertArrayToMap(arr2);
}

export async function getExchangeInfo(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'bitFlyer',
    api_doc: 'https://lightning.bitflyer.com/docs?lang=en',
    websocket_endpoint: 'https://io.lightstream.bitflyer.com',
    restful_endpoint: 'https://api.bitflyer.jp/v1',
    is_dex: false,
    status: true,
    maker_fee: 0.0012, // see https://bitflyer.com/en/commission
    taker_fee: 0.0012,
    pairs: {},
  };

  info.pairs = await getPairs(filter);
  return info;
}
