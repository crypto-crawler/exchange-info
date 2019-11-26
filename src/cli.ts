#!/usr/bin/env node
/* eslint-disable no-console */
import yargs from 'yargs';
import getExchangeInfo from './index';

const { argv } = yargs.options({
  exchange: {
    choices: ['Newdex', 'WhaleEx', 'Binance'],
    type: 'string',
    demandOption: true,
  },
});

(async () => {
  const result = await getExchangeInfo(argv.exchange as 'Newdex' | 'WhaleEx' | 'Binance');
  console.info(result);
})();
