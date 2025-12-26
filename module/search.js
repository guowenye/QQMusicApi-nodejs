/**
 * 搜索相关 API
 */
const { apiRequest, getSearchId } = require('../util/request');

// 搜索类型
const SearchType = {
  SONG: 0,      // 歌曲
  SINGER: 1,    // 歌手
  ALBUM: 2,     // 专辑
  SONGLIST: 3,  // 歌单
  MV: 4,        // MV
  LYRIC: 7,     // 歌词
  USER: 8,      // 用户
  AUDIO_ALBUM: 15, // 节目专辑
  AUDIO: 18,    // 节目
};

/**
 * 获取热搜词
 */
async function hotkey(query, request) {
  const data = await apiRequest(
    'music.musicsearch.HotkeyService',
    'GetHotkeyForQQMusicMobile',
    { search_id: getSearchId() }
  );
  return { status: 200, body: { code: 0, data } };
}

/**
 * 搜索词补全
 */
async function complete(query, request) {
  const { keyword } = query;
  if (!keyword) {
    return { status: 400, body: { code: 400, msg: '缺少 keyword 参数' } };
  }

  const data = await apiRequest(
    'music.smartboxCgi.SmartBoxCgi',
    'GetSmartBoxResult',
    {
      search_id: getSearchId(),
      query: keyword,
      num_per_page: 0,
      page_idx: 0,
    }
  );
  return { status: 200, body: { code: 0, data } };
}

/**
 * 综合搜索
 */
async function generalSearch(query, request) {
  const { keyword, page = 1, highlight = true } = query;
  if (!keyword) {
    return { status: 400, body: { code: 400, msg: '缺少 keyword 参数' } };
  }

  const data = await apiRequest(
    'music.adaptor.SearchAdaptor',
    'do_search_v2',
    {
      searchid: getSearchId(),
      search_type: 100,
      page_num: 15,
      query: keyword,
      page_id: parseInt(page),
      highlight: highlight === 'true' || highlight === true,
      grp: true,
    }
  );
  return { status: 200, body: { code: 0, data } };
}

/**
 * 按类型搜索
 */
async function searchByType(query, request) {
  const { keyword, type = 0, num = 10, page = 1, highlight = true } = query;
  if (!keyword) {
    return { status: 400, body: { code: 400, msg: '缺少 keyword 参数' } };
  }

  const searchType = parseInt(type);
  const data = await apiRequest(
    'music.search.SearchCgiService',
    'DoSearchForQQMusicMobile',
    {
      searchid: getSearchId(),
      query: keyword,
      search_type: searchType,
      num_per_page: parseInt(num),
      page_num: parseInt(page),
      highlight: highlight === 'true' || highlight === true,
      grp: true,
    }
  );

  // 根据搜索类型提取对应数据
  const typeMap = {
    [SearchType.SONG]: 'item_song',
    [SearchType.SINGER]: 'singer',
    [SearchType.ALBUM]: 'item_album',
    [SearchType.SONGLIST]: 'item_songlist',
    [SearchType.MV]: 'item_mv',
    [SearchType.LYRIC]: 'item_song',
    [SearchType.USER]: 'item_user',
    [SearchType.AUDIO_ALBUM]: 'item_audio',
    [SearchType.AUDIO]: 'item_song',
  };

  const resultKey = typeMap[searchType] || 'item_song';
  const result = data.body ? data.body[resultKey] : data[resultKey];

  return { status: 200, body: { code: 0, data: result || data } };
}

module.exports = {
  '/search/hotkey': hotkey,
  '/search/complete': complete,
  '/search': searchByType,
  '/search/general': generalSearch,
  SearchType,
};
