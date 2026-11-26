# 赵俊清 24006270205 · LLM 应用设计 · 纯静态部署包

## 最快部署方法：Netlify Drop（推荐）

1. 打开浏览器访问 **https://app.netlify.com/drop**
2. 把整个 `deploy-static/` 文件夹**拖到页面上**
3. 等几秒钟，Netlify 会自动给你一个 **https://random-name.netlify.app** 链接
4. 把这个链接填进班级表格的"LLM 实践完成测试展示"列

**不需要注册账号、不需要安装任何工具、30 秒搞定。**

## 本地预览

双击 start.bat 启动 backend 后访问 http://localhost:8205 （原始后端版）

或者：```
cd deploy-static
npx serve .
```

## 项目说明

- 前端：原生 HTML / CSS / JavaScript（禁止第三方库、框架、CDN）
- 后端：Node.js + Express（本地运行时）；静态部署时用 mock JSON 数据
- 数据库：MySQL（可选，离线模式自动返回 mock）
- 端口：8205（学号末三位 205）
- 命名前缀：zjq_
- 记录文件：zjq_prompt.md / zjq_interface.md / zjq_database.md

## 页面清单（8 个）

| 页面 | 功能 | 接口 |
|------|------|------|
| index.html | 首页：姓名学号、canvas 粒子、全部导航 | - |
| database.html | MySQL 连接测试 | /api/db-test |
| news.html | 科技新闻列表 | /api/news |
| gallery.html | 图文列表 | /api/gallery |
| chat.html | AI 聊天 + 在线客服 | /api/chat |
| kb.html | 知识库 RAG | /api/kb/* |
| vision.html | 图像识别 | /api/vision |
| asr.html | 语音识别 | /api/asr |

## 离线降级

所有页面均支持**离线演示模式**：未连接 MySQL 或未配置 API Key 时，
自动返回结构一致的 mock 数据，页面不白屏。
静态部署包 `deploy-static/` 全程走 mock JSON，零依赖即可运行。
