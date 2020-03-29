import { strict as assert } from 'assert';
import axios from 'axios';
import { normalizePair } from 'crypto-pair';
import { ExchangeInfo } from '../pojo/exchange_info';
import { convertArrayToMap, PairInfo } from '../pojo/pair_info';

interface RawPairInfo {
  jpy: { [key: string]: string };
  btc: { [key: string]: string };
}

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PairInfo }> {
  assert.equal(filter, 'All');
  const response = await axios.get('https://coincheck.com/api/rate/all');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const rawPairInfo = response.data as RawPairInfo;
  const pairs: string[] = [];
  Object.keys(rawPairInfo.btc).forEach((baseCurrency) => {
    pairs.push(`${baseCurrency}_BTC`);
  });
  Object.keys(rawPairInfo.jpy).forEach((baseCurrency) => {
    pairs.push(`${baseCurrency}_JPY`.toUpperCase());
  });

  const arr = pairs.map((p) => {
    const pairInfo: PairInfo = {
      exchange: 'Coincheck',
      raw_pair: p,
      normalized_pair: p,
      price_precision: 0, // TODO
      base_precision: 0,
      quote_precision: 0,
      min_quote_quantity: 0,
    };
    assert.equal(pairInfo.normalized_pair, normalizePair(pairInfo.raw_pair, 'Coincheck'));
    return pairInfo;
  });

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'Coincheck',
    api_doc: 'https://coincheck.com/documents/exchange/api',
    websocket_endpoint: 'wss://ws-api.coincheck.com/',
    restful_endpoint: 'https://coincheck.com/api',
    is_dex: false,
    status: true,
    maker_fee: 0.0, // see https://coincheck.com/exchange/fee
    taker_fee: 0.0,
    pairs: {},
  };

  info.pairs = await getPairs(filter);
  return info;
}
