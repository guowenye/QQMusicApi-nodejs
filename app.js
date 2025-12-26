/**
 * QQ音乐 API Node.js 版本
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  const origin = process.env.CORS_ALLOW_ORIGIN || req.headers.origin || '*';
  res.set({
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 加载所有模块
const modulesPath = path.join(__dirname, 'module');
const routes = {};

fs.readdirSync(modulesPath)
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const module = require(path.join(modulesPath, file));
    Object.keys(module).forEach((key) => {
      if (key.startsWith('/') && typeof module[key] === 'function') {
        routes[key] = module[key];
      }
    });
  });

// 注册路由
Object.keys(routes).forEach((route) => {
  app.all(route, async (req, res) => {
    const query = { ...req.query, ...req.body };
    
    // 从请求头或 cookie 获取凭证
    const credential = {};
    if (req.headers.authorization) {
      const [musicid, musickey] = req.headers.authorization.split(':');
      credential.musicid = musicid;
      credential.musickey = musickey;
    } else if (req.cookies) {
      credential.musicid = req.cookies.musicid || req.cookies.uin;
      credential.musickey = req.cookies.musickey || req.cookies.qm_keyst;
    }
    query.credential = credential;

    try {
      const result = await routes[route](query, req);
      res.status(result.status || 200).json(result.body);
    } catch (error) {
      console.error(`[ERROR] ${route}:`, error);
      res.status(500).json({
        code: error.code || 500,
        msg: error.message || 'Internal Server Error',
        data: error.data || null,
      });
    }
  });
});

// 首页
app.get('/', (req, res) => {
  const apiList = Object.keys(routes).sort();
  res.json({
    name: 'QQ音乐 API Node.js 版本',
    version: '1.0.0',
    apis: apiList,
    total: apiList.length,
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ code: 404, msg: 'Not Found' });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`
   ██████╗  ██████╗ ███╗   ███╗██╗   ██╗███████╗██╗ ██████╗
  ██╔═══██╗██╔═══██╗████╗ ████║██║   ██║██╔════╝██║██╔════╝
  ██║   ██║██║   ██║██╔████╔██║██║   ██║███████╗██║██║     
  ██║▄▄ ██║██║▄▄ ██║██║╚██╔╝██║██║   ██║╚════██║██║██║     
  ╚██████╔╝╚██████╔╝██║ ╚═╝ ██║╚██████╔╝███████║██║╚██████╗
   ╚══▀▀═╝  ╚══▀▀═╝ ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝
  `);
  console.log(`  QQ音乐 API 服务已启动`);
  console.log(`  地址: http://localhost:${PORT}`);
  console.log(`  接口数量: ${Object.keys(routes).length}`);
});

module.exports = app;
