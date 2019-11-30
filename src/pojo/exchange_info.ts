import { PairInfo } from './pair_info';
import { SupportedExchange } from '../exchange/supported_exchange';

export interface ExchangeInfo {
  name: SupportedExchange;
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
