import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { PairInfo } from '../pojo/pair_info';

interface RawPairInfo {
  jpy: { [key: string]: string };
  btc: { [key: string]: string };
}

export async function getPairs(): Promise<PairInfo[]> {
  const response = await axios.get('https://coincheck.com/api/rate/all');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const rawPairInfo = response.data as RawPairInfo;
  const pairs: string[] = [];
  Object.keys(rawPairInfo.btc).forEach(baseCurrency => {
    pairs.push(`${baseCurrency}_BTC`);
  });
  Object.keys(rawPairInfo.jpy).forEach(baseCurrency => {
    pairs.push(`${baseCurrency}_JPY`.toUpperCase());
  });

  return pairs.map(p => {
    const pairInfo = {
      raw_pair: p,
      normalized_pair: p,
    };
    return pairInfo;
  });
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'Coincheck',
    api_doc: 'https://coincheck.com/documents/exchange/api',
    websocket_endpoint: 'wss://ws-api.coincheck.com/',
    restful_endpoint: 'https://coincheck.com/api',
    is_dex: false,
    status: true,
    maker_fee: 0.0, // see https://coincheck.com/exchange/fee
    taker_fee: 0.0,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
