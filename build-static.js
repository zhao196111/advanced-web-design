/*
姓名：赵俊清 | 学号：24006270205 |
时间：2026-11-26 | 大模型：Tencent Hunyuan Hy（均衡）
说明：把 fullstack-init 转成纯静态部署包 → deploy-static/
     前端直接 fetch('./data/*.json') ，不依赖后端 Express。
     可以直接拖到 drop.netlify.app 部署，或 netlify deploy --dir deploy-static
*/
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'fullstack-init', 'frontend');
const DEST = path.join(ROOT, 'deploy-static');

// 1. 清理并重建
if (fs.existsSync(DEST)) {
    fs.rmSync(DEST, { recursive: true, force: true });
}
fs.mkdirSync(DEST, { recursive: true });

// 2. 复制 frontend/ 全部文件
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) {
        const srcFile = path.join(src, f);
        const destFile = path.join(dest, f);
        const stat = fs.statSync(srcFile);
        if (stat.isDirectory()) copyDir(srcFile, destFile);
        else fs.copyFileSync(srcFile, destFile);
    }
}
copyDir(SRC, DEST);
console.log('✅ 复制 frontend/ 完成');

// 3. 创建 data/ 目录，放 mock JSON
const DATA = path.join(DEST, 'data');
fs.mkdirSync(DATA, { recursive: true });

const newsMock = { code: 0, msg: 'ok（离线演示）', data: {
    list: [
        { id: 1, title: '国产开源大模型发布 3.0 版本，长上下文推理成本下降四成', summary: '新版本把 128K 上下文的推理开销压低约 40%，并开放了完整权重与评测集。', content: '本次更新重构了注意力缓存机制。', source: '科技日报', publish_time: '2026-11-18 09:20', cover_img: '/images/03-mirror.jpg' },
        { id: 2, title: '可重复使用运载火箭完成第 20 次回收，发射间隔压缩至 72 小时', summary: '同一枚一级箭体第 20 次完成海上平台回收。', content: '复用周转周期缩短到三天。', source: '中国航天报', publish_time: '2026-11-17 14:05', cover_img: '/images/06-ship.jpg' },
        { id: 3, title: '固态电池中试线投产，能量密度达到 400Wh/kg', summary: '首条车规级固态电池中试线正式通线。', content: '样品通过针刺与高温循环测试。', source: '财新网', publish_time: '2026-11-16 10:30', cover_img: '/images/05-bluehour.jpg' },
        { id: 4, title: '6G 试验网在长三角完成通感一体外场验证', summary: '定位误差控制在 0.3 米以内。', content: '外场验证了通感一体波形稳定性。', source: '人民邮电报', publish_time: '2026-11-15 16:40', cover_img: '/images/01-dome.jpg' },
        { id: 5, title: '量子计算原型机实现 512 比特相干操控', summary: '双比特门保真度保持在 99.2%。', content: '规模化后保真度损失可控。', source: 'Nature', publish_time: '2026-11-14 08:15', cover_img: '/images/02-shadow.jpg' },
        { id: 6, title: '自动驾驶干线物流获准开展跨省商业化试运营', summary: '两条跨省高速开放 L4 级卡车编队。', content: '全程配备云端安全员。', source: '新华社', publish_time: '2026-11-13 11:25', cover_img: '/images/04-forest.jpg' },
        { id: 7, title: '脑机接口临床试验帮助瘫痪患者完成汉字书写', summary: '识别准确率超过 90%。', content: '意念控制机械臂书写汉字。', source: '中国科学报', publish_time: '2026-11-12 15:50', cover_img: '/images/07-zoom.jpg' },
        { id: 8, title: '绿色数据中心液冷渗透率首次过半，平均 PUE 降至 1.08', summary: '新建数据中心液冷占比 52%。', content: '全年节电节水同步改善。', source: '第一财经', publish_time: '2026-11-11 09:00', cover_img: '/images/05-bluehour.jpg' }
    ], total: 8, api: '/api/news', table: 'zjq_news', offline: true
}};

