import { strict as assert } from 'assert';
import axios from 'axios';
import { ExchangeInfo } from '../pojo/exchange_info';
import { KrakenPairInfo } from '../pojo/pair_info';

function extractRawPair(pairInfo: KrakenPairInfo): string {
  return pairInfo.wsname;
}

function extractNormalizedPair(pairInfo: KrakenPairInfo): string {
  return pairInfo.wsname.replace('/', '_');
}

export async function getPairs(): Promise<KrakenPairInfo[]> {
  const response = await axios.get('https://api.kraken.com/0/public/AssetPairs');
  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  assert.equal(response.data.error.length, 0);

  const arr = Object.values(response.data.result) as Array<KrakenPairInfo>;
  arr
    .filter(x => x.wsname)
    .forEach(p => {
      /* eslint-disable no-param-reassign */
      p.raw_pair = extractRawPair(p);
      p.normalized_pair = extractNormalizedPair(p);
      /* eslint-enable no-param-reassign */
    });

  return arr;
}

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const info = {
    name: 'Kraken',
    api_doc: 'https://docs.kraken.com/websockets/',
    websocket_endpoint: 'ws.kraken.com',
    restful_endpoint: 'https://api.kraken.com',
    is_dex: true,
    blockchain: 'EOS',
    status: true,
    maker_fee: 0.0016, // see https://support.kraken.com/hc/en-us/articles/360000526126-What-are-Maker-and-Taker-fees-
    taker_fee: 0.0026,
    pairs: [],
  } as ExchangeInfo;

  info.pairs = await getPairs();
  return info;
}
