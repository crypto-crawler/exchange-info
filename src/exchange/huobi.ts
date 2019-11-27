import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { HuobiPairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: HuobiPairInfo): string {
  return pairInfo.symbol;
}

function extractNormalizedPair(pairInfo: HuobiPairInfo): string {
  return `${pairInfo['base-currency']}_${pairInfo['quote-currency']}`.toUpperCase();
}

export async function getPairs(): Promise<HuobiPairInfo[]> {
  const response = await axios.get('https://api.huobi.pro/v1/common/symbols');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  assert.equal(response.data.status, 'ok');
  const arr = response.data.data as Array<HuobiPairInfo>;

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    /* eslint-enable no-param-reassign */
  });

  return arr.filter(x => x.state === 'online');
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'Huobi',
    api_doc: 'https://huobiapi.github.io/docs/spot/v1/en/',
    websocket_endpoint: 'wss://api.huobi.pro/ws',
    restful_endpoint: 'https://api.huobi.pro/v1',
    is_dex: false,
    status: true,
    maker_fee: 0.002, // see https://www.hbg.com/en-us/fee/
    taker_fee: 0.002,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
