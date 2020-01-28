#!/usr/bin/env node
/* eslint-disable no-console */
import yargs from 'yargs';
import getExchangeInfo, { SupportedExchange, SUPPORTED_EXCHANGES } from './index';

const { argv } = yargs
  // eslint-disable-next-line no-shadow
  .command('$0 <exchange> [filter]', 'Get exchange info', yargs => {
    yargs
      .positional('exchange', {
        choices: SUPPORTED_EXCHANGES,
        type: 'string',
        describe: 'The exchange name',
      })
      .options({
        filter: {
          choices: ['All', 'Spot', 'Futures', 'Swap'],
          type: 'string',
          demandOption: true,
          default: 'All',
        },
      });
  });

(async () => {
  const result = await getExchangeInfo(
    argv.exchange as SupportedExchange,
    argv.filter as 'All' | 'Spot' | 'Futures' | 'Swap',
  );
  console.info(result);
})();
