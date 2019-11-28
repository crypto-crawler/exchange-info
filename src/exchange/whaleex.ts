import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { WhaleExPairInfo } from '../pojo/pair_info';

/* eslint-disable no-param-reassign */
function populateCommonFields(pairInfo: WhaleExPairInfo): void {
  pairInfo.raw_pair = pairInfo.name;
  pairInfo.normalized_pair = `${pairInfo.baseCurrency}_${pairInfo.quoteCurrency}`;
  pairInfo.price_precision = pairInfo.tickSize.length - 2;
  pairInfo.quantity_precision = pairInfo.basePrecision;
  pairInfo.min_order_volume = parseFloat(pairInfo.minNotional);
}
/* eslint-enable no-param-reassign */

export async function getPairs(): Promise<WhaleExPairInfo[]> {
  const response = await axios.get('https://api.whaleex.com/BUSINESS/api/public/symbol');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = (response.data as Array<WhaleExPairInfo>).filter(
    x => x.enable && parseFloat(x.baseVolume) > 0 && parseFloat(x.priceChangePercent) !== 0,
  );

  arr.forEach(p => populateCommonFields(p));

  return arr;
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'WhaleEx',
    api_doc: 'https://github.com/WhaleEx/API',
    websocket_endpoint: 'wss://www.whaleex.com/ws/websocket',
    restful_endpoint: 'https://api.whaleex.com',
    is_dex: true,
    blockchain: 'EOS',
    status: true,
    maker_fee: 0.001, // see https://whaleex.zendesk.com/hc/zh-cn/articles/360015324891-%E4%BA%A4%E6%98%93%E6%89%8B%E7%BB%AD%E8%B4%B9
    taker_fee: 0.001,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
