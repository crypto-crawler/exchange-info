import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { PairInfo } from '../pojo/pair_info';

export async function getPairs(): Promise<PairInfo[]> {
  const response = await axios.get('https://www.mxc.com/open/api/v1/data/markets');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  assert.equal(response.data.code, 200);
  assert.equal(response.data.msg, 'OK');
  const arr = response.data.data as string[];

  return arr.map(rawPair => {
    return {
      raw_pair: rawPair,
      normalized_pair: rawPair.toUpperCase(),
      price_precision: 0, // TODO
      quantity_precision: 0,
      min_order_volume: 0,
    };
  });
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'MXC',
    api_doc: 'https://github.com/mxcdevelop/APIDoc',
    websocket_endpoint: 'wss://wbs.mxc.com/socket.io/',
    restful_endpoint: 'https://www.mxc.com/api/market',
    is_dex: false,
    status: true,
    maker_fee: 0.002, // see https://www.mxc.com/intro/fees
    taker_fee: 0.002,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
