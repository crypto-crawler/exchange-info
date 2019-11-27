import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { CoinbasePairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: CoinbasePairInfo): string {
  return pairInfo.display_name;
}

function extractNormalizedPair(pairInfo: CoinbasePairInfo): string {
  return `${pairInfo.base_currency}_${pairInfo.quote_currency}`;
}

export async function getPairs(): Promise<CoinbasePairInfo[]> {
  const response = await axios.get('https://api.pro.coinbase.com/products');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = response.data as Array<CoinbasePairInfo>;

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    /* eslint-enable no-param-reassign */
  });

  return arr.filter(x => x.status === 'online');
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'Coinbase',
    api_doc: 'https://docs.pro.coinbase.com/',
    websocket_endpoint: 'wss://ws-feed.pro.coinbase.com',
    restful_endpoint: 'https://api.pro.coinbase.com',
    is_dex: false,
    status: true,
    maker_fee: 0.005, // see https://pro.coinbase.com/fees
    taker_fee: 0.005,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
