import { Logger } from '@node-dlc/logger';
import DlcdClient from '../../../client/DlcdClient';
import { getLogger } from '../../../utils/config';
import { IArguments } from '../../../arguments';
import { Endpoint } from '@node-dlc/daemon';

export const command = 'decoderawdlcaccept [dlcaccept]';

export const describe = 'Decode Raw DlcAccept';

export const builder = {
  apikey: {
    default: '',
  },
};

export async function handler(argv: IArguments): Promise<void> {
  const { host, port, apikey, loglevel, dlcaccept } = argv;
  const logger: Logger = getLogger(loglevel);
  const client = new DlcdClient(host, port, logger, apikey);
  const response = await client.post(`${Endpoint.DlcAccept}/decode`, {
    dlcaccept,
  });
  logger.log(JSON.stringify(response, null, 2));
}