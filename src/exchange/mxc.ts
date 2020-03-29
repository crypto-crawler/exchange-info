import { strict as assert } from 'assert';
import axios from 'axios';
import { normalizePair } from 'crypto-pair';
import { ExchangeInfo } from '../pojo/exchange_info';
import { PairInfo } from '../pojo/pair_info';

export async function getPairs(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<{ [key: string]: PairInfo }> {
  const response = await axios.get('https://www.mxc.com/open/api/v1/data/markets_info');
  assert.equal(response.status, 200);
  assert.equal(response.data.code, 200);
  const map = response.data.data as { [key: string]: PairInfo };

  Object.keys(map).forEach((key) => {
    const pairInfo = map[key];
    pairInfo.exchange = 'MXC';
    pairInfo.raw_pair = key;
    pairInfo.normalized_pair = key;
    assert.equal(pairInfo.normalized_pair, normalizePair(pairInfo.raw_pair, 'MXC'));
    pairInfo.price_precision = pairInfo.priceScale;
    pairInfo.base_precision = pairInfo.quantityScale;
    pairInfo.quote_precision = pairInfo.priceScale;
    pairInfo.min_quote_quantity = pairInfo.minAmount;
    pairInfo.spot_enabled = true;
  });

  if (filter === 'All' || filter === 'Spot') return map;
  return {};
}

export async function getExchangeInfo(
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo> {
  const info: ExchangeInfo = {
    name: 'MXC',
    api_doc: 'https://github.com/mxcdevelop/APIDoc',
    websocket_endpoint: 'wss://wbs.mxc.com/socket.io/',
    restful_endpoint: 'https://www.mxc.com',
    is_dex: false,
    status: true,
    maker_fee: 0.002, // see https://www.mxc.com/intro/fees
    taker_fee: 0.002,
    pairs: {},
  };

  info.pairs = await getPairs(filter);
  return info;
}