const galleryMock = { code: 0, msg: 'ok（离线演示）', data: {
    list: [
        { id: 1, title: '穹顶结构', description: '参数化设计的曲面网格。', img_url: '/images/01-dome.jpg', category: '建筑', create_time: '2026-11-18 10:00' },
        { id: 2, title: '午后长影', description: '低角度自然光在立面上拉出层次。', img_url: '/images/02-shadow.jpg', category: '摄影', create_time: '2026-11-17 10:00' },
        { id: 3, title: '镜面装置', description: '反射让空间被复制了一次。', img_url: '/images/03-mirror.jpg', category: '装置', create_time: '2026-11-16 10:00' },
        { id: 4, title: '林间光束', description: '散射光穿过枝叶形成可见光路。', img_url: '/images/04-forest.jpg', category: '自然', create_time: '2026-11-15 10:00' },
        { id: 5, title: '蓝调时刻', description: '日落后二十分钟的短暂平衡。', img_url: '/images/05-bluehour.jpg', category: '城市', create_time: '2026-11-14 10:00' },
        { id: 6, title: '国产大型邮轮', description: '工业摄影里最难压缩进一帧的部分。', img_url: '/images/06-ship.jpg', category: '工业', create_time: '2026-11-13 10:00' },
        { id: 7, title: '双指缩放', description: '移动端手势采样可视化。', img_url: '/images/07-zoom.jpg', category: '交互', create_time: '2026-11-12 10:00' },
        { id: 8, title: '穹顶再读', description: '验证图片缓存与加载失败占位。', img_url: '/images/01-dome.jpg', category: '建筑', create_time: '2026-11-11 10:00' }
    ], total: 8, api: '/api/gallery', table: 'zjq_gallery', offline: true
}};

const chatMock = { code: 0, msg: 'ok（离线演示）', data: {
    answer: '【离线演示】你好！我是「中华美食街」在线客服演示助手。当前未配置 API Key，这是离线模拟回答。真实部署后重启 backend/.env 填入 Key 即可变成真实大模型回答。',
    scene: 'chat', platform: 'siliconflow', model: 'deepseek-ai/DeepSeek-V4-Flash', offline: true
}};

const kbListMock = { code: 0, msg: 'ok', data: {
    list: [
        { zjq_id: 1, zjq_name: 'zjq_kb_service.txt', zjq_chunk_count: 8, zjq_source: '预置知识库' },
        { zjq_id: 2, zjq_name: 'zjq_kb_faq.md', zjq_chunk_count: 9, zjq_source: '预置知识库' }
    ], total: 2, chunks: 17, api: '/api/kb/list'
}};

const kbAskMock = { code: 0, msg: 'ok（离线演示）', data: {
    answer: '【离线演示】根据知识库资料：配送范围 3 公里内配送费 5 元；3 至 6 公里 9 元、45 至 60 分钟；超过 6 公里暂不接单。订单满 59 元免配送费。',
    offline: true, api: '/api/kb/ask'
}};

const visionMock = { code: 0, msg: 'ok（离线演示）', data: {
    description: '【离线演示】这是一张示例图片。真实部署时会调用多模态大模型返回中文描述。',
    offline: true, api: '/api/vision'
}};

const asrMock = { code: 0, msg: 'ok（离线演示）', data: {
    text: '【离线演示】这是语音识别的模拟输出文字。真实部署时会调用七牛 Qwen-Audio-3.0-ASR-Flash。',
    offline: true, api: '/api/asr'
}};

const healthMock = { code: 0, msg: 'ok', data: {
    service: 'zjq-static-deploy', port: 8205, node: 'static-deploy',
    database: 'offline', api: ['/data/news.json', '/data/gallery.json', '/data/chat.json']
}};

fs.writeFileSync(path.join(DATA, 'news.json'), JSON.stringify(newsMock, null, 2));
fs.writeFileSync(path.join(DATA, 'gallery.json'), JSON.stringify(galleryMock, null, 2));
fs.writeFileSync(path.join(DATA, 'chat.json'), JSON.stringify(chatMock, null, 2));
fs.writeFileSync(path.join(DATA, 'kb-list.json'), JSON.stringify(kbListMock, null, 2));
fs.writeFileSync(path.join(DATA, 'kb-ask.json'), JSON.stringify(kbAskMock, null, 2));
fs.writeFileSync(path.join(DATA, 'vision.json'), JSON.stringify(visionMock, null, 2));
fs.writeFileSync(path.join(DATA, 'asr.json'), JSON.stringify(asrMock, null, 2));
fs.writeFileSync(path.join(DATA, 'health.json'), JSON.stringify(healthMock, null, 2));
console.log('✅ 创建 data/*.json mock 数据完成');

