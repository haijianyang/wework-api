# wework-api

## wework-api轻封装了企业微信应用的API，适用于企业应用和第三方应用。

# Installation
```js
npm install wework-crypt
```

# Documentation
* class WeworkApp 第三方应用相关API
* class WeworkAppCorp 第三方应用企业相关API(第三方应用调用企业的接口)
* class WeworkCorp 应用企业相关API
* class WeworkProvider 服务商相关API

# Getting started

## 企业应用
```js
const IORedis require('ioredis');
const wework = require('wework-crypt');

const redis = new IORedis({ host: '127.0.0.1', port: 6379 });

const config = {
  corpid: 'wwc42c519572f63779',
  agentid: 1000002,
  secret: 'aiIBAdbIRCjqk990PMk8zkg6xRn8AlM8tzLrV-kadn0'
};

// 生成企业API实例
const weworkCorp = new wework.WeworkCorp(config, redis);

// 调用企业相关接口
await weworkCorp.getUser('YangHaiJian'); // 根据userid获取用户信息
```

## 第三方企业应用
```js
const IORedis require('ioredis');
const wework = require('wework-crypt');

const redis = new IORedis({ host: '127.0.0.1', port: 6379 });

const config = {
  corpid: 'ww7f18f30b015cc9d4',
  secret: 'wiu_vqEABfqFPGBDZI488KDr8ju9ZGdLObGasHosdcY'
};

// 生成服务商API实例
const weworkProvider = new wework.WeworkProvider(config, redis);

// 调用服务商相关接口
await weworkProvider.getProviderAccessToken();
```

```js
const IORedis require('ioredis');
const wework = require('wework-crypt');

const redis = new IORedis({ host: '127.0.0.1', port: 6379 });

const config = {
  corpid: 'wwc42c519572f63779',
  appid: 'wwbdeebe5fdfdc445b',
  secret: '86N6bFR6x00jtfjkKCIX8asXN4eDp7l3LLjpHJiIecM'
};

// 生成第三方应用API实例
const weworkApp = new wework.WeworkApp(config, redis);

// 调用第三方应用相关接口
await weworkApp.getSuiteAccessToken();


const corp = {
  corpid: 'wwc42c519572f63779',
  agentid: 1000002,
  permanentCode: 'Z3aBAr0J7LGS3QfA2ihhvyL1NeRHM4gLNZ0W6gJ0MNg'
};

// 生成第三方应用企业API实例
const weworkCorp = weworkApp.createCorpApi(corp.corpid, corp.agentid, corp.permanentCode);
// 调用第三方应用企业相关接口，和正常的应用企业接口一样。
await weworkCorp.getUser('YangHaiJian'); // 根据userid获取用户信息
```
