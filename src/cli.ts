#!/usr/bin/env node
/* eslint-disable no-console */
import yargs from 'yargs';
import getExchangeInfo, { SupportedExchange, EXCHANGES } from './index';

const { argv } = yargs.options({
  exchange: {
    choices: EXCHANGES,
    type: 'string',
    demandOption: true,
  },
});

(async () => {
  const result = await getExchangeInfo(argv.exchange as SupportedExchange);
  console.info(result);
})();
