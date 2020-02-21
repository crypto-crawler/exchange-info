import { strict as assert } from 'assert';
import axios from 'axios';
import { normalizePair } from 'crypto-pair';
import { ExchangeInfo } from '../pojo/exchange_info';
import { BinancePairInfo, convertArrayToMap, PairInfo } from '../pojo/pair_info';
import { calcPrecision } from '../utils';

/* eslint-disable no-param-reassign */
function populateCommonFields(pairInfo: BinancePairInfo): void {
  pairInfo.exchange = 'Binance';
  pairInfo.raw_pair = pairInfo.symbol;
  pairInfo.normalized_pair = `${pairInfo.baseAsset}_${pairInfo.quoteAsset}`;
  assert.equal(pairInfo.normalized_pair, normalizePair(pairInfo.raw_pair, 'Binance'));

  pairInfo.price_precision = calcPrecision(
    pairInfo.filters.filter(x => x.filterType === 'PRICE_FILTER')[0].tickSize,
  );
  pairInfo.base_precision = calcPrecision(
    pairInfo.filters.filter(x => x.filterType === 'LOT_SIZE')[0].stepSize,
  );
  pairInfo.quote_precision = pairInfo.quotePrecision;
  pairInfo.min_quote_quantity = parseFloat(
    pairInfo.filters.filter(x => x.filterType === 'MIN_NOTIONAL')[0].minNotional,
  );
  pairInfo.min_base_quantity = parseFloat(
    pairInfo.filters.filter(x => x.filterType === 'LOT_SIZE')[0].minQty,
  );
  pairInfo.spot_enabled = pairInfo.isSpotTradingAllowed;
  pairInfo.futures_enabled = pairInfo.isMarginTradingAllowed;

  pairInfo.filters.forEach(f => {
    delete f.maxQty;
  });
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
  filters: {
    filterType: string;
    maxPrice: string;
    minPrice: string;
    tickSize: string;
  }[];
};

async function getPairPrecision(rawPair: string): Promise<Info> {
  const response = await axios.get(
    `https://www.binance.com/gateway-api/v1/public/asset-service/product/get-exchange-info?symbol=${rawPair}`,
  );
  assert.equal(response.status, 200);
  assert.ok(response.data.success);
  return response.data.data[0] as Info;
}

// for debug only
export async function populatePrecisions(pairInfos: BinancePairInfo[]): Promise<void> {
  const requests: Promise<Info>[] = [];
  pairInfos.forEach(pairInfo => {
    requests.push(getPairPrecision(pairInfo.raw_pair));
  });
  const infos = await Promise.all(requests);
  assert.equal(infos.length, pairInfos.length);
  for (let i = 0; i < infos.length; i += 1) {
    const pairInfo = pairInfos[i];
    const info = infos[i];
    assert.equal(pairInfo.price_precision, calcPrecision(info.minTickSize));
    assert.equal(pairInfo.base_precision, calcPrecision(info.minTradeAmount));
    assert.equal(pairInfo.min_quote_quantity, parseFloat(info.minOrderValue));
  }
}

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');

  let arr = response.data.symbols as Array<BinancePairInfo>;
  if (filter !== 'All') {
    arr = arr.filter(x => x.status === 'TRADING');
    switch (filter) {
      case 'Spot':
        arr = arr.filter(x => x.isSpotTradingAllowed);
        break;
      case 'Futures':
        arr = arr.filter(x => x.isMarginTradingAllowed);
        break;
      case 'Swap':
        arr = [];
        break;
      default:
        throw Error(`Unknown filter value ${filter}`);
    }
  }

  arr.forEach(p => populateCommonFields(p));

  // await populatePrecisions(arr);

  return convertArrayToMap(arr);
}

export async function getExchangeInfo(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'Binance',
    api_doc: 'https://github.com/binance-exchange/binance-official-api-docs',
    websocket_endpoint: 'wss://stream.binance.com:9443',
    restful_endpoint: 'https://api.binance.com',
    is_dex: false,
    status: true,
    maker_fee: 0.001, // see https://www.binance.com/en/fee/schedule
    taker_fee: 0.001,
    pairs: {},
  };

  info.pairs = await getPairs(filter);
  return info;
}