// 4. 修改 JS 文件：把 fetch('/api/xxx') 改成 fetch('./data/xxx.json')
const JS_DIR = path.join(DEST, 'js');
const fixes = {
    'zjq_news.js': { '/api/news': './data/news.json' },
    'zjq_gallery.js': { '/api/gallery': './data/gallery.json' },
    'zjq_chat.js': { '/api/chat': './data/chat.json', '/api/llm-status': './data/health.json' },
    'zjq_kb.js': {
        '/api/kb/list': './data/kb-list.json',
        '/api/kb/ask': './data/kb-ask.json',
        '/api/kb/upload': './data/kb-list.json',
        '/api/kb/delete': './data/kb-list.json',
        '/api/kb/seed': './data/kb-list.json'
    },
    'zjq_vision.js': { '/api/vision': './data/vision.json' },
    'zjq_asr.js': { '/api/asr': './data/asr.json' },
    'zjq_bg.js': {},
    'zjq_database.js': {}
};

for (const f of fs.readdirSync(JS_DIR)) {
    const fp = path.join(JS_DIR, f);
    let content = fs.readFileSync(fp, 'utf8');
    let changed = false;
    if (fixes[f]) {
        for (const [from, to] of Object.entries(fixes[f])) {
            if (content.includes(from)) {
                content = content.split(from).join(to);
                changed = true;
                console.log(`   ${f}: ${from} → ${to}`);
            }
        }
    }
    // 统一把 POST fetch 改成 GET（因为静态托管只有 GET）
    if (content.includes("method: 'POST'") || content.includes('method: "POST"')) {
        content = content
            .replace(/method:\s*['"]POST['"]/g, 'method: "GET"')
            .replace(/JSON\.stringify\([^)]+\)\s*\)\s*;/g, 'null); // 静态部署：跳过 POST body');
        changed = true;
        console.log(`   ${f}: POST → GET`);
    }
    if (changed) {
        fs.writeFileSync(fp, content);
    }
}
console.log('✅ JS fetch 路径替换完成');

// 5. 写一个 README 说明部署方法
const readme = `# 赵俊清 24006270205 · LLM 应用设计 · 纯静态部署包

## 最快部署方法：Netlify Drop（推荐）

1. 打开浏览器访问 **https://app.netlify.com/drop**
2. 把整个 \`deploy-static/\` 文件夹**拖到页面上**
3. 等几秒钟，Netlify 会自动给你一个 **https://random-name.netlify.app** 链接
4. 把这个链接填进班级表格的"LLM 实践完成测试展示"列

**不需要注册账号、不需要安装任何工具、30 秒搞定。**

## 本地预览

双击 start.bat 启动 backend 后访问 http://localhost:8205 （原始后端版）

或者：\`\`\`
cd deploy-static
npx serve .
\`\`\`

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
静态部署包 \`deploy-static/\` 全程走 mock JSON，零依赖即可运行。
`;

fs.writeFileSync(path.join(DEST, 'README.md'), readme);

// 6. 写 netlify.toml（让部署更友好）
fs.writeFileSync(path.join(DEST, 'netlify.toml'),
`[build]\n  publish = "."\n\n# 允许 SPA fallback\n[[redirects]]\n  from = "/*"\n  to = "/index.html"\n  status = 200\n`);

console.log('');
console.log('🎉 部署包生成完毕：', DEST);
console.log('   文件数：', fs.readdirSync(DEST).length);
console.log('');
console.log('👉 部署步骤：');
console.log('   1. 打开 https://app.netlify.com/drop');
console.log('   2. 把 deploy-static 文件夹拖上去');
console.log('   3. 得到 netlify.app 链接 → 填进班级表格');
