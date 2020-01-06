import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { convertArrayToMap, OKExSpotPairInfo, PairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: OKExSpotPairInfo): string {
  return pairInfo.symbol;
}

function extractNormalizedPair(pairInfo: OKExSpotPairInfo): string {
  return pairInfo.symbol.toUpperCase();
}

export async function getPairs(): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get(`https://www.okex.com/v2/spot/markets/products?t=${Date.now()}`);
  assert.equal(response.status, 200);
  assert.equal(response.statusText, '');
  assert.equal(response.data.code, 0);
  const arr = (response.data.data as Array<OKExSpotPairInfo>).filter(x => x.online === 1);

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.exchange = 'OKEx_Spot';
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    p.price_precision = p.maxPriceDigit;
    p.base_precision = p.maxSizeDigit;
    p.quote_precision = p.maxPriceDigit;
    p.min_base_quantity = p.minTradeSize;
    p.min_quote_quantity = 0;
    /* eslint-enable no-param-reassign */
  });

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'OKEx_Spot',
    api_doc: 'https://www.okex.com/docs/en/',
    websocket_endpoint: 'wss://real.okex.com:8443/ws/v3',
    restful_endpoint: 'https://www.okex.com/api/v2/spot',
    is_dex: false,
    status: true,
    maker_fee: 0.001, // see https://www.okex.com/pages/products/fees.html
    taker_fee: 0.0015,
    pairs: {},
  };

  info.pairs = await getPairs();
  return info;
}
