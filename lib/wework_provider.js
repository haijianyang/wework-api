const request = require('request-promise');

/**
 * 服务商相关API
 */
class WeworkProvider {
  /**
   * @param config { corpid, secret }
   * @param store
   */
  constructor(config, store) {
    this.config = config;
    this.store = store;
    this.prefix = 'https://qyapi.weixin.qq.com/cgi-bin';
  }

  async getProviderAccessToken() {
    let accessToken = await this.store.get(`wework:provider:${this.config.corpid}:token`);
    if (accessToken) {
      accessToken = JSON.parse(accessToken);
      if (Date.now() < accessToken.expires) {
        return accessToken.token;
      }
    }

    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/service/get_provider_token`,
      body: {
        corpid: this.config.corpid,
        provider_secret: this.config.secret
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取服务商Token失败 ${res.errcode} ${res.errmsg}`);
    }

    accessToken = {
      token: res.provider_access_token,
      expires: (Date.now() + ((res.expires_in - 10) * 1000))
    };

    await this.store.setex(
      `wework:provider:${this.config.corpid}:token`,
      res.expires_in - 10,
      JSON.stringify(accessToken)
    );

    return accessToken.token;
  }

  async getLoginInfo(authCode) {
    const accessToken = await this.getProviderAccessToken();

    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/service/get_login_info?access_token=${accessToken}`,
      body: {
        auth_code: authCode
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取登录用户信息 ${res.errcode} ${res.errmsg}`);
    }

    return res;
  }

  /* 定制化注册 */

  async getRegisterCode(templateId, corpName, adminName, adminMobile) {
    const accessToken = await this.getProviderAccessToken();
    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/service/get_register_code?provider_access_token=${accessToken}`,
      body: {
        template_id: templateId,
        corp_name: corpName,
        admin_name: adminName,
        admin_mobile: adminMobile
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取注册码失败 ${res.errcode} ${res.errmsg}`);
    }

    return res;
  }

  async setContactSyncSuccess(accessToken) {
    const res = await request({
      method: 'GET',
      uri: `${this.prefix}/sync/contact_sync_success`,
      qs: {
        access_token: accessToken
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取注册码失败 ${res.errcode} ${res.errmsg}`);
    }

    return res;
  }

  /* register */

  getRegisterUrl(registerCode) {
    return `https://open.work.weixin.qq.com/3rdservice/wework/register?register_code=${registerCode}`;
  }
}

module.exports = WeworkProvider;
