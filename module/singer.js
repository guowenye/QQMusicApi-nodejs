/**
 * 歌手相关 API
 */
const { apiRequest } = require('../util/request');

// 地区类型
const AreaType = { ALL: -100, CHINA: 200, TAIWAN: 2, AMERICA: 5, JAPAN: 4, KOREA: 3 };
// 性别类型
const SexType = { ALL: -100, MALE: 0, FEMALE: 1, GROUP: 2 };
// 风格类型
const GenreType = { ALL: -100, POP: 7, RAP: 3, CHINESE_STYLE: 19, ROCK: 4, ELECTRONIC: 2, FOLK: 8, R_AND_B: 11 };
// 索引类型
const IndexType = { ALL: -100, HASH: 27 };

/**
 * 获取歌手详情
 */
async function getSingerDetail(query, request) {
  const { mid } = query;
  if (!mid) {
    return { status: 400, body: { code: 400, msg: '缺少 mid 参数' } };
  }

  const mids = Array.isArray(mid) ? mid : [mid];
  const data = await apiRequest(
    'music.musichallSinger.SingerInfoInter',
    'GetSingerDetail',
    { singer_mids: mids, groups: 1, wikis: 1 }
  );

  return { status: 200, body: { code: 0, data: data.singer_list || data } };
}

/**
 * 获取歌手基本信息
 */
async function getSingerInfo(query, request) {
  const { mid } = query;
  if (!mid) {
    return { status: 400, body: { code: 400, msg: '缺少 mid 参数' } };
  }

  const data = await apiRequest(
    'music.UnifiedHomepage.UnifiedHomepageSrv',
    'GetHomepageHeader',
    { SingerMid: mid }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取歌手歌曲列表
 */
async function getSingerSongs(query, request) {
  const { mid, num = 30, begin = 0 } = query;
  if (!mid) {
    return { status: 400, body: { code: 400, msg: '缺少 mid 参数' } };
  }

  const data = await apiRequest(
    'musichall.song_list_server',
    'GetSingerSongList',
    {
      singerMid: mid,
      order: 1,
      number: parseInt(num),
      begin: parseInt(begin),
    }
  );

  const songs = data.songList ? data.songList.map((s) => s.songInfo) : [];
  return {
    status: 200,
    body: {
      code: 0,
      data: {
        total: data.totalNum || 0,
        list: songs,
      },
    },
  };
}

/**
 * 获取歌手专辑列表
 */
async function getSingerAlbums(query, request) {
  const { mid, num = 30, begin = 0 } = query;
  if (!mid) {
    return { status: 400, body: { code: 400, msg: '缺少 mid 参数' } };
  }

  const data = await apiRequest(
    'music.musichallAlbum.AlbumListServer',
    'GetAlbumList',
    {
      singerMid: mid,
      order: 1,
      number: parseInt(num),
      begin: parseInt(begin),
    }
  );

  return {
    status: 200,
    body: {
      code: 0,
      data: {
        total: data.total || 0,
        list: data.albumList || [],
      },
    },
  };
}

/**
 * 获取歌手 MV 列表
 */
async function getSingerMvs(query, request) {
  const { mid, num = 30, begin = 0 } = query;
  if (!mid) {
    return { status: 400, body: { code: 400, msg: '缺少 mid 参数' } };
  }

  const data = await apiRequest(
    'MvService.MvInfoProServer',
    'GetSingerMvList',
    {
      singermid: mid,
      order: 1,
      count: parseInt(num),
      start: parseInt(begin),
    }
  );

  return {
    status: 200,
    body: {
      code: 0,
      data: {
        total: data.total || 0,
        list: data.list || [],
      },
    },
  };
}

/**
 * 获取相似歌手
 */
async function getSimilarSinger(query, request) {
  const { mid, num = 10 } = query;
  if (!mid) {
    return { status: 400, body: { code: 400, msg: '缺少 mid 参数' } };
  }

  const data = await apiRequest(
    'music.SimilarSingerSvr',
    'GetSimilarSingerList',
    { singerMid: mid, number: parseInt(num) }
  );

  return { status: 200, body: { code: 0, data: data.singerlist || [] } };
}

/**
 * 获取歌手列表（热门）
 */
async function getSingerHotList(query, request) {
  const { area = -100, sex = -100, genre = -100 } = query;

  const data = await apiRequest(
    'music.musichallSinger.SingerList',
    'GetSingerList',
    {
      hastag: 0,
      area: parseInt(area),
      sex: parseInt(sex),
      genre: parseInt(genre),
    }
  );

  return { status: 200, body: { code: 0, data: data.hotlist || [] } };
}

/**
 * 获取歌手列表（分类索引）
 */
async function getSingerList(query, request) {
  const { area = -100, sex = -100, genre = -100, index = -100, page = 1 } = query;

  const sin = (parseInt(page) - 1) * 80;
  const data = await apiRequest(
    'music.musichallSinger.SingerList',
    'GetSingerListIndex',
    {
      area: parseInt(area),
      sex: parseInt(sex),
      genre: parseInt(genre),
      index: parseInt(index),
      sin,
      cur_page: parseInt(page),
    }
  );

  return {
    status: 200,
    body: {
      code: 0,
      data: {
        total: data.total || 0,
        list: data.singerlist || [],
      },
    },
  };
}

/**
 * 获取歌手粉丝数
 */
async function getSingerFansNum(query, request) {
  const { mid } = query;
  if (!mid) {
    return { status: 400, body: { code: 400, msg: '缺少 mid 参数' } };
  }

  const mids = Array.isArray(mid) ? mid : mid.split(',');
  const data = await apiRequest(
    'music.concern.RelationServer',
    'GetFollowSingerNum',
    { vec_singer: mids.map((m) => ({ singer_mid: m })) }
  );

  return { status: 200, body: { code: 0, data: data.map || {} } };
}

module.exports = {
  '/singer/detail': getSingerDetail,
  '/singer/info': getSingerInfo,
  '/singer/songs': getSingerSongs,
  '/singer/albums': getSingerAlbums,
  '/singer/mvs': getSingerMvs,
  '/singer/similar': getSimilarSinger,
  '/singer/hot': getSingerHotList,
  '/singer/list': getSingerList,
  '/singer/fans/num': getSingerFansNum,
  AreaType,
  SexType,
  GenreType,
  IndexType,
};
