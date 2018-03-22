const WeworkCorp = require('./wework_corp');

/**
 * 第三方应用企业相关API
 */
class WeworkAppCorp extends WeworkCorp {
  /**
   * @param {*} config { corpid, agentid }
   * @param {*} permanentCode
   * @param {*} app
   */
  constructor(config, permanentCode, app) {
    super(config, app.store);

    this.app = app;
    this.permanentCode = permanentCode;
  }

  async getAccessToken() {
    return this.app.getCorpAccessToken(this.config.corpid, this.permanentCode);
  }
}

module.exports = WeworkAppCorp;
