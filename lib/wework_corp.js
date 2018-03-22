
const request = require('request-promise');

/**
 * 应用企业相关API
 */
class WeworkCorp {
  /**
   * @param config { corpid, agentid, secret }
   * @param store
   */
  constructor(config, store) {
    this.config = config; // corpid agentid secret
    this.store = store;
    this.prefix = 'https://qyapi.weixin.qq.com/cgi-bin';
  }

  /**
   * 获取应用AccessToken
   */
  async getAccessToken() {
    let accessToken = await this.store.get(`wework:corp:${this.config.corpid}:${this.config.agentid}:token`);
    if (accessToken) {
      accessToken = JSON.parse(accessToken);
      if (Date.now() < accessToken.expires) {
        return accessToken.token;
      }
    }

    const res = await request({
      method: 'GET',
      uri: `${this.prefix}/gettoken?corpid=${this.config.corpid}&corpsecret=${this.config.secret}`,
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取应用AccessToken失败 ${res.errcode} ${res.errmsg}`);
    }

    accessToken = {
      token: res.access_token,
      expires: (Date.now() + ((res.expires_in - 10) * 1000))
    };

    await this.store.setex(
      `wework:corp:${this.config.corpid}:${this.config.agentid}:token`,
      res.expires_in - 10,
      JSON.stringify(accessToken)
    );

    return accessToken.token;
  }

  /* user */

  async getUser(userid) {
    const accessToken = await this.getAccessToken();
    const res = await request({
      method: 'GET',
      uri: `${this.prefix}/user/get`,
      qs: {
        access_token: accessToken,
        userid
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取成员详情失败 ${res.errcode} ${res.errmsg}`);
    }

    return res;
  }

  async getUsersByDep(departmentId, simple = true, fetchChild = 1) {
    const accessToken = await this.getAccessToken();
    const res = await request({
      method: 'GET',
      uri: `${this.prefix}/user/${simple ? 'simple' : ''}list`,
      qs: {
        access_token: accessToken,
        department_id: departmentId,
        fetch_child: fetchChild
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取部门成员详情失败 ${res.errcode} ${res.errmsg}`);
    }

    return res.userlist;
  }

  /* department */

  async getDepartments(depId) {
    const accessToken = await this.getAccessToken();
    const res = await request({
      method: 'GET',
      uri: `${this.prefix}/department/list`,
      qs: {
        access_token: accessToken,
        id: depId || ''
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取部门列表失败 ${res.errcode} ${res.errmsg}`);
    }

    return res.department;
  }

  /* tag */

  async getTags() {
    const accessToken = await this.getAccessToken();
    const res = await request({
      method: 'GET',
      uri: `${this.prefix}/tag/list`,
      qs: {
        access_token: accessToken
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取标签列表失败 ${res.errcode} ${res.errmsg}`);
    }

    return res.taglist;
  }

  async getTag(tagid) {
    const accessToken = await this.getAccessToken();
    const res = await request({
      method: 'GET',
      uri: `${this.prefix}/tag/get`,
      qs: {
        access_token: accessToken,
        tagid
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取标签成员失败 ${res.errcode} ${res.errmsg}`);
    }

    return res;
  }

  /* upload */

  async upload(data, type, options) {
    const accessToken = await this.getAccessToken();
    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/media/upload?access_token=${accessToken}&type=${type}`,
      formData: {
        file: {
          value: data,
          options
        }
      },
      json: true
    });

    if (res.errcode) {
      throw new Error(`上传文件失败 ${res.errcode} ${res.errmsg}`);
    }

    return res;
  }

  /* message */

  async sendMessage(receivers, message) {
    const accessToken = await this.getAccessToken();
    const res = await request({
      method: 'POST',
      uri: `${this.prefix}/message/send?access_token=${accessToken}`,
      body: Object.assign({
        agentid: this.config.agentid
      }, receivers, message),
      json: true
    });

    if (res.errcode) {
      throw new Error(`发送消息失败 ${res.errcode} ${res.errmsg}`);
    }

    return res;
  }

  /* JSAPI */

  async getJsApiTicket() {
    let jsApiTicket = await this.store.get(`wework:corp:${this.config.corpid}:${this.config.agentid}:jsapiticket`);
    if (jsApiTicket) {
      jsApiTicket = JSON.parse(jsApiTicket);
      if (Date.now() < jsApiTicket.expires) {
        return jsApiTicket.ticket;
      }
    }

    const accessToken = await this.getAccessToken();
    const res = await request({
      method: 'GET',
      uri: `${this.prefix}/get_jsapi_ticket?access_token=${accessToken}`,
      json: true
    });

    if (res.errcode) {
      throw new Error(`获取jsapi_ticket失败 ${res.errcode} ${res.errmsg}`);
    }

    jsApiTicket = {
      ticket: res.ticket,
      expires: (Date.now() + ((res.expires_in - 10) * 1000))
    };

    await this.store.setex(
      `wework:corp:${this.config.corpid}:${this.config.agentid}:jsapiticket`,
      res.expires_in - 10,
      JSON.stringify(jsApiTicket)
    );

    return jsApiTicket.token;
  }

  /* auth */

  getAuthorizeUrl(redirectUri, state, scope = 'snsapi_userinfo') {
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${this.config.appid}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
  }
}

module.exports = WeworkCorp;
