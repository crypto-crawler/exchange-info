import { strict as assert } from 'assert';
import axios from 'axios';
import normalize from 'crypto-pair';
import { ExchangeInfo } from '../pojo/exchange_info';
import { convertArrayToMap, HuobiPairInfo, PairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: HuobiPairInfo): string {
  return pairInfo.symbol;
}

function extractNormalizedPair(pairInfo: HuobiPairInfo): string {
  let baseSymbol = pairInfo['base-currency'];
  if (baseSymbol === 'hot') baseSymbol = 'Hydro';
  return `${baseSymbol}_${pairInfo['quote-currency']}`.toUpperCase();
}

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://api.huobi.pro/v1/common/symbols');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  assert.equal(response.data.status, 'ok');

  let arr = response.data.data as Array<HuobiPairInfo>;
  arr = arr.filter(x => x.state === 'online');

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.exchange = 'Huobi';
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    assert.equal(p.normalized_pair, normalize(p.raw_pair, 'Huobi'));
    p.price_precision = p['price-precision'];
    p.base_precision = p['amount-precision'];
    p.quote_precision = p['value-precision'];
    p.min_quote_quantity = p['min-order-value'];
    p.min_base_quantity = p['min-order-amt'];
    /* eslint-enable no-param-reassign */
  });

  if (filter !== 'All') {
    interface Info {
      quote_currency: boolean;
      show_precision: string;
      currency_code: string;
      withdraw_precision: string;
      visible: boolean;
      white_enabled: boolean;
      country_disabled: boolean;
      deposit_enabled: boolean;
      withdraw_enabled: boolean;
      state: string;
      display_name: string;
    }
    const infos = (await axios.get('https://www.huobi.com/-/x/pro/v2/beta/common/currencies')).data
      .data as Info[];
    const infoMap: { [key: string]: Info } = {};
    infos.forEach(info => {
      infoMap[info.display_name] = info;
    });

    arr = arr.filter(pairInfo => {
      let baseSymbol = pairInfo.normalized_pair.split('_')[0];
      if (baseSymbol === 'HYDRO') baseSymbol = 'HOT'; // restore
      if (!(baseSymbol in infoMap)) throw Error(baseSymbol);
      const info = infoMap[baseSymbol];

      pairInfo.deposit_enabled = info.deposit_enabled; // eslint-disable-line no-param-reassign
      pairInfo.withdraw_enabled = info.withdraw_enabled; // eslint-disable-line no-param-reassign

      return (
        info.visible &&
        !info.country_disabled &&
        info.state === 'online' &&
        pairInfo.deposit_enabled &&
        pairInfo.withdraw_enabled
      );
    });
  }

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'Huobi',
    api_doc: 'https://huobiapi.github.io/docs/spot/v1/en/',
    websocket_endpoint: 'wss://api.huobi.pro/ws',
    restful_endpoint: 'https://api.huobi.pro',
    is_dex: false,
    status: true,
    maker_fee: 0.002, // see https://www.hbg.com/en-us/fee/
    taker_fee: 0.002,
    pairs: {},
  };

  info.pairs = await getPairs(filter);
  return info;
}
