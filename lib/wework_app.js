const request = require('request-promise');

const WeworkAppCorp = require('./wework_app_corp');

/**
 * 第三方应用相关API
 */
class WeworkApp {
  /**
   * @param config { corpid, appid, secret }
   * @param store
   */
  constructor(config, store) {
    this.config = config;
    this.store = store;
    this.prefix = 'https://qyapi.weixin.qq.com/cgi-bin';
  }

  createCorpApi(corpid, agentid, permanentCode) {
    return new WeworkAppCorp({ corpid, agentid }, permanentCode, this);
  }

  /* 第三方接口 */

  async setSuiteTicket(ticket) {
    await this.store.set(`wework:app:${this.config.appid}:ticket`, ticket);
  }

  async getSuiteTicket() {
    const ticket = await this.store.get(`wework:app:${this.config.appid}:ticket`);

    return ticket;
  }

  async getSuiteAccessToken() {
    let suiteAccessToken = await this.store.get(`wework:app:${this.config.appid}:token`);
    if (suiteAccessToken) {
      suiteAccessToken = JSON.parse(suiteAccessToken);
      if (Date.now() < suiteAccessToken.expires) {
        return suiteAccessToken.token;
      }
    }

    const suiteTicket = await this.getSuiteTicket();
    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/service/get_suite_token`,
      body: {
        suite_id: this.config.appid,
        suite_secret: this.config.secret,
        suite_ticket: suiteTicket
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取SuiteAccessToken失败 ${res.errcode} ${res.errmsg}`);
    }

    suiteAccessToken = {
      token: res.suite_access_token,
      expires: (Date.now() + ((res.expires_in - 10) * 1000))
    };

    await this.store.setex(
      `wework:app:${this.config.appid}:token`,
      res.expires_in - 10,
      JSON.stringify(suiteAccessToken)
    );

    return suiteAccessToken.token;
  }

  async getPreAuthCode() {
    const suiteAccessToken = await this.getSuiteAccessToken();
    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/service/get_pre_auth_code?suite_access_token=${suiteAccessToken}`,
      body: {
        suite_id: this.config.appid
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取预授权码失败 ${res.errcode} ${res.errmsg}`);
    }

    // for test app
    // await this.setSessionInfo(res.pre_auth_code);

    return res;
  }

  async setSessionInfo(preAuthCode, appid, authType = 1) {
    const suiteAccessToken = await this.getSuiteAccessToken();
    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/service/set_session_info?suite_access_token=${suiteAccessToken}`,
      body: {
        pre_auth_code: preAuthCode,
        session_info: {
          appid,
          auth_type: authType
        }
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`设置授权配置失败 ${res.errcode} ${res.errmsg}`);
    }
  }

  async getPermanentCode(authCode) {
    const suiteAccessToken = await this.getSuiteAccessToken();
    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/service/get_permanent_code?suite_access_token=${suiteAccessToken}`,
      body: {
        suite_id: this.config.appid,
        auth_code: authCode
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取PermanentCode失败 ${res.errcode} ${res.errmsg}`);
    }

    return res;
  }

  async getAuthInfo(corpid, permanentCode) {
    const suiteAccessToken = await this.getSuiteAccessToken();
    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/service/get_auth_info?suite_access_token=${suiteAccessToken}`,
      body: {
        suite_id: this.config.appid,
        auth_corpid: corpid,
        permanent_code: permanentCode
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取企业授权信息失败 ${res.errcode} ${res.errmsg}`);
    }

    return res;
  }

  async deleteCorpAccessToken(corpid) {
    await this.store.del(`wework:app:${this.config.appid}:corp:${corpid}:token`);
  }

  async getCorpAccessToken(corpid, permanentCode) {
    let corpAccessToken = await this.store.get(`wework:app:${this.config.appid}:corp:${corpid}:token`);
    if (corpAccessToken) {
      corpAccessToken = JSON.parse(corpAccessToken);
      if (Date.now() < corpAccessToken.expires) {
        return corpAccessToken.token;
      }
    }

    const suiteAccessToken = await this.getSuiteAccessToken();
    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/service/get_corp_token?suite_access_token=${suiteAccessToken}`,
      body: {
        suite_id: this.config.appid,
        auth_corpid: corpid,
        permanent_code: permanentCode
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取企业AccessToken失败 ${res.errcode} ${res.errmsg}`);
    }

    corpAccessToken = {
      token: res.access_token,
      expires: (Date.now() + ((res.expires_in - 10) * 1000))
    };

    await this.store.setex(
      `wework:app:${this.config.appid}:corp:${corpid}:token`,
      res.expires_in - 10,
      JSON.stringify(corpAccessToken)
    );

    return corpAccessToken.token;
  }

  async getAdminList(corpid, agentid) {
    const suiteAccessToken = await this.getSuiteAccessToken();
    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/service/get_admin_list?suite_access_token=${suiteAccessToken}`,
      body: {
        auth_corpid: corpid,
        agentid
      },
      json: true
    });

    if (res.errcode !== 0) {
      throw new Error(`获取管理员列表失败 ${res.errcode} ${res.errmsg}`);
    }

    return res.admin;
  }

  /* auth user */

  async getUserInfo3rd(code) {
    const accessToken = await this.getSuiteAccessToken();
    const res = await request({
      method: 'GET',
      uri: `${this.prefix}/service/getuserinfo3rd`,
      qs: {
        code,
        access_token: accessToken
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`wework_app_${res.errcode}-获取企业成员信息失败 ${res.errmsg}`);
    }

    return res;
  }

  async getUserDetail3rd(userTicket) {
    const accessToken = await this.getSuiteAccessToken();
    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/service/getuserdetail3rd?access_token=${accessToken}`,
      body: {
        user_ticket: userTicket
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取成员详情失败 ${res.errcode} ${res.errmsg}`);
    }

    return res;
  }

  /* install */

  get3rdAppInstallUrl(preAuthCode, redirectUri, state) {
    return `https://open.work.weixin.qq.com/3rdapp/install?suite_id=${this.config.appid}&pre_auth_code=${preAuthCode}&redirect_uri=${redirectUri}&state=${state}`;
  }

  /* auth */

  get3rdQrConnectUrl(redirectUri, state, usertype = 'member') {
    return `https://open.work.weixin.qq.com/wwopen/sso/3rd_qrConnect?appid=${this.config.corpid}&redirect_uri=${redirectUri}&state=${state}&usertype=${usertype}`;
  }

  getAuthorizeUrl(redirectUri, state, scope = 'snsapi_userinfo') {
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${this.config.appid}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
  }
}

module.exports = WeworkApp;
