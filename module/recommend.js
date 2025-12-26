/**
 * 推荐相关 API
 */
const { apiRequest } = require('../util/request');

/**
 * 获取首页推荐 Feed
 */
async function getHomeFeed(query, request) {
  const data = await apiRequest(
    'music.recommend.RecommendFeed',
    'get_recommend_feed',
    {
      direction: 0,
      page: 1,
      s_num: 0,
    }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取猜你喜欢
 */
async function getGuessRecommend(query, request) {
  const data = await apiRequest(
    'music.radioProxy.MbTrackRadioSvr',
    'get_radio_track',
    {
      id: 99,
      num: 5,
      from: 0,
      scene: 0,
      song_ids: [],
      ext: { bluetooth: '' },
      should_count_down: 1,
    }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取雷达推荐
 */
async function getRadarRecommend(query, request) {
  const data = await apiRequest(
    'music.recommend.TrackRelationServer',
    'GetRadarSong',
    {
      Page: 1,
      ReqType: 0,
      FavSongs: [],
      EntranceSongs: [],
    }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取每日推荐歌曲
 */
async function getDailyRecommend(query, request) {
  const data = await apiRequest(
    'music.recommend.RecSongListServer',
    'get_daily_recommend_song',
    {}
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取个性化推荐歌单
 */
async function getPersonalizedSonglist(query, request) {
  const data = await apiRequest(
    'music.playlist.PlaylistSquare',
    'GetRecommendFeed',
    { From: 0, Size: 25 }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取新歌推荐
 */
async function getNewSongs(query, request) {
  const { type = 5 } = query;

  const data = await apiRequest(
    'newsong.NewSongServer',
    'get_new_song_info',
    { type: parseInt(type) }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取电台推荐
 */
async function getRadioRecommend(query, request) {
  const data = await apiRequest(
    'music.radiosvr.RadioProxy',
    'GetRadioList',
    {}
  );

  return { status: 200, body: { code: 0, data } };
}

module.exports = {
  '/recommend/home': getHomeFeed,
  '/recommend/guess': getGuessRecommend,
  '/recommend/radar': getRadarRecommend,
  '/recommend/daily': getDailyRecommend,
  '/recommend/songlist': getPersonalizedSonglist,
  '/recommend/new/songs': getNewSongs,
  '/recommend/radio': getRadioRecommend,
};
