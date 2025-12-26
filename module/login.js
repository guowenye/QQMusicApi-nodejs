/**
 * 登录相关 API
 */
const axios = require('axios');
const { apiRequest } = require('../util/request');

// hash33 算法
function hash33(str, hash = 0) {
  for (let i = 0; i < str.length; i++) {
    hash += (hash << 5) + str.charCodeAt(i);
  }
  return hash & 0x7fffffff;
}

/**
 * 获取 QQ 登录二维码
 */
async function getQQQrCode(query, request) {
  try {
    const response = await axios.get('https://ssl.ptlogin2.qq.com/ptqrshow', {
      params: {
        appid: 716027609,
        e: 2,
        l: 'M',
        s: 3,
        d: 72,
        v: 4,
        t: Math.random(),
        daid: 383,
        pt_3rd_aid: 100497308,
      },
      headers: { Referer: 'https://xui.ptlogin2.qq.com/' },
      responseType: 'arraybuffer',
    });

    const cookies = response.headers['set-cookie'] || [];
    let qrsig = '';
    for (const cookie of cookies) {
      const match = cookie.match(/qrsig=([^;]+)/);
      if (match) {
        qrsig = match[1];
        break;
      }
    }

    const qrcode = Buffer.from(response.data).toString('base64');

    return {
      status: 200,
      body: {
        code: 0,
        data: {
          type: 'qq',
          qrcode: `data:image/png;base64,${qrcode}`,
          qrsig,
        },
      },
    };
  } catch (error) {
    return { status: 500, body: { code: 500, msg: error.message } };
  }
}

/**
 * 获取微信登录二维码
 */
async function getWXQrCode(query, request) {
  try {
    const response = await axios.get('https://open.weixin.qq.com/connect/qrconnect', {
      params: {
        appid: 'wx48db31d50e334801',
        redirect_uri: 'https://y.qq.com/portal/wx_redirect.html?login_type=2&surl=https://y.qq.com/',
        response_type: 'code',
        scope: 'snsapi_login',
        state: 'STATE',
        href: 'https://y.qq.com/mediastyle/music_v17/src/css/popup_wechat.css#wechat_redirect',
      },
    });

    const uuidMatch = response.data.match(/uuid=(.+?)"/);
    if (!uuidMatch) {
      return { status: 500, body: { code: 500, msg: '获取 uuid 失败' } };
    }
    const uuid = uuidMatch[1];

    const qrcodeResp = await axios.get(`https://open.weixin.qq.com/connect/qrcode/${uuid}`, {
      headers: { Referer: 'https://open.weixin.qq.com/connect/qrconnect' },
      responseType: 'arraybuffer',
    });

    const qrcode = Buffer.from(qrcodeResp.data).toString('base64');

    return {
      status: 200,
      body: {
        code: 0,
        data: {
          type: 'wx',
          qrcode: `data:image/jpeg;base64,${qrcode}`,
          uuid,
        },
      },
    };
  } catch (error) {
    return { status: 500, body: { code: 500, msg: error.message } };
  }
}

/**
 * 检查 QQ 二维码状态
 */
async function checkQQQrCode(query, request) {
  const { qrsig } = query;
  if (!qrsig) {
    return { status: 400, body: { code: 400, msg: '缺少 qrsig 参数' } };
  }

  const ptqrtoken = hash33(qrsig);

  try {
    const response = await axios.get('https://ssl.ptlogin2.qq.com/ptqrlogin', {
      params: {
        u1: 'https://graph.qq.com/oauth2.0/login_jump',
        ptqrtoken,
        ptredirect: 0,
        h: 1,
        t: 1,
        g: 1,
        from_ui: 1,
        ptlang: 2052,
        action: `0-0-${Date.now()}`,
        js_ver: 20102616,
        js_type: 1,
        pt_uistyle: 40,
        aid: 716027609,
        daid: 383,
        pt_3rd_aid: 100497308,
        has_onekey: 1,
      },
      headers: {
        Cookie: `qrsig=${qrsig}`,
        Referer: 'https://xui.ptlogin2.qq.com/',
      },
    });

    const data = response.data;
    const match = data.match(/ptuiCB\('(\d+)','(\d+)','([^']*)','(\d+)','([^']*)','([^']*)'\)/);

    if (!match) {
      return { status: 200, body: { code: -1, msg: '解析失败', data: { raw: data } } };
    }

    const [, code, , url, , msg, nickname] = match;
    const statusCode = parseInt(code);

    // 状态码: 0=成功, 66=未扫码, 67=已扫码待确认, 65=二维码过期, 68=拒绝登录
    const statusMap = {
      0: { status: 'success', message: '登录成功' },
      66: { status: 'waiting', message: '等待扫码' },
      67: { status: 'scanned', message: '已扫码，等待确认' },
      65: { status: 'expired', message: '二维码已过期' },
      68: { status: 'refused', message: '拒绝登录' },
    };

    const result = statusMap[statusCode] || { status: 'unknown', message: msg };

    if (statusCode === 0 && url) {
      // 提取 sigx 和 uin
      const sigxMatch = url.match(/&ptsigx=(.+?)&s_url/);
      const uinMatch = url.match(/&uin=(.+?)&service/);

      return {
        status: 200,
        body: {
          code: 0,
          data: {
            ...result,
            nickname,
            url,
            sigx: sigxMatch ? sigxMatch[1] : '',
            uin: uinMatch ? uinMatch[1] : '',
          },
        },
      };
    }

    return {
      status: 200,
      body: {
        code: statusCode === 0 ? 0 : statusCode,
        data: result,
      },
    };
  } catch (error) {
    return { status: 500, body: { code: 500, msg: error.message } };
  }
}

/**
 * 检查微信二维码状态
 */
async function checkWXQrCode(query, request) {
  const { uuid } = query;
  if (!uuid) {
    return { status: 400, body: { code: 400, msg: '缺少 uuid 参数' } };
  }

  try {
    const response = await axios.get('https://lp.open.weixin.qq.com/connect/l/qrconnect', {
      params: { uuid, _: Date.now() },
      headers: { Referer: 'https://open.weixin.qq.com/' },
      timeout: 30000,
    });

    const match = response.data.match(/window\.wx_errcode=(\d+);window\.wx_code='([^']*)'/);
    if (!match) {
      return { status: 200, body: { code: -1, msg: '解析失败' } };
    }

    const [, errcode, wxCode] = match;
    const statusCode = parseInt(errcode);

    const statusMap = {
      405: { status: 'success', message: '登录成功' },
      408: { status: 'waiting', message: '等待扫码' },
      404: { status: 'scanned', message: '已扫码，等待确认' },
      403: { status: 'refused', message: '拒绝登录' },
    };

    const result = statusMap[statusCode] || { status: 'unknown', message: '未知状态' };

    if (statusCode === 405 && wxCode) {
      return {
        status: 200,
        body: {
          code: 0,
          data: {
            ...result,
            wxCode,
          },
        },
      };
    }

    return {
      status: 200,
      body: {
        code: statusCode === 405 ? 0 : statusCode,
        data: result,
      },
    };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return { status: 200, body: { code: 408, data: { status: 'waiting', message: '等待扫码' } } };
    }
    return { status: 500, body: { code: 500, msg: error.message } };
  }
}

