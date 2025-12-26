/**
 * 排行榜相关 API
 */
const { apiRequest } = require('../util/request');

/**
 * 获取所有排行榜
 */
async function getTopCategory(query, request) {
  const data = await apiRequest(
    'music.musicToplist.Toplist',
    'GetAll',
    {}
  );

  return { status: 200, body: { code: 0, data: data.group || data } };
}

/**
 * 获取排行榜详情
 */
async function getTopDetail(query, request) {
  const { id, num = 100, page = 1, tag = true } = query;
  if (!id) {
    return { status: 400, body: { code: 400, msg: '缺少 id 参数' } };
  }

  const data = await apiRequest(
    'music.musicToplist.Toplist',
    'GetDetail',
    {
      topId: parseInt(id),
      offset: (parseInt(page) - 1) * parseInt(num),
      num: parseInt(num),
      withTags: tag === 'true' || tag === true,
    }
  );

  return { status: 200, body: { code: 0, data } };
}

module.exports = {
  '/top/category': getTopCategory,
  '/top/detail': getTopDetail,
};
