import test from 'ava';
import IORedis from 'ioredis';

import { WeworkProvider } from '../index';

const redis = new IORedis({ host: '127.0.0.1', port: 6379 });
const config = {
  corpid: 'ww7f18f30b015cc9d4',
  secret: 'wiu_vqEABfqFPGBDZI488KDr8ju9ZGdLObGasHosdcY'
};

test.before(async (t) => {
  t.context.weworkProvider = new WeworkProvider(config, redis);
});

test('getProviderAccessToken', async (t) => {
  await t.context.weworkProvider.getProviderAccessToken();

  t.pass();
});

// test('getLoginInfo', async (t) => {
//   const error = await t.throws(t.context.weworkProvider.getLoginInfo('xxx'));

//   t.pass();
// });

// test('getRegisterCode', async (t) => {
//   t.pass();
// });

// test('setContactSyncSuccess', async (t) => {
//   t.pass();
// });
