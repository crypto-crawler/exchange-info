import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { BinancePairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: BinancePairInfo): string {
  return pairInfo.symbol;
}

function extractNormalizedPair(pairInfo: BinancePairInfo): string {
  return `${pairInfo.baseAsset}_${pairInfo.quoteAsset}`;
}

export async function getPairs(): Promise<BinancePairInfo[]> {
  const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = response.data.symbols as Array<BinancePairInfo>;

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.exchange_name = 'Binance';
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    /* eslint-enable no-param-reassign */
  });
  return arr.filter(x => x.status === 'TRADING');
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'Binance',
    api_doc: 'https://github.com/binance-exchange/binance-official-api-docs',
    websocket_endpoint: 'wss://stream.binance.com:9443',
    restful_endpoint: 'https://api.binance.com',
    is_dex: false,
    status: true,
    maker_fee: 0.001, // see https://www.binance.com/en/fee/schedule
    taker_fee: 0.001,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
