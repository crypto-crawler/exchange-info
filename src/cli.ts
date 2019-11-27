#!/usr/bin/env node
/* eslint-disable no-console */
import yargs from 'yargs';
import getExchangeInfo, { SupportedExchange } from './index';

const { argv } = yargs.options({
  exchange: {
    choices: ['Binance', 'Bitfinex', 'Bitstamp', 'Newdex', 'WhaleEx', 'bitFlyer'],
    type: 'string',
    demandOption: true,
  },
});

(async () => {
  const result = await getExchangeInfo(argv.exchange as SupportedExchange);
  console.info(result);
})();
