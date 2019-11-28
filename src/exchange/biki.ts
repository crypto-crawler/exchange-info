import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { BikiPairInfo } from '../pojo/pair_info';

/* eslint-disable no-param-reassign */
function populateCommonFields(pairInfo: BikiPairInfo): void {
  pairInfo.raw_pair = pairInfo.symbol;
  pairInfo.normalized_pair = `${pairInfo.base_coin}_${pairInfo.count_coin}`;
  pairInfo.quantity_precision = pairInfo.amount_precision;
  pairInfo.min_order_volume = parseFloat(pairInfo.limit_volume_min);
}
/* eslint-enable no-param-reassign */

export async function getPairs(): Promise<BikiPairInfo[]> {
  const response = await axios.get('https://openapi.biki.com/open/api/common/symbols');
  assert.equal(response.status, 200);
  assert.equal(response.data.code, '0');
  assert.equal(response.data.msg, 'suc');
  const arr = response.data.data as Array<BikiPairInfo>;

  arr.forEach(p => populateCommonFields(p));

  return arr;
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'Biki',
    api_doc: 'https://github.com/code-biki/open-api',
    websocket_endpoint: 'wss://ws.biki.com/kline-api/ws',
    restful_endpoint: 'https://openapi.biki.com ',
    is_dex: false,
    status: true,
    maker_fee: 0.0015, // see https://bikiuser.zendesk.com/hc/en-us/articles/360016487751-Announcement-on-canceling-the-free-trading-fee-for-four-trading-pairs
    taker_fee: 0.0015,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
