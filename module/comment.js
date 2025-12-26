/**
 * 评论相关 API
 */
const { apiRequest } = require('../util/request');

// 评论类型
const CommentType = {
  SONG: 1,      // 歌曲
  ALBUM: 2,     // 专辑
  SONGLIST: 3,  // 歌单
  MV: 5,        // MV
};

/**
 * 处理评论数据
 */
function processComments(data) {
  const comments = data.CommentList?.Comments || [];
  return comments.map((comment) => ({
    Avatar: comment.Avatar,
    CmId: comment.CmId,
    PraiseNum: comment.PraiseNum,
    Nick: comment.Nick,
    Pic: comment.Pic,
    Content: comment.Content,
    SeqNo: comment.SeqNo,
    SubComments: (comment.SubComments || []).map((sub) => ({
      Avatar: sub.Avatar,
      Nick: sub.Nick,
      Content: sub.Content,
      Pic: sub.Pic,
      PraiseNum: sub.PraiseNum,
      SeqNo: sub.SeqNo,
    })),
  }));
}

/**
 * 获取评论数量
 */
async function getCommentCount(query, request) {
  const { id, type = 1 } = query;
  if (!id) {
    return { status: 400, body: { code: 400, msg: '缺少 id 参数' } };
  }

  const data = await apiRequest(
    'music.globalComment.CommentCountSrv',
    'GetCmCount',
    {
      request: {
        biz_id: String(id),
        biz_type: parseInt(type),
        biz_sub_type: 2,
      },
    }
  );

  return { status: 200, body: { code: 0, data: data.response || data } };
}

/**
 * 获取热门评论
 */
async function getHotComments(query, request) {
  const { id, type = 1, pageNum = 1, pageSize = 15, lastSeqNo = '' } = query;
  if (!id) {
    return { status: 400, body: { code: 400, msg: '缺少 id 参数' } };
  }

  const data = await apiRequest(
    'music.globalComment.CommentRead',
    'GetHotCommentList',
    {
      BizType: parseInt(type),
      BizId: String(id),
      LastCommentSeqNo: lastSeqNo,
      PageSize: parseInt(pageSize),
      PageNum: parseInt(pageNum) - 1,
      HotType: 1,
      WithAirborne: 0,
      PicEnable: 1,
    }
  );

  return { status: 200, body: { code: 0, data: processComments(data) } };
}

/**
 * 获取最新评论
 */
async function getNewComments(query, request) {
  const { id, type = 1, pageNum = 1, pageSize = 15, lastSeqNo = '' } = query;
  if (!id) {
    return { status: 400, body: { code: 400, msg: '缺少 id 参数' } };
  }

  const data = await apiRequest(
    'music.globalComment.CommentRead',
    'GetNewCommentList',
    {
      PageSize: parseInt(pageSize),
      PageNum: parseInt(pageNum) - 1,
      HashTagID: '',
      BizType: parseInt(type),
      PicEnable: 1,
      LastCommentSeqNo: lastSeqNo,
      SelfSeeEnable: 1,
      BizId: String(id),
      AudioEnable: 1,
    }
  );

  return { status: 200, body: { code: 0, data: processComments(data) } };
}

/**
 * 获取推荐评论
 */
async function getRecommendComments(query, request) {
  const { id, type = 1, pageNum = 1, pageSize = 15, lastSeqNo = '' } = query;
  if (!id) {
    return { status: 400, body: { code: 400, msg: '缺少 id 参数' } };
  }

  const data = await apiRequest(
    'music.globalComment.CommentRead',
    'GetRecCommentList',
    {
      PageSize: parseInt(pageSize),
      PageNum: parseInt(pageNum) - 1,
      BizType: parseInt(type),
      PicEnable: 1,
      Flag: 1,
      LastCommentSeqNo: lastSeqNo,
      CmListUIVer: 1,
      BizId: String(id),
      AudioEnable: 1,
    }
  );

  return { status: 200, body: { code: 0, data: processComments(data) } };
}

module.exports = {
  '/comment/count': getCommentCount,
  '/comment/hot': getHotComments,
  '/comment/new': getNewComments,
  '/comment/recommend': getRecommendComments,
  CommentType,
};
