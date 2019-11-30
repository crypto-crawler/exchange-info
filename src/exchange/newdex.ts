import { strict as assert } from 'assert';
import { ExchangeInfo } from '../pojo/exchange_info';
import { PairInfo, NewdexPairInfo, convertArrayToMap } from '../pojo/pair_info';
import getTableRows from '../blockchain/eos';

export async function getGlobalConfig(): Promise<{
  status: boolean;
  maker_fee: number;
  taker_fee: number;
}> {
  const tableRows = await getTableRows({
    code: 'newdexpublic',
    scope: 'newdexpublic',
    table: 'globalconfig',
  });
  assert.ok(!tableRows.more);

  const arr = tableRows.rows as Array<{
    global_id: number;
    key: string;
    value: string;
    memo: string;
  }>;

  const result = {
    status: arr[1].value === '1',
    taker_fee: parseInt(arr[2].value, 10) / 10000,
    maker_fee: parseInt(arr[3].value, 10) / 10000,
  };
  return result;
}

/* eslint-disable no-param-reassign */
function populateCommonFields(pairInfo: NewdexPairInfo): void {
  pairInfo.exchange = 'Newdex';
  pairInfo.raw_pair = pairInfo.pair_symbol;
  pairInfo.normalized_pair = `${pairInfo.base_symbol.sym.split(',')[1]}_${
    pairInfo.quote_symbol.sym.split(',')[1]
  }`;
  pairInfo.base_precision = parseInt(pairInfo.base_symbol.sym.split(',')[0], 10);
  pairInfo.min_order_volume = 0.01; // TODO
  pairInfo.quote_precision = 4;
}
/* eslint-enable no-param-reassign */

export async function getPairs(): Promise<{ [key: string]: PairInfo }> {
  const arr: NewdexPairInfo[] = [];
  let more = true;
  let lowerBound = 1;
  while (more) {
    // eslint-disable-next-line no-await-in-loop
    const result = await getTableRows({
      code: 'newdexpublic',
      scope: 'newdexpublic',
      table: 'exchangepair',
      lower_bound: lowerBound,
    });
    const pairs = result.rows as NewdexPairInfo[];
    arr.push(...pairs);
    more = result.more;
    if (pairs.length > 0) {
      lowerBound = Math.max(...pairs.map(x => x.pair_id)) + 1;
    }
  }

  arr.forEach(p => populateCommonFields(p));

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'Newdex',
    api_doc: 'https://github.com/newdex/api-docs',
    websocket_endpoint: 'wss://ws.newdex.io',
    restful_endpoint: 'https://api.newdex.io/v1',
    is_dex: true,
    blockchain: 'EOS',
    status: true,
    maker_fee: 0.002,
    taker_fee: 0.002,
    pairs: {},
  };

  const globalConfig = await getGlobalConfig();
  info.status = globalConfig.status;
  info.maker_fee = globalConfig.maker_fee;
  info.taker_fee = globalConfig.taker_fee;

  info.pairs = await getPairs();
  return info;
}
