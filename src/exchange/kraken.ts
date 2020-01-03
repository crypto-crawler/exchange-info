import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { convertArrayToMap, KrakenPairInfo, PairInfo } from '../pojo/pair_info';

// https://support.kraken.com/hc/en-us/articles/205893708-Minimum-order-size-volume-
const MIN_BASE_QUANTITY: { [key: string]: number } = {
  REP: 0.3,
  BAT: 50,
  BTC: 0.002,
  BCH: 0.000002,
  ADA: 1,
  LINK: 10,
  ATOM: 1,
  DAI: 10,
  DASH: 0.03,
  DOGE: 3000,
  EOS: 3,
  ETH: 0.02,
  ETC: 0.3,
  GNO: 0.03,
  ICX: 50,
  LSK: 10,
  LTC: 0.1,
  XMR: 0.1,
  NANO: 10,
  OMG: 10,
  PAXG: 0.01,
  QTUM: 0.1,
  XRP: 30,
  SC: 5000,
  XLM: 30,
  USDT: 5,
  XTZ: 1,
  MLN: 0.1,
  WAVES: 10,
  ZEC: 0.03,
};

function extractRawPair(pairInfo: KrakenPairInfo): string {
  return pairInfo.wsname;
}

function extractNormalizedPair(pairInfo: KrakenPairInfo): string {
  const arr = pairInfo.wsname.split('/');
  assert.equal(arr.length, 2);
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i] === 'XBT') arr[i] = 'BTC';
    if (arr[i] === 'XDG') arr[i] = 'DOGE';
  }
  return `${arr[0]}_${arr[1]}`;
}

export async function getPairs(): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://api.kraken.com/0/public/AssetPairs');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  assert.equal(response.data.error.length, 0);

  const arr = (Object.values(response.data.result) as Array<KrakenPairInfo>).filter(x => x.wsname);
  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.exchange = 'Kraken';
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    p.price_precision = p.pair_decimals;
    p.base_precision = p.lot_decimals;
    p.quote_precision = p.pair_decimals;
    p.min_quote_quantity = 0;
    p.min_base_quantity = MIN_BASE_QUANTITY[p.normalized_pair.split('_')[0]];
    /* eslint-enable no-param-reassign */
  });

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
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

  info.pairs = await getPairs();
  return info;
}
