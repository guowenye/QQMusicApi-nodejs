/**
 * 专辑相关 API
 */
const { apiRequest } = require('../util/request');

/**
 * 获取专辑封面
 */
async function getAlbumCover(query, request) {
  const { mid, size = 300 } = query;
  if (!mid) {
    return { status: 400, body: { code: 400, msg: '缺少 mid 参数' } };
  }

  const validSizes = [150, 300, 500, 800];
  const s = validSizes.includes(parseInt(size)) ? parseInt(size) : 300;
  const url = `https://y.gtimg.cn/music/photo_new/T002R${s}x${s}M000${mid}.jpg`;

  return { status: 200, body: { code: 0, data: { url } } };
}

/**
 * 获取专辑详情
 */
async function getAlbumDetail(query, request) {
  const { id, mid } = query;
  if (!id && !mid) {
    return { status: 400, body: { code: 400, msg: '缺少 id 或 mid 参数' } };
  }

  const params = id ? { albumId: parseInt(id) } : { albumMId: mid };
  const data = await apiRequest(
    'music.musichallAlbum.AlbumInfoServer',
    'GetAlbumDetail',
    params
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取专辑歌曲列表
 */
async function getAlbumSongs(query, request) {
  const { id, mid, num = 50, page = 1 } = query;
  if (!id && !mid) {
    return { status: 400, body: { code: 400, msg: '缺少 id 或 mid 参数' } };
  }

  const params = {
    begin: (parseInt(page) - 1) * parseInt(num),
    num: parseInt(num),
  };
  if (id) {
    params.albumId = parseInt(id);
  } else {
    params.albumMid = mid;
  }

  const data = await apiRequest(
    'music.musichallAlbum.AlbumSongList',
    'GetAlbumSongList',
    params
  );

  // 提取歌曲信息
  const songs = data.songList ? data.songList.map((s) => s.songInfo) : data;
  return { status: 200, body: { code: 0, data: songs } };
}

/**
 * 获取新专辑列表
 */
async function getNewAlbums(query, request) {
  const { area = 1, num = 20, page = 1 } = query;

  const data = await apiRequest(
    'music.musichallAlbum.AlbumListServer',
    'GetAlbumList',
    {
      area: parseInt(area),
      sin: (parseInt(page) - 1) * parseInt(num),
      num: parseInt(num),
    }
  );

  return { status: 200, body: { code: 0, data } };
}

module.exports = {
  '/album/cover': getAlbumCover,
  '/album/detail': getAlbumDetail,
  '/album/songs': getAlbumSongs,
  '/album/new': getNewAlbums,
};