/**
 * 发送手机验证码
 */
async function sendPhoneCode(query, request) {
  const { phone, countryCode = 86 } = query;
  if (!phone) {
    return { status: 400, body: { code: 400, msg: '缺少 phone 参数' } };
  }

  const data = await apiRequest(
    'music.login.LoginServer',
    'SendPhoneAuthCode',
    {
      tmeAppid: 'qqmusic',
      phoneNo: String(phone),
      areaCode: String(countryCode),
    },
    { common: { tmeLoginMethod: '3' } }
  );

  const codeMap = {
    0: { status: 'sent', message: '验证码已发送' },
    20276: { status: 'captcha', message: '需要滑块验证', url: data.data?.securityURL },
    100001: { status: 'frequency', message: '操作过于频繁' },
  };

  const result = codeMap[data.code] || { status: 'error', message: data.data?.errMsg || '未知错误' };

  return { status: 200, body: { code: data.code, data: result } };
}

/**
 * 手机验证码登录
 */
async function phoneLogin(query, request) {
  const { phone, code, countryCode = 86 } = query;
  if (!phone || !code) {
    return { status: 400, body: { code: 400, msg: '缺少 phone 或 code 参数' } };
  }

  const data = await apiRequest(
    'music.login.LoginServer',
    'Login',
    {
      code: String(code),
      phoneNo: String(phone),
      areaCode: String(countryCode),
      loginMode: 1,
    },
    { common: { tmeLoginMethod: '3', tmeLoginType: '0' } }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 检查登录状态是否过期
 */
async function checkLoginExpired(query, request) {
  const { musicid, musickey } = query;
  if (!musicid || !musickey) {
    return { status: 400, body: { code: 400, msg: '缺少 musicid 或 musickey 参数' } };
  }

  try {
    await apiRequest(
      'music.UserInfo.userInfoServer',
      'GetLoginUserInfo',
      {},
      { credential: { musicid, musickey } }
    );
    return { status: 200, body: { code: 0, data: { expired: false } } };
  } catch (error) {
    return { status: 200, body: { code: 0, data: { expired: true } } };
  }
}

/**
 * 刷新登录凭证
 */
async function refreshLogin(query, request) {
  const { musicid, musickey, refreshKey, refreshToken, loginType = 1 } = query;
  if (!musicid || !musickey) {
    return { status: 400, body: { code: 400, msg: '缺少 musicid 或 musickey 参数' } };
  }

  const data = await apiRequest(
    'music.login.LoginServer',
    'Login',
    {
      refresh_key: refreshKey || '',
      refresh_token: refreshToken || '',
      musickey,
      musicid,
    },
    { common: { tmeLoginType: String(loginType) }, credential: { musicid, musickey, login_type: loginType } }
  );

  return { status: 200, body: { code: 0, data } };
}

module.exports = {
  '/login/qrcode/qq': getQQQrCode,
  '/login/qrcode/wx': getWXQrCode,
  '/login/qrcode/qq/check': checkQQQrCode,
  '/login/qrcode/wx/check': checkWXQrCode,
  '/login/phone/send': sendPhoneCode,
  '/login/phone': phoneLogin,
  '/login/check': checkLoginExpired,
  '/login/refresh': refreshLogin,
};
