/**
 * 歌曲相关 API
 */
const { apiRequest, getGuid } = require('../util/request');

// 歌曲文件类型
const SongFileType = {
  MASTER: { s: 'AI00', e: '.flac' },      // 臻品母带
  ATMOS_2: { s: 'Q000', e: '.flac' },     // 臻品全景声
  ATMOS_51: { s: 'Q001', e: '.flac' },    // 臻品音质
  FLAC: { s: 'F000', e: '.flac' },        // 无损
  OGG_640: { s: 'O801', e: '.ogg' },      // OGG 640kbps
  OGG_320: { s: 'O800', e: '.ogg' },      // OGG 320kbps
  OGG_192: { s: 'O600', e: '.ogg' },      // OGG 192kbps
  OGG_96: { s: 'O400', e: '.ogg' },       // OGG 96kbps
  MP3_320: { s: 'M800', e: '.mp3' },      // MP3 320kbps
  MP3_128: { s: 'M500', e: '.mp3' },      // MP3 128kbps
  AAC_192: { s: 'C600', e: '.m4a' },      // AAC 192kbps
  AAC_96: { s: 'C400', e: '.m4a' },       // AAC 96kbps
  AAC_48: { s: 'C200', e: '.m4a' },       // AAC 48kbps
};

/**
 * 获取歌曲信息
 */
async function querySong(query, request) {
  const { id, mid } = query;
  if (!id && !mid) {
    return { status: 400, body: { code: 400, msg: '缺少 id 或 mid 参数' } };
  }

  const ids = id ? (Array.isArray(id) ? id : id.split(',').map(Number)) : [];
  const mids = mid ? (Array.isArray(mid) ? mid : mid.split(',')) : [];
  const values = ids.length > 0 ? ids : mids;

  const params = {
    types: values.map(() => 0),
    modify_stamp: values.map(() => 0),
    ctx: 0,
    client: 1,
  };

  if (ids.length > 0) {
    params.ids = ids;
  } else {
    params.mids = mids;
  }

  const data = await apiRequest(
    'music.trackInfo.UniformRuleCtrl',
    'CgiGetTrackInfo',
    params
  );

  return { status: 200, body: { code: 0, data: data.tracks || data } };
}

/**
 * 获取歌曲详情
 */
async function getDetail(query, request) {
  const { id, mid } = query;
  if (!id && !mid) {
    return { status: 400, body: { code: 400, msg: '缺少 id 或 mid 参数' } };
  }

  const params = id ? { song_id: parseInt(id) } : { song_mid: mid };
  const data = await apiRequest(
    'music.pf_song_detail_svr',
    'get_song_detail_yqq',
    params
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取歌曲播放链接
 */
async function getSongUrl(query, request) {
  const { mid, type = 'MP3_128' } = query;
  if (!mid) {
    return { status: 400, body: { code: 400, msg: '缺少 mid 参数' } };
  }

  const mids = Array.isArray(mid) ? mid : mid.split(',');
  const fileType = SongFileType[type] || SongFileType.MP3_128;
  const domain = 'https://isure.stream.qqmusic.qq.com/';

  const filename = mids.map((m) => `${fileType.s}${m}${m}${fileType.e}`);
  const params = {
    filename,
    guid: getGuid(),
    songmid: mids,
    songtype: mids.map(() => 0),
  };

  const data = await apiRequest(
    'music.vkey.GetVkey',
    'UrlGetVkey',
    params,
    { common: { ct: '19' } }
  );

  const urls = {};
  if (data.midurlinfo) {
    for (const info of data.midurlinfo) {
      const purl = info.purl || info.wifiurl || '';
      urls[info.songmid] = purl ? domain + purl : '';
    }
  }

  return { status: 200, body: { code: 0, data: urls } };
}

/**
 * 获取相似歌曲
 */
async function getSimilarSong(query, request) {
  const { id } = query;
  if (!id) {
    return { status: 400, body: { code: 400, msg: '缺少 id 参数' } };
  }

  const data = await apiRequest(
    'music.recommend.TrackRelationServer',
    'GetSimilarSongs',
    { songid: parseInt(id) }
  );

  return { status: 200, body: { code: 0, data: data.vecSong || [] } };
}

/**
 * 获取歌曲标签
 */
async function getLabels(query, request) {
  const { id } = query;
  if (!id) {
    return { status: 400, body: { code: 400, msg: '缺少 id 参数' } };
  }

  const data = await apiRequest(
    'music.recommend.TrackRelationServer',
    'GetSongLabels',
    { songid: parseInt(id) }
  );

  return { status: 200, body: { code: 0, data: data.labels || [] } };
}

/**
 * 获取相关歌单
 */
async function getRelatedSonglist(query, request) {
  const { id } = query;
  if (!id) {
    return { status: 400, body: { code: 400, msg: '缺少 id 参数' } };
  }

  const data = await apiRequest(
    'music.recommend.TrackRelationServer',
    'GetRelatedPlaylist',
    { songid: parseInt(id) }
  );

  return { status: 200, body: { code: 0, data: data.vecPlaylist || [] } };
}

/**
 * 获取相关 MV
 */
async function getRelatedMv(query, request) {
  const { id, lastMvId } = query;
  if (!id) {
    return { status: 400, body: { code: 400, msg: '缺少 id 参数' } };
  }

  const params = {
    songid: parseInt(id),
    songtype: 1,
  };
  if (lastMvId) {
    params.lastmvid = lastMvId;
  }

  const data = await apiRequest(
    'MvService.MvInfoProServer',
    'GetSongRelatedMv',
    params
  );

  return { status: 200, body: { code: 0, data: data.list || [] } };
}

/**
 * 获取其他版本
 */
async function getOtherVersion(query, request) {
  const { id, mid } = query;
  if (!id && !mid) {
    return { status: 400, body: { code: 400, msg: '缺少 id 或 mid 参数' } };
  }

  const params = id ? { songid: parseInt(id) } : { songmid: mid };
  const data = await apiRequest(
    'music.musichallSong.OtherVersionServer',
    'GetOtherVersionSongs',
    params
  );

  return { status: 200, body: { code: 0, data: data.versionList || [] } };
}

/**
 * 获取歌曲收藏数
 */
async function getFavNum(query, request) {
  const { id } = query;
  if (!id) {
    return { status: 400, body: { code: 400, msg: '缺少 id 参数' } };
  }

  const ids = Array.isArray(id) ? id.map(Number) : id.split(',').map(Number);
  const data = await apiRequest(
    'music.musicasset.SongFavRead',
    'GetSongFansNumberById',
    { v_songId: ids }
  );

  return { status: 200, body: { code: 0, data: data.m_show || {} } };
}

module.exports = {
  '/song/query': querySong,
  '/song/detail': getDetail,
  '/song/url': getSongUrl,
  '/song/similar': getSimilarSong,
  '/song/labels': getLabels,
  '/song/related/songlist': getRelatedSonglist,
  '/song/related/mv': getRelatedMv,
  '/song/other/version': getOtherVersion,
  '/song/fav/num': getFavNum,
  SongFileType,
};
