import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { PairInfo } from '../pojo/pair_info';

function extractRawPair(rawInfo: { product_code: string; alias: string }): string {
  return rawInfo.product_code;
}

function extractNormalizedPair(rawInfo: { product_code: string; alias: string }): string {
  return rawInfo.product_code;
}

export async function getPairs(): Promise<PairInfo[]> {
  const response = await axios.get('https://api.bitflyer.jp/v1/markets');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = (response.data as Array<{ product_code: string; alias: string }>).filter(
    x => x.product_code.includes('_') && !x.product_code.startsWith('FX_'),
  );

  return arr.map(rawInfo => {
    const rawPair = extractRawPair(rawInfo);
    const normalizedPair = extractNormalizedPair(rawInfo);
    const pairInfo = {
      exchange_name: 'bitFlyer',
      raw_pair: rawPair,
      normalized_pair: normalizedPair,
    } as PairInfo;
    return pairInfo;
  });
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'bitFlyer',
    api_doc: 'https://lightning.bitflyer.com/docs?lang=en',
    websocket_endpoint: 'https://io.lightstream.bitflyer.com',
    restful_endpoint: 'https://api.bitflyer.jp/v1',
    is_dex: false,
    status: true,
    maker_fee: 0.0012, // see https://bitflyer.com/en/commission
    taker_fee: 0.0012,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
