import { strict as assert } from 'assert';
import axios from 'axios';
import normalize from 'crypto-pair';
import { ExchangeInfo } from '../pojo/exchange_info';
import { convertArrayToMap, PairInfo, WhaleExPairInfo } from '../pojo/pair_info';
import { calcPrecision } from '../utils';

/* eslint-disable no-param-reassign */
function populateCommonFields(pairInfo: WhaleExPairInfo): void {
  pairInfo.exchange = 'WhaleEx';
  pairInfo.raw_pair = pairInfo.name;
  pairInfo.normalized_pair = `${
    pairInfo.baseCurrency === 'KEY' ? 'MYKEY' : pairInfo.baseCurrency
  }_${pairInfo.quoteCurrency}`;
  assert.equal(pairInfo.normalized_pair, normalize(pairInfo.raw_pair, 'WhaleEx'));
  pairInfo.price_precision = calcPrecision(pairInfo.tickSize);
  pairInfo.base_precision = pairInfo.basePrecision;
  pairInfo.quote_precision = pairInfo.quotePrecision;
  pairInfo.min_quote_quantity = parseFloat(pairInfo.minNotional);
  pairInfo.min_base_quantity = parseFloat(pairInfo.minQty);
  pairInfo.base_contract = pairInfo.baseContract;

  // delete volatile fields
  delete pairInfo.baseVolume;
  delete pairInfo.high;
  delete pairInfo.low;
  delete pairInfo.lastPrice;
  delete pairInfo.priceChangePercent;
  delete pairInfo.quoteVolume;
  delete pairInfo.weight;
  delete pairInfo.weightChange;
  delete pairInfo.weightVolume;
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

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://api.whaleex.com/BUSINESS/api/public/symbol');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');

  let arr = response.data as Array<WhaleExPairInfo>;
  if (filter !== 'All') arr = arr.filter(x => x.enable && x.status === 'ON');

  arr.forEach(p => populateCommonFields(p));

  await populateQuoteContract(arr);

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
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

  info.pairs = await getPairs(filter);
  return info;
}
