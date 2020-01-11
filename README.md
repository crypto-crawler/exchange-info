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

## Give it a try

```bash
npx exchange-info --exchange Newdex
```

## API Manual

There is only one API in this library:

```typescript
/**
 * Get all informaton about a crypto exchange.
 *
 * @param exchangeName The name of the exchange
 * @param filter All, no filtering; Spot, only spot tradable pairs; Margin, only margin tradable pairs
 */
export default function getExchangeInfo(
  exchangeName: SupportedExchange,
  filter: 'All' | 'Spot' | 'Futures' | 'Swap' = 'All',
): Promise<ExchangeInfo>;
```

Which returns an `ExchangeInfo`:

```typescript
export interface ExchangeInfo {
  name: string;
  api_doc: string;
  websocket_endpoint: string;
  restful_endpoint: string;
  is_dex: boolean; // dex or central
  blockchain?: 'EOS' | 'Etheruem'; // What blockchain it is running on if is_dex=true
  status: boolean; // true, running; false, in maintenance.
  maker_fee: number;
  taker_fee: number;
  pairs: PairInfo[];
}
```

## Supported Exchanges

- Biki
- Binance
- Bitfinex
- Bitstamp
- Coinbase
- Coincheck
- Huobi
- Kraken
- MXC
- Newdex
- OKEx_Spot
- Poloniex
- Upbit
- WhaleEx
- ZB
- Zaif
- bitFlyer
