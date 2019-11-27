# exchange-info

Get everything you need to know about a crypto exchange.

## How to use

```javascript
/* eslint-disable import/no-unresolved,no-console */
const getExchangeInfo = require('exchange-info').default;

(async () => {
  const result = await getExchangeInfo('Newdex');
  console.info(result);
})();
```

## Quickstart

```bash
npx exchange-info --exchange Newdex
```

## Supported Exchanges

- Binance
- Bitfinex
- Bitstamp
- Newdex
- WhaleEx
- bitFlyer
