import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { PairInfo, WhaleExPairInfo, convertArrayToMap } from '../pojo/pair_info';

/* eslint-disable no-param-reassign */
function populateCommonFields(pairInfo: WhaleExPairInfo): void {
  pairInfo.exchange = 'WhaleEx';
  pairInfo.raw_pair = pairInfo.name;
  pairInfo.normalized_pair = `${pairInfo.baseCurrency}_${pairInfo.quoteCurrency}`;
  pairInfo.price_precision = pairInfo.tickSize.length - 2;
  pairInfo.base_precision = pairInfo.basePrecision;
  pairInfo.quote_precision = pairInfo.quotePrecision;
  pairInfo.min_order_volume = parseFloat(pairInfo.minNotional);
  pairInfo.base_contract = pairInfo.baseContract;
}

async function populateQuoteContract(pairInfos: WhaleExPairInfo[]): Promise<void> {
  const response = await axios.get('https://api.whaleex.com/BUSINESS/api/public/currency');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');

  type CurrencyInfo = {
    shortName: string;
    token: string;
    contract: string;
    quotable: boolean;
    visible: boolean;
    status: string;
  };
  const arr = (response.data as Array<CurrencyInfo>).filter(
    x => x.quotable && x.visible && x.status === 'ON',
  );

  const map = new Map<string, string>();
  arr.forEach(x => {
    // assert.equal(x.shortName, x.token); // e.g., BTC, EBTC
    map.set(x.shortName, x.contract);
  });
  pairInfos.forEach(pairInfo => {
    const token = pairInfo.normalized_pair.split('_')[1];
    pairInfo.quote_contract = map.get(token);
  });
}
/* eslint-enable no-param-reassign */

export async function getPairs(): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://api.whaleex.com/BUSINESS/api/public/symbol');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = (response.data as Array<WhaleExPairInfo>).filter(x => x.enable && x.status === 'ON');

  arr.forEach(p => populateCommonFields(p));

  await populateQuoteContract(arr);

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'WhaleEx',
    api_doc: 'https://github.com/WhaleEx/API',
    websocket_endpoint: 'wss://www.whaleex.com/ws/websocket',
    restful_endpoint: 'https://api.whaleex.com',
    is_dex: true,
    blockchain: 'EOS',
    status: true,
    maker_fee: 0.001, // see https://whaleex.zendesk.com/hc/zh-cn/articles/360015324891-%E4%BA%A4%E6%98%93%E6%89%8B%E7%BB%AD%E8%B4%B9
    taker_fee: 0.001,
    pairs: {},
  };

  info.pairs = await getPairs();
  return info;
}
