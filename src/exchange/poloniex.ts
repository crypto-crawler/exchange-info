import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { PoloniexPairInfo } from '../pojo/pair_info';

export async function getPairs(): Promise<PoloniexPairInfo[]> {
  const response = await axios.get('https://poloniex.com/public?command=returnTicker');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');

  const arr: PoloniexPairInfo[] = [];
  const myMap = response.data as { [key: string]: PoloniexPairInfo };
  Object.keys(myMap).forEach(key => {
    const value = myMap[key];
    value.raw_pair = key;
    const tmp = key.split('_');
    value.normalized_pair = `${tmp[1]}_${tmp[0]}`;
    arr.push(value);
  });

  return arr.filter(x => x.isFrozen === '0');
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'Poloniex',
    api_doc: 'https://docs.poloniex.com/',
    websocket_endpoint: 'wss://api2.poloniex.com',
    restful_endpoint: 'https://poloniex.com/public',
    is_dex: false,
    status: true,
    maker_fee: 0.0015, // see https://poloniex.com/fees/
    taker_fee: 0.0025,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
