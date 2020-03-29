import { strict as assert } from 'assert';
import axios from 'axios';
import { normalizePair } from 'crypto-pair';
import { ExchangeInfo } from '../pojo/exchange_info';
import { convertArrayToMap, KrakenPairInfo, PairInfo } from '../pojo/pair_info';

// https://support.kraken.com/hc/en-us/articles/205893708-Minimum-order-size-volume-
const MIN_BASE_QUANTITY: { [key: string]: number } = {
  ADA: 1,
  ATOM: 1,
  BAT: 50,
  BCH: 0.000002,
  BTC: 0.002,
  DAI: 10,
  DASH: 0.03,
  DOGE: 3000,
  EOS: 3,
  ETC: 0.3,
  ETH: 0.02,
  GNO: 0.03,
  ICX: 50,
  LINK: 10,
  LSK: 10,
  LTC: 0.1,
  MLN: 0.1,
  NANO: 10,
  OMG: 10,
  PAXG: 0.01,
  QTUM: 0.1,
  REP: 0.3,
  SC: 5000,
  USDC: 5,
  USDT: 5,
  WAVES: 10,
  XLM: 30,
  XMR: 0.1,
  XRP: 30,
  XTZ: 1,
  ZEC: 0.03,
};

function safeCurrencyCode(currencyId: string): string {
  let result = currencyId;
  if (currencyId.length > 3) {
    if (currencyId.indexOf('X') === 0 || currencyId.indexOf('Z') === 0) {
      result = currencyId.slice(1);
    }
  }

  if (result === 'XBT') result = 'BTC';
  if (result === 'XDG') result = 'DOGE';

  return result;
}

function extractNormalizedPair(pairInfo: KrakenPairInfo): string {
  const arr = pairInfo.wsname.split('/');
  assert.equal(arr.length, 2);
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i] === 'XBT') arr[i] = 'BTC';
    if (arr[i] === 'XDG') arr[i] = 'DOGE';
  }
  const result = `${arr[0]}_${arr[1]}`;

  const base = safeCurrencyCode(pairInfo.base);
  const quote = safeCurrencyCode(pairInfo.quote);
  assert.equal(result, `${base}_${quote}`);

  return result;
}

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://api.kraken.com/0/public/AssetPairs');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  assert.equal(response.data.error.length, 0);

  const data = response.data.result as { [key: string]: KrakenPairInfo };
  const arr: KrakenPairInfo[] = [];

  Object.keys(data).forEach((rawPair) => {
    const p = data[rawPair];
    if (!p.wsname) return;

    /* eslint-disable no-param-reassign */
    p.exchange = 'Kraken';
    p.raw_pair = rawPair;
    p.normalized_pair = extractNormalizedPair(p);
    assert.equal(p.normalized_pair, normalizePair(rawPair, 'Kraken'));
    p.price_precision = p.pair_decimals;
    p.base_precision = p.lot_decimals;
    p.quote_precision = p.pair_decimals;
    p.min_quote_quantity = 0;
    p.min_base_quantity = MIN_BASE_QUANTITY[p.normalized_pair.split('_')[0]];
    p.spot_enabled = true;

    arr.push(p);
    /* eslint-enable no-param-reassign */
  });

  if (filter === 'All' || filter === 'Spot') return convertArrayToMap(arr);
  return {};
}

export async function getExchangeInfo(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'Kraken',
    api_doc: 'https://www.kraken.com/features/api',
    websocket_endpoint: 'wss://ws.kraken.com',
    restful_endpoint: 'https://api.kraken.com',
    is_dex: false,
    status: true,
    maker_fee: 0.0016, // see https://support.kraken.com/hc/en-us/articles/360000526126-What-are-Maker-and-Taker-fees-
    taker_fee: 0.0026,
    pairs: {},
  };

  info.pairs = await getPairs(filter);
  return info;
}
