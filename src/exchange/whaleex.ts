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
    p.exchange_name = 'WhaleEx';
    p.raw_rair = extractRawPair(p);
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
    websocket_endpoint: 'wss://ws.newdex.io',
    restful_endpoint: 'https://api.whaleex.com',
    is_dex: true,
    blockchain: 'EOS',
    status: true,
    maker_fee: 0.001,
    taker_fee: 0.001,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
