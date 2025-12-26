/**
 * QQ音乐请求封装
 */
const axios = require('axios');
const { sign } = require('./sign');

// API 配置
const API_CONFIG = {
  endpoint: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
  enc_endpoint: 'https://u.y.qq.com/cgi-bin/musics.fcg',
  version_code: '13.2.5.8',
  enable_sign: true,
};

// 公共参数
const COMMON_DEFAULTS = {
  ct: '11',
  cv: API_CONFIG.version_code,
  v: API_CONFIG.version_code,
  tmeAppID: 'qqmusic',
  format: 'json',
  inCharset: 'utf-8',
  outCharset: 'utf-8',
};

/**
 * 生成 GUID
 */
function getGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 生成搜索 ID
 */
function getSearchId() {
  return `search_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * 发送 API 请求
 * @param {string} module - 模块名
 * @param {string} method - 方法名
 * @param {Object} params - 请求参数
 * @param {Object} options - 额外选项
 */
async function apiRequest(module, method, params = {}, options = {}) {
  const { credential = {}, common = {} } = options;

  // 构建公共参数
  const commParams = { ...COMMON_DEFAULTS, ...common };
  if (credential.musicid && credential.musickey) {
    commParams.qq = String(credential.musicid);
    commParams.authst = credential.musickey;
    commParams.tmeLoginType = String(credential.login_type || 1);
  }

  // 构建请求数据
  const requestKey = `${module}.${method}`;
  const requestData = {
    comm: commParams,
    [requestKey]: {
      module,
      method,
      param: params,
    },
  };

  // 构建请求配置
  const url = API_CONFIG.enable_sign ? API_CONFIG.enc_endpoint : API_CONFIG.endpoint;
  const requestConfig = {
    method: 'POST',
    url,
    data: requestData,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Referer: 'https://y.qq.com/',
      Origin: 'https://y.qq.com',
    },
  };

  if (API_CONFIG.enable_sign) {
    requestConfig.params = { sign: sign(requestData) };
  }

  // 设置 Cookie
  if (credential.musicid && credential.musickey) {
    requestConfig.headers.Cookie = `uin=${credential.musicid}; qm_keyst=${credential.musickey}; qqmusic_key=${credential.musickey}`;
  }

  try {
    const response = await axios(requestConfig);
    const data = response.data;

    if (data[requestKey]) {
      const result = data[requestKey];
      if (result.code !== 0) {
        throw { code: result.code, message: result.msg || 'API Error', data: result };
      }
      return result.data || result;
    }
    return data;
  } catch (error) {
    if (error.code) throw error;
    throw { code: -1, message: error.message, data: null };
  }
}

module.exports = {
  apiRequest,
  getGuid,
  getSearchId,
  API_CONFIG,
};
