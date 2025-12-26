/**
 * MV 相关 API
 */
const { apiRequest, getGuid } = require('../util/request');

/**
 * 获取 MV 详情
 */
async function getMvDetail(query, request) {
  const { vid } = query;
  if (!vid) {
    return { status: 400, body: { code: 400, msg: '缺少 vid 参数' } };
  }

  const vids = Array.isArray(vid) ? vid : vid.split(',');
  const data = await apiRequest(
    'video.VideoDataServer',
    'get_video_info_batch',
    {
      vidlist: vids,
      required: [
        'vid', 'type', 'sid', 'cover_pic', 'duration', 'singers',
        'video_switch', 'msg', 'name', 'desc', 'playcnt', 'pubdate',
        'isfav', 'gmid', 'uploader_headurl', 'uploader_nick',
        'uploader_encuin', 'uploader_uin', 'uploader_hasfollow',
        'uploader_follower_num', 'related_songs',
      ],
    }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取 MV 播放链接
 */
async function getMvUrl(query, request) {
  const { vid } = query;
  if (!vid) {
    return { status: 400, body: { code: 400, msg: '缺少 vid 参数' } };
  }

  const vids = Array.isArray(vid) ? vid : vid.split(',');
  const data = await apiRequest(
    'music.stream.MvUrlProxy',
    'GetMvUrls',
    {
      vids,
      request_type: 10003,
      guid: getGuid(),
      videoformat: 1,
      format: 265,
      dolby: 1,
      use_new_domain: 1,
      use_ipv6: 1,
    }
  );

  // 处理返回的 URL
  const urls = {};
  for (const [key, value] of Object.entries(data)) {
    urls[key] = {
      mp4: {},
      hls: {},
    };
    if (value.mp4) {
      for (const item of value.mp4) {
        if (item.freeflow_url && item.freeflow_url.length > 0) {
          urls[key].mp4[item.filetype] = item.freeflow_url[0];
        }
      }
    }
    if (value.hls) {
      for (const item of value.hls) {
        if (item.freeflow_url && item.freeflow_url.length > 0) {
          urls[key].hls[item.filetype] = item.freeflow_url[0];
        }
      }
    }
  }

  return { status: 200, body: { code: 0, data: urls } };
}

/**
 * 获取推荐 MV
 */
async function getRecommendMv(query, request) {
  const { num = 20, page = 1 } = query;

  const data = await apiRequest(
    'MvService.MvInfoProServer',
    'GetRecommendMv',
    {
      start: (parseInt(page) - 1) * parseInt(num),
      size: parseInt(num),
    }
  );

  return { status: 200, body: { code: 0, data } };
}

/**
 * 获取 MV 排行榜
 */
async function getMvRank(query, request) {
  const { area = 15, num = 20, page = 1 } = query;

  const data = await apiRequest(
    'MvService.MvInfoProServer',
    'GetMvRank',
    {
      area: parseInt(area),
      start: (parseInt(page) - 1) * parseInt(num),
      size: parseInt(num),
    }
  );

  return { status: 200, body: { code: 0, data } };
}

module.exports = {
  '/mv/detail': getMvDetail,
  '/mv/url': getMvUrl,
  '/mv/recommend': getRecommendMv,
  '/mv/rank': getMvRank,
};
