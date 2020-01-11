#!/usr/bin/env node
/* eslint-disable no-console */
import yargs from 'yargs';
import { EXCHANGES, SupportedExchange } from './exchange/supported_exchange';
import getExchangeInfo from './index';

const { argv } = yargs.options({
  exchange: {
    choices: EXCHANGES,
    type: 'string',
    demandOption: true,
  },
  filter: {
    choices: ['All', 'Spot', 'Futures', 'Swap'],
    type: 'string',
    demandOption: true,
    default: 'All',
  },
});

(async () => {
  const result = await getExchangeInfo(
    argv.exchange as SupportedExchange,
    argv.filter as 'All' | 'Spot' | 'Futures' | 'Swap',
  );
  console.info(result);
})();
