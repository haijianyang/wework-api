import test from 'ava';
import IORedis from 'ioredis';

import { WeworkApp } from '../index';

const redis = new IORedis({ host: '127.0.0.1', port: 6379 });
const config = {
  corpid: 'wwc42c519572f63779',
  appid: 'wwbdeebe5fdfdc445b',
  secret: '86N6bFR6x00jtfjkKCIX8asXN4eDp7l3LLjpHJiIecM'
};

test.before(async (t) => {
  t.context.weworkApp = new WeworkApp(config, redis);
});

test('getSuiteAccessToken', async (t) => {
  await t.context.weworkApp.getSuiteAccessToken();

  t.pass();
});
