import test from 'ava';
import IORedis from 'ioredis';

import { WeworkCorp } from '../index';

const redis = new IORedis({ host: '127.0.0.1', port: 6379 });
const config = {
  corpid: 'wwc42c519572f63779',
  agentid: 1000002,
  secret: 'aiIBAdbIRCjqk990PMk8zkg6xRn8AlM8tzLrV-kadn0'
};

test.before(async (t) => {
  t.context.weworkCorp = new WeworkCorp(config, redis);
});

test('getAccessToken', async (t) => {
  await t.context.weworkCorp.getAccessToken();

  t.pass();
});

test('getUser', async (t) => {
  const user = await t.context.weworkCorp.getUser('YangHaiJian');

  t.is(user.userid, 'YangHaiJian');
});

test('getUsersByDep', async (t) => {
  const users = await t.context.weworkCorp.getUsersByDep(1);

  t.true(Array.isArray(users));
});

test('getDepartments', async (t) => {
  const departments = await t.context.weworkCorp.getDepartments(1);

  t.true(Array.isArray(departments));
});
