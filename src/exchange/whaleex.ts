import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { WhaleExPairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: WhaleExPairInfo): string {
  return pairInfo.name;
}

function extractNormalizedPair(pairInfo: WhaleExPairInfo): string {
  return `${pairInfo.baseCurrency}_${pairInfo.quoteCurrency}`;
}

export async function getPairs(): Promise<WhaleExPairInfo[]> {
  const response = await axios.get('https://api.whaleex.com/BUSINESS/api/public/symbol');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  const arr = response.data as Array<WhaleExPairInfo>;

  arr.forEach(p => {
    /* eslint-disable no-param-reassign */
    p.raw_pair = extractRawPair(p);
    p.normalized_pair = extractNormalizedPair(p);
    /* eslint-enable no-param-reassign */
  });

  return arr.filter(
    x => x.enable && parseFloat(x.baseVolume) > 0 && parseFloat(x.priceChangePercent) !== 0,
  );
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
