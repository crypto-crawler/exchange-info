import { PairInfo } from './pair_info';

export interface ExchangeInfo {
  name: string;

  api_doc: string;

  websocket_endpoint: string;

  restful_endpoint: string;

  is_dex: boolean;

  blockchain?: 'EOS' | 'Etheruem'; // What blockchain it is running on if is_dex=true

  status: boolean; // true, running; false, in maintenance.

  maker_fee: number;

  taker_fee: number;

  pairs: PairInfo[];
}
