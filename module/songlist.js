/**
 * 歌单相关 API
 */
const { apiRequest } = require('../util/request');

/**
 * 获取歌单详情
 */
async function getSonglistDetail(query, request) {
  const { id, dirid = 0 } = query;
  if (!id) {
    return { status: 400, body: { code: 400, msg: '缺少 id 参数' } };
  }

  const data = await apiRequest(
    'music.srfDissInfo.DissInfo',
    'CgiGetDiss',
    {
      disstid: parseInt(id),
      dirid: parseInt(dirid),
      song_num: 0,
      song_begin: 0,
      onlysonglist: 0,
      tag: true,
      userinfo: true,
      orderlist: true,
    }
  );

  return {
    status: 200,
    body: {
      code: 0,
      data: {
        dirinfo: data.dirinfo || {},
        total_song_num: data.total_song_num || 0,
        songlist_size: data.songlist_size || 0,
        songlist: data.songlist || [],
        songtag: data.songtag || [],
        orderlist: data.orderlist || [],
      },
    },
  };
}

/**
 * 获取歌单歌曲列表
 */
async function getSonglistSongs(query, request) {
  const { id, dirid = 0, num = 50, page = 1 } = query;
  if (!id) {
    return { status: 400, body: { code: 400, msg: '缺少 id 参数' } };
  }

  const data = await apiRequest(
    'music.srfDissInfo.DissInfo',
    'CgiGetDiss',
    {
      disstid: parseInt(id),
      dirid: parseInt(dirid),
      song_num: parseInt(num),
      song_begin: (parseInt(page) - 1) * parseInt(num),
      onlysonglist: 1,
      tag: false,
      userinfo: false,
      orderlist: false,
    }
  );

  return { status: 200, body: { code: 0, data: data.songlist || [] } };
}

/**
 * 获取歌单分类
 */
async function getSonglistCategory(query, request) {
  const data = await apiRequest(
    'music.playlist.PlaylistSquare',
    'GetAllTag',
    {}
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取分类歌单列表
 */
async function getSonglistByCategory(query, request) {
  const { categoryId = 10000000, sortId = 5, num = 20, page = 1 } = query;

  const data = await apiRequest(
    'music.playlist.PlaylistSquare',
    'GetPlaylistByCategory',
    {
      categoryId: parseInt(categoryId),
      sortId: parseInt(sortId),
      sin: (parseInt(page) - 1) * parseInt(num),
      ein: parseInt(page) * parseInt(num) - 1,
    }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取推荐歌单
 */
async function getRecommendSonglist(query, request) {
  const data = await apiRequest(
    'music.playlist.PlaylistSquare',
    'GetRecommendFeed',
    { From: 0, Size: 25 }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 创建歌单 (需要登录)
 */
async function createSonglist(query, request) {
  const { name } = query;
  if (!name) {
    return { status: 400, body: { code: 400, msg: '缺少 name 参数' } };
  }

  const data = await apiRequest(
    'music.musicasset.PlaylistBaseWrite',
    'AddPlaylist',
    { dirName: name },
    { credential: query.credential }
  );

  return { status: 200, body: { code: 0, data: data.result || data } };
}

/**
 * 删除歌单 (需要登录)
 */
async function deleteSonglist(query, request) {
  const { dirid } = query;
  if (!dirid) {
    return { status: 400, body: { code: 400, msg: '缺少 dirid 参数' } };
  }

  const data = await apiRequest(
    'music.musicasset.PlaylistBaseWrite',
    'DelPlaylist',
    { dirId: parseInt(dirid) },
    { credential: query.credential }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 添加歌曲到歌单 (需要登录)
 */
async function addSongsToSonglist(query, request) {
  const { dirid = 1, songIds } = query;
  if (!songIds) {
    return { status: 400, body: { code: 400, msg: '缺少 songIds 参数' } };
  }

  const ids = Array.isArray(songIds) ? songIds : songIds.split(',').map(Number);
  const data = await apiRequest(
    'music.musicasset.PlaylistDetailWrite',
    'AddSonglist',
    {
      dirId: parseInt(dirid),
      v_songInfo: ids.map((id) => ({ songType: 0, songId: id })),
    },
    { credential: query.credential }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 从歌单删除歌曲 (需要登录)
 */
async function delSongsFromSonglist(query, request) {
  const { dirid = 1, songIds } = query;
  if (!songIds) {
    return { status: 400, body: { code: 400, msg: '缺少 songIds 参数' } };
  }

  const ids = Array.isArray(songIds) ? songIds : songIds.split(',').map(Number);
  const data = await apiRequest(
    'music.musicasset.PlaylistDetailWrite',
    'DelSonglist',
    {
      dirId: parseInt(dirid),
      v_songInfo: ids.map((id) => ({ songType: 0, songId: id })),
    },
    { credential: query.credential }
  );

  return { status: 200, body: { code: 0, data } };
}

module.exports = {
  '/songlist/detail': getSonglistDetail,
  '/songlist/songs': getSonglistSongs,
  '/songlist/category': getSonglistCategory,
  '/songlist/list': getSonglistByCategory,
  '/songlist/recommend': getRecommendSonglist,
  '/songlist/create': createSonglist,
  '/songlist/delete': deleteSonglist,
  '/songlist/add/songs': addSongsToSonglist,
  '/songlist/del/songs': delSongsFromSonglist,
};
