import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { BinancePairInfo } from '../pojo/pair_info';

/* eslint-disable no-param-reassign */
function populateCommonFields(pairInfo: BinancePairInfo): void {
  pairInfo.exchange = 'Binance';
  pairInfo.raw_pair = pairInfo.symbol;
  pairInfo.normalized_pair = `${pairInfo.baseAsset}_${pairInfo.quoteAsset}`;
}
/* eslint-enable no-param-reassign */

type Info = {
  baseAsset: string;
  quoteAsset: string;
  minTradeAmount: string;
  minTickSize: string;
  minOrderValue: string;
  maxMarketOrderQty?: string;
  minMarketOrderQty?: string;
};

async function getPairPrecision(rawPair: string): Promise<Info> {
  const response = await axios.get(
    `https://www.binance.com/gateway-api/v1/public/asset-service/product/get-exchange-info?symbol=${rawPair}`,
  );
  assert.equal(response.status, 200);
  assert.ok(response.data.success);
  return response.data.data[0] as Info;
}

async function populatePrecisions(pairInfos: BinancePairInfo[]): Promise<void> {
  const requests: Promise<Info>[] = [];
  pairInfos.forEach(pairInfo => {
    requests.push(getPairPrecision(pairInfo.raw_pair));
  });
  const infos = await Promise.all(requests);
  assert.equal(infos.length, pairInfos.length);
  for (let i = 0; i < infos.length; i += 1) {
    const pairInfo = pairInfos[i];
    const info = infos[i];
    pairInfo.price_precision = info.minTickSize.length - 2;
    pairInfo.base_precision = info.minTradeAmount.length - 2;
    pairInfo.min_order_volume = parseFloat(info.minTradeAmount);
  }
}

export async function getPairs(): Promise<BinancePairInfo[]> {
  const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = (response.data.symbols as Array<BinancePairInfo>).filter(x => x.status === 'TRADING');

  arr.forEach(p => populateCommonFields(p));

  await populatePrecisions(arr);

  return arr;
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
