# QQ音乐 API Node.js 版本

基于 Python 版 QQMusicApi 重写的 Node.js 版本，支持 Vercel / EdgeOne Pages 部署。

## 快速开始

### 本地运行

```bash
npm install
npm start
```

访问 http://localhost:3000

### Vercel 部署

1. Fork 本项目
2. 在 Vercel 导入仓库
3. 直接部署

### EdgeOne Pages 部署

1. Fork 本项目
2. 在 EdgeOne Pages 导入仓库
3. 配置：
   - 安装命令：`npm install`
   - 编译命令：留空
   - 输出目录：`public`

## API 列表

### 搜索
- `GET /search?keyword=关键词&type=0&num=10&page=1` - 搜索
- `GET /search/hotkey` - 热搜词
- `GET /search/complete?keyword=关键词` - 搜索补全
- `GET /search/general?keyword=关键词` - 综合搜索

### 歌曲
- `GET /song/detail?mid=歌曲mid` - 歌曲详情
- `GET /song/url?mid=歌曲mid&type=MP3_128` - 播放链接
- `GET /song/similar?id=歌曲id` - 相似歌曲
- `GET /lyric?mid=歌曲mid` - 歌词

### 歌手
- `GET /singer/detail?mid=歌手mid` - 歌手详情
- `GET /singer/songs?mid=歌手mid` - 歌手歌曲
- `GET /singer/albums?mid=歌手mid` - 歌手专辑
- `GET /singer/list` - 歌手列表

### 专辑
- `GET /album/detail?mid=专辑mid` - 专辑详情
- `GET /album/songs?mid=专辑mid` - 专辑歌曲
- `GET /album/new` - 新专辑

### 歌单
- `GET /songlist/detail?id=歌单id` - 歌单详情
- `GET /songlist/songs?id=歌单id` - 歌单歌曲
- `GET /songlist/category` - 歌单分类
- `GET /songlist/list?categoryId=分类id` - 分类歌单

### 排行榜
- `GET /top/category` - 所有排行榜
- `GET /top/detail?id=排行榜id` - 排行榜详情

### 推荐
- `GET /recommend/home` - 首页推荐
- `GET /recommend/daily` - 每日推荐
- `GET /recommend/new/songs` - 新歌推荐

### MV
- `GET /mv/detail?vid=MV的vid` - MV详情
- `GET /mv/url?vid=MV的vid` - MV播放链接
- `GET /mv/recommend` - 推荐MV
- `GET /mv/rank` - MV排行榜

### 评论
- `GET /comment/list?id=资源id&type=1` - 评论列表
- `GET /comment/hot?id=资源id&type=1` - 热门评论

### 用户
- `GET /user/detail?id=用户id` - 用户详情
- `GET /user/songlist?id=用户id` - 用户歌单

### 登录
- `GET /login/qrcode` - 获取登录二维码
- `GET /login/qrcode/check?qrsig=xxx` - 检查扫码状态

## 搜索类型

| 类型 | 值 |
|------|-----|
| 歌曲 | 0 |
| 歌手 | 1 |
| 专辑 | 2 |
| 歌单 | 3 |
| MV | 4 |
| 歌词 | 7 |
| 用户 | 8 |

## 歌曲文件类型

| 类型 | 说明 |
|------|------|
| MP3_128 | MP3 128kbps |
| MP3_320 | MP3 320kbps |
| FLAC | 无损 |
| AAC_96 | AAC 96kbps |
| AAC_192 | AAC 192kbps |

## License

MIT
