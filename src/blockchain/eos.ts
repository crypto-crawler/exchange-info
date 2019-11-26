import { JsonRpc } from 'eosjs';

const fetch = require('node-fetch'); // node only; not needed in browsers

const EOS_API_ENDPOINTS = [
  'http://eos.infstones.io',
  'https://eos.infstones.io',
  'http://eos.eoscafeblock.com',
  'https://eos.eoscafeblock.com',
  'https://node.betdice.one',
  'http://api.main.alohaeos.com',
  'http://api-mainnet.starteos.io',
  'https://bp.whaleex.com',
  'https://api.zbeos.com',
  'https://node1.zbeos.com',
  'https://api.main.alohaeos.com',
  'https://api.eoslaomao.com',
  'https://api-mainnet.starteos.io',
  'http://peer2.eoshuobipool.com:8181',
  'http://peer1.eoshuobipool.com:8181',
  'https://api.redpacketeos.com',
  'https://mainnet.eoscannon.io',
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
