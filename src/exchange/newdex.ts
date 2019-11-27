import { strict as assert } from 'assert';
import { ExchangeInfo } from '../pojo/exchange_info';
import { NewdexPairInfo } from '../pojo/pair_info';
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

function extractRawPair(pairInfo: NewdexPairInfo): string {
  return pairInfo.pair_symbol;
}

function extractNormalizedPair(pairInfo: NewdexPairInfo): string {
  return `${pairInfo.base_symbol.sym.split(',')[1]}_${pairInfo.quote_symbol.sym.split(',')[1]}`;
}

export async function getPairs(): Promise<NewdexPairInfo[]> {
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

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.exchange_name = 'Newdex';
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    /* eslint-enable no-param-reassign */
  });

  return arr;
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'Newdex',
    api_doc: 'https://github.com/newdex/api-docs',
    websocket_endpoint: 'wss://ws.newdex.io',
    restful_endpoint: 'https://api.newdex.io/v1',
    is_dex: true,
    blockchain: 'EOS',
    status: true,
    maker_fee: 0.002,
    taker_fee: 0.002,
    pairs: [],
  } as ExchangeInfo;

  const globalConfig = await getGlobalConfig();
  info.status = globalConfig.status;
  info.maker_fee = globalConfig.maker_fee;
  info.taker_fee = globalConfig.taker_fee;

  info.pairs = await getPairs();
  return info;
}
