import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { OKExSpotPairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: OKExSpotPairInfo): string {
  return pairInfo.symbol;
}

function extractNormalizedPair(pairInfo: OKExSpotPairInfo): string {
  return pairInfo.symbol.toUpperCase();
}

export async function getPairs(): Promise<OKExSpotPairInfo[]> {
  const response = await axios.get(`https://www.okex.com/v2/spot/markets/products?t=${Date.now()}`);
  assert.equal(response.status, 200);
  assert.equal(response.statusText, '');
  assert.equal(response.data.code, 0);
  const arr = response.data.data as Array<OKExSpotPairInfo>;

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    /* eslint-enable no-param-reassign */
  });

  return arr.filter(x => x.online === 1);
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'OKEx_Spot',
    api_doc: 'https://github.com/okcoin-okex/API-docs-OKEx.com',
    websocket_endpoint: 'wss://real.okex.com:10441/websocket?compress=true',
    restful_endpoint: 'https://www.okex.com/api/v2/spot',
    is_dex: false,
    status: true,
    maker_fee: 0.001, // see https://www.okex.com/pages/products/fees.html
    taker_fee: 0.0015,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
