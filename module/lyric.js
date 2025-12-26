/**
 * 歌词相关 API
 */
const { apiRequest } = require('../util/request');

// QRC 歌词解密 (简化版)
function qrcDecrypt(data) {
  if (!data) return '';
  try {
    return Buffer.from(data, 'base64').toString('utf-8');
  } catch {
    return data;
  }
}

/**
 * 获取歌词
 */
async function getLyric(query, request) {
  const { id, mid, qrc = false, trans = true, roma = false } = query;
  if (!id && !mid) {
    return { status: 400, body: { code: 400, msg: '缺少 id 或 mid 参数' } };
  }

  const params = {
    crypt: 1,
    ct: 11,
    cv: 13020508,
    lrc_t: 0,
    qrc: qrc === 'true' || qrc === true,
    qrc_t: 0,
    roma: roma === 'true' || roma === true,
    roma_t: 0,
    trans: trans === 'true' || trans === true,
    trans_t: 0,
    type: 1,
  };

  if (id) {
    params.songId = parseInt(id);
  } else {
    params.songMid = mid;
  }

  const data = await apiRequest(
    'music.musichallSong.PlayLyricInfo',
    'GetPlayLyricInfo',
    params
  );

  // 解码歌词
  const result = {
    lyric: qrcDecrypt(data.lyric),
    trans: qrcDecrypt(data.trans),
    roma: qrcDecrypt(data.roma),
  };

  return { status: 200, body: { code: 0, data: result } };
}

module.exports = {
  '/lyric': getLyric,
};
