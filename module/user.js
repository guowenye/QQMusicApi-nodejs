/**
 * 用户相关 API
 */
const { apiRequest } = require('../util/request');
const axios = require('axios');

/**
 * 通过 musicid 获取 encrypt_uin
 */
async function getEuin(query, request) {
  const { musicid } = query;
  if (!musicid) {
    return { status: 400, body: { code: 400, msg: '缺少 musicid 参数' } };
  }

  try {
    const resp = await axios.get('https://c6.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg', {
      params: { ct: 20, cv: 4747474, cid: 205360838, userid: musicid },
    });
    const euin = resp.data?.data?.creator?.encrypt_uin || '';
    return { status: 200, body: { code: 0, data: { euin } } };
  } catch (error) {
    return { status: 500, body: { code: 500, msg: error.message } };
  }
}

/**
 * 通过 encrypt_uin 反查 musicid
 */
async function getMusicid(query, request) {
  const { euin } = query;
  if (!euin) {
    return { status: 400, body: { code: 400, msg: '缺少 euin 参数' } };
  }

  const data = await apiRequest(
    'music.srfDissInfo.DissInfo',
    'CgiGetDiss',
    { disstid: 0, dirid: 201, song_num: 1, enc_host_uin: euin, onlysonglist: 1 }
  );

  const musicid = data.dirinfo?.creator?.musicid || 0;
  return { status: 200, body: { code: 0, data: { musicid: parseInt(musicid) } } };
}

/**
 * 获取用户主页信息
 */
