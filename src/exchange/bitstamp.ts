import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { PairInfo, BitstampPairInfo, convertArrayToMap } from '../pojo/pair_info';

function extractRawPair(pairInfo: BitstampPairInfo): string {
  return pairInfo.url_symbol;
}

function extractNormalizedPair(pairInfo: BitstampPairInfo): string {
  return pairInfo.name.replace('/', '_');
}

export async function getPairs(): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://www.bitstamp.net/api/v2/trading-pairs-info/');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = (response.data as Array<BitstampPairInfo>).filter(x => x.trading === 'Enabled');

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.exchange = 'Bitstamp';
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    p.price_precision = 0; // TODO
    p.base_precision = 0;
    p.quote_precision = 0;
    p.min_order_volume = 0;
    /* eslint-enable no-param-reassign */
  });

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'Bitstamp',
    api_doc: 'https://www.bitstamp.net/api/',
    websocket_endpoint: 'wss://ws.bitstamp.net',
    restful_endpoint: 'https://www.bitstamp.net/api/v2',
    is_dex: false,
    status: true,
    maker_fee: 0.005, // see https://www.bitstamp.net/fee-schedule/
    taker_fee: 0.005,
    pairs: {},
  };

  info.pairs = await getPairs();
  return info;
}
