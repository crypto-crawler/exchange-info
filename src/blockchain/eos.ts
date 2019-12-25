import { JsonRpc } from 'eosjs';

const fetch = require('node-fetch'); // node only; not needed in browsers

const EOS_API_ENDPOINTS = [
  'http://api-mainnet.starteos.io',
  'http://api.main.alohaeos.com',
  'http://eos.eoscafeblock.com',
  'http://eos.infstones.io',
  'http://peer1.eoshuobipool.com:8181',
  'http://peer2.eoshuobipool.com:8181',
  'https://api-mainnet.starteos.io',
  'https://api.main.alohaeos.com',
  'https://api.redpacketeos.com',
  'https://api.zbeos.com',
  'https://bp.whaleex.com',
  'https://eos.eoscafeblock.com',
  'https://eos.infstones.io',
  'https://node.betdice.one',
  'https://node1.zbeos.com',
];

function getRandomRpc() {
  const url = EOS_API_ENDPOINTS[Math.floor(Math.random() * EOS_API_ENDPOINTS.length)];
  return new JsonRpc(url, { fetch });
}

export interface TableRows {
  rows: Array<{ [key: string]: any }>;
  more: boolean;
}

export default async function getTableRows({
  code,
  scope,
  table,
  lower_bound = '',
  upper_bound = '',
  limit = 100,
}: {
  code: string;
  scope: string;
  table: string;
  lower_bound?: unknown;
  upper_bound?: unknown;
  limit?: number;
}): Promise<TableRows> {
  const rpc = getRandomRpc();
  return rpc.get_table_rows({
    json: true,
    code,
    scope,
    table,
    lower_bound,
    upper_bound,
    limit,
  });
}
