import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { PairInfo, CoinbasePairInfo, convertArrayToMap } from '../pojo/pair_info';
import { calcPrecision } from '../utils';

function extractRawPair(pairInfo: CoinbasePairInfo): string {
  return pairInfo.display_name;
}

function extractNormalizedPair(pairInfo: CoinbasePairInfo): string {
  return `${pairInfo.base_currency}_${pairInfo.quote_currency}`;
}

export async function getPairs(): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://api.pro.coinbase.com/products');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = (response.data as Array<CoinbasePairInfo>).filter(x => x.status === 'online');

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.exchange = 'Coinbase';
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    p.price_precision = calcPrecision(p.quote_increment);
    p.base_precision = calcPrecision(p.base_increment);
    p.quote_precision = calcPrecision(p.quote_increment);
    p.min_quote_quantity = parseFloat(p.min_market_funds);
    p.min_base_quantity = parseFloat(p.base_min_size);
    /* eslint-enable no-param-reassign */
  });

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'Coinbase',
    api_doc: 'https://docs.pro.coinbase.com/',
    websocket_endpoint: 'wss://ws-feed.pro.coinbase.com',
    restful_endpoint: 'https://api.pro.coinbase.com',
    is_dex: false,
    status: true,
    maker_fee: 0.005, // see https://pro.coinbase.com/fees, https://pro.coinbase.com/orders/fees
    taker_fee: 0.005,
    pairs: {},
  };

  info.pairs = await getPairs();
  return info;
}