async function getUserHomepage(query, request) {
  const { euin } = query;
  if (!euin) {
    return { status: 400, body: { code: 400, msg: '缺少 euin 参数' } };
  }

  const data = await apiRequest(
    'music.UnifiedHomepage.UnifiedHomepageSrv',
    'GetHomepageHeader',
    { uin: euin, IsQueryTabDetail: 1 },
    { credential: query.credential }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取 VIP 信息 (需要登录)
 */
async function getVipInfo(query, request) {
  const data = await apiRequest(
    'VipLogin.VipLoginInter',
    'vip_login_base',
    {},
    { credential: query.credential }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取用户创建的歌单
 */
async function getUserCreatedSonglist(query, request) {
  const { uin } = query;
  if (!uin) {
    return { status: 400, body: { code: 400, msg: '缺少 uin 参数' } };
  }

  const data = await apiRequest(
    'music.musicasset.PlaylistBaseRead',
    'GetPlaylistByUin',
    { uin: String(uin) },
    { credential: query.credential }
  );

  return { status: 200, body: { code: 0, data: data.v_playlist || [] } };
}

/**
 * 获取用户收藏的歌曲
 */
async function getUserFavSongs(query, request) {
  const { euin, num = 10, page = 1 } = query;
  if (!euin) {
    return { status: 400, body: { code: 400, msg: '缺少 euin 参数' } };
  }

  const data = await apiRequest(
    'music.srfDissInfo.DissInfo',
    'CgiGetDiss',
    {
      disstid: 0,
      dirid: 201,
      tag: true,
      song_begin: parseInt(num) * (parseInt(page) - 1),
      song_num: parseInt(num),
      userinfo: true,
      orderlist: true,
      enc_host_uin: euin,
    },
    { credential: query.credential }
  );

  return {
    status: 200,
    body: {
      code: 0,
      data: {
        dirinfo: data.dirinfo || {},
        total_song_num: data.total_song_num || 0,
        songlist: data.songlist || [],
      },
    },
  };
}

/**
 * 获取用户收藏的歌单
 */
async function getUserFavSonglist(query, request) {
  const { euin, num = 10, page = 1 } = query;
  if (!euin) {
    return { status: 400, body: { code: 400, msg: '缺少 euin 参数' } };
  }

  const data = await apiRequest(
    'music.musicasset.PlaylistFavRead',
    'CgiGetPlaylistFavInfo',
    {
      uin: euin,
      offset: (parseInt(page) - 1) * parseInt(num),
      size: parseInt(num),
    },
    { credential: query.credential }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取用户收藏的专辑
 */
async function getUserFavAlbum(query, request) {
  const { euin, num = 10, page = 1 } = query;
  if (!euin) {
    return { status: 400, body: { code: 400, msg: '缺少 euin 参数' } };
  }

  const data = await apiRequest(
    'music.musicasset.AlbumFavRead',
    'CgiGetAlbumFavInfo',
    {
      euin,
      offset: (parseInt(page) - 1) * parseInt(num),
      size: parseInt(num),
    },
    { credential: query.credential }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取用户收藏的 MV
 */
async function getUserFavMv(query, request) {
  const { euin, num = 10, page = 1 } = query;
  if (!euin) {
    return { status: 400, body: { code: 400, msg: '缺少 euin 参数' } };
  }

  const data = await apiRequest(
    'music.musicasset.MVFavRead',
    'getMyFavMV_v2',
    {
      encuin: euin,
      pagesize: parseInt(num),
      num: parseInt(page) - 1,
    },
    { credential: query.credential }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取关注的歌手
 */
async function getUserFollowSingers(query, request) {
  const { euin, num = 10, page = 1 } = query;
  if (!euin) {
    return { status: 400, body: { code: 400, msg: '缺少 euin 参数' } };
  }

  const data = await apiRequest(
    'music.concern.RelationList',
    'GetFollowSingerList',
    {
      HostUin: euin,
      From: (parseInt(page) - 1) * parseInt(num),
      Size: parseInt(num),
    },
    { credential: query.credential }
  );

  return {
    status: 200,
    body: {
      code: 0,
      data: {
        total: data.Total || 0,
        list: data.List || [],
      },
    },
  };
}

/**
 * 获取粉丝列表
 */
async function getUserFans(query, request) {
  const { euin, num = 10, page = 1 } = query;
  if (!euin) {
    return { status: 400, body: { code: 400, msg: '缺少 euin 参数' } };
  }

  const data = await apiRequest(
    'music.concern.RelationList',
    'GetFansList',
    {
      HostUin: euin,
      From: (parseInt(page) - 1) * parseInt(num),
      Size: parseInt(num),
    },
    { credential: query.credential }
  );

  return {
    status: 200,
    body: {
      code: 0,
      data: {
        total: data.Total || 0,
        list: data.List || [],
      },
    },
  };
}

/**
 * 获取关注的用户
 */
async function getUserFollows(query, request) {
  const { euin, num = 10, page = 1 } = query;
  if (!euin) {
    return { status: 400, body: { code: 400, msg: '缺少 euin 参数' } };
  }

  const data = await apiRequest(
    'music.concern.RelationList',
    'GetFollowUserList',
    {
      HostUin: euin,
      From: (parseInt(page) - 1) * parseInt(num),
      Size: parseInt(num),
    },
    { credential: query.credential }
  );

  return {
    status: 200,
    body: {
      code: 0,
      data: {
        total: data.Total || 0,
        list: data.List || [],
      },
    },
  };
}

/**
 * 获取好友列表 (需要登录)
 */
async function getUserFriends(query, request) {
  const { num = 10, page = 1 } = query;

  const data = await apiRequest(
    'music.homepage.Friendship',
    'GetFriendList',
    {
      PageSize: parseInt(num),
      Page: parseInt(page) - 1,
    },
    { credential: query.credential }
  );

  return {
    status: 200,
    body: {
      code: 0,
      data: {
        total: data.Friends?.length || 0,
        list: data.Friends || [],
      },
    },
  };
}

/**
 * 获取音乐基因
 */
async function getMusicGene(query, request) {
  const { euin } = query;
  if (!euin) {
    return { status: 400, body: { code: 400, msg: '缺少 euin 参数' } };
  }

  const data = await apiRequest(
    'music.recommend.UserProfileSettingSvr',
    'GetProfileReport',
    { VisitAccount: euin },
    { credential: query.credential }
  );

  return { status: 200, body: { code: 0, data } };
}

module.exports = {
  '/user/euin': getEuin,
  '/user/musicid': getMusicid,
  '/user/homepage': getUserHomepage,
  '/user/vip': getVipInfo,
  '/user/songlist/created': getUserCreatedSonglist,
  '/user/fav/songs': getUserFavSongs,
  '/user/fav/songlist': getUserFavSonglist,
  '/user/fav/album': getUserFavAlbum,
  '/user/fav/mv': getUserFavMv,
  '/user/follow/singers': getUserFollowSingers,
  '/user/fans': getUserFans,
  '/user/follows': getUserFollows,
  '/user/friends': getUserFriends,
  '/user/music/gene': getMusicGene,
};
