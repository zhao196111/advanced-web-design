/*
姓名：赵俊清 | 学号：24006270205 |
时间：2026-11-26 | 大模型：Tencent Hunyuan Hy（均衡）
说明：生成 LLM 应用设计项目报告 docx
*/
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    AlignmentType, Table, TableRow, TableCell, BorderStyle,
    WidthType, ShadingType, LevelFormat, Header, Footer, PageNumber
} = require('docx');

const cjkFont = 'Microsoft YaHei';

function h1(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 320, after: 160 },
        children: [new TextRun({ text, bold: true, size: 32, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })]
    });
}
function h2(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text, bold: true, size: 28, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })]
    });
}
function p(text) {
    return new Paragraph({
        spacing: { after: 80, line: 360 },
        children: [new TextRun({ text, size: 24, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })]
    });
}
function bullet(text) {
    return new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        spacing: { after: 60, line: 360 },
        children: [new TextRun({ text, size: 24, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })]
    });
}
function boldP(bold, rest) {
    return new Paragraph({
        spacing: { after: 80, line: 360 },
        children: [
            new TextRun({ text: bold, bold: true, size: 24, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } }),
            new TextRun({ text: rest || '', size: 24, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })
        ]
    });
}

const border = { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' };
const borders = { top: border, bottom: border, left: border, right: border };

function simpleTable(rows) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: rows.map((r, i) => new TableRow({
            cantSplit: true,
            children: r.map(c => new TableCell({
                borders,
                width: { size: Math.round(100 / r.length), type: WidthType.PERCENTAGE },
                shading: i === 0 ? { fill: 'D5E8F0', type: ShadingType.CLEAR } : undefined,
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({
                    spacing: { after: 40 },
                    children: [new TextRun({
                        text: String(c),
                        bold: i === 0,
                        size: 22,
                        font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont }
                    })]
                })]
            }))
        }))
    });
}

// ========== 读取项目文件内容 ==========
const interfaceMd = fs.readFileSync(path.join(__dirname, 'fullstack-init', 'backend', 'zjq_interface.md'), 'utf8');
const databaseMd = fs.readFileSync(path.join(__dirname, 'fullstack-init', 'backend', 'zjq_database.md'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, 'fullstack-init', 'backend', 'app.js'), 'utf8');

// ========== 生成文档 ==========
const doc = new Document({
    styles: {
        default: {
            document: {
                run: { font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont }, size: 24 }
            }
        },
        paragraphStyles: [
            { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
                run: { size: 32, bold: true, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } },
                paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0, keepNext: false, keepLines: false } },
            { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
                run: { size: 28, bold: true, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } },
                paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1, keepNext: false, keepLines: false } }
        ]
    },
    numbering: {
        config: [
            { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
        ]
    },
    sections: [{
        properties: {
            page: {
                size: { width: 11906, height: 16838 },
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
        },
        headers: {
            default: new Header({
                children: [new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: 'LLM 应用设计 · 项目报告 · 赵俊清 24006270205', size: 18, color: '999999', font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })]
                })]
            })
        },
        footers: {
            default: new Footer({
                children: [new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({ text: '第 ', size: 18, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } }),
                        new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                        new TextRun({ text: ' 页', size: 18, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })
                    ]
                })]
            })
        },
        children: [
            // ===== 封面 =====
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 400 },
                children: [new TextRun({ text: '高 级 网 页 设 计 I', size: 40, bold: true, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
                children: [new TextRun({ text: 'LLM 应 用 设 计 · 项 目 报 告', size: 48, bold: true, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 },
                children: [new TextRun({ text: '——————————————', size: 28, color: 'CCCCCC' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
                children: [new TextRun({ text: '姓　　名：赵俊清', size: 28, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
                children: [new TextRun({ text: '学　　号：24006270205', size: 28, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
                children: [new TextRun({ text: '课　　程：高级网页设计 I', size: 28, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
                children: [new TextRun({ text: '实验名称：LLM 应用设计', size: 28, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
                children: [new TextRun({ text: '日　　期：2026 年 11 月 26 日', size: 28, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800 },
                children: [new TextRun({ text: '——————————————', size: 28, color: 'CCCCCC' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
                children: [new TextRun({ text: '大模型：Tencent Hunyuan Hy（均衡）', size: 22, color: '666666', font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: cjkFont } })] }),

            // ===== 1. 项目需求与实现 =====
            h1('1 项目需求与实现'),
            p('本项目基于《LLM 应用设计》实验指导书，在已完成的全栈项目初始化框架上，扩展实现了 AI 聊天与在线客服、知识库问答（RAG）、图像识别、语音识别四大 LLM 应用模块。前后端分离架构：前端原生 HTML/CSS/JS，后端 Node.js + Express 中间层，API Key 只存于 backend/.env，后端统一转发大模型请求，前端不接触密钥。'),

            h2('1.1 系统架构'),
            p('浏览器页面 → 前端 fetch 请求 /api/chat（或其他 /api/*）→ Express 中间层（鉴权拼接提示词转发）→ 大模型 API（硅基流动 / 七牛云）→ 返回文本或结构化数据 → 前端渲染。MySQL 存储业务表（zjq_news、zjq_gallery、zjq_kb_files、zjq_kb_chunks），离线模式下自动返回 mock 数据。'),

            h2('1.2 接口清单（共 15 个 /api/* 接口）'),
            simpleTable([
                ['接口路径', '方法', '功能', '数据来源'],
                ['/api/health', 'GET', '健康检查', '本地'],
                ['/api/db-test', 'POST', 'MySQL 连接测试', 'MySQL'],
                ['/api/db-init', 'POST', '一键建库建表插数据', 'MySQL + setup-db.js'],
                ['/api/news', 'GET', '科技新闻列表（离线降级）', 'zjq_news / mock'],
                ['/api/gallery', 'GET', '图文列表（离线降级）', 'zjq_gallery / mock'],
                ['/api/chat', 'POST', 'AI 聊天 / 在线客服', 'LLM API'],
                ['/api/llm-status', 'GET', 'Key 配置状态（只返回布尔值）', '.env'],
                ['/api/kb/upload', 'POST', '知识库文件上传解析', 'multer + 解析器'],
                ['/api/kb/list', 'GET', '知识库文件列表', '本地 JSON'],
                ['/api/kb/delete', 'POST', '删除知识库文件', '本地 JSON'],
                ['/api/kb/seed', 'POST', '一键构建 2 个预置知识库', '预置文件'],
                ['/api/kb/ask', 'POST', '基于知识库的问答（RAG）', '检索 + LLM'],
                ['/api/vision', 'POST', '图像识别', 'LLM 多模态 API'],
                ['/api/asr', 'POST', '语音识别（七牛 Qwen-Audio）', '七牛 ASR API']
            ]),

            h2('1.3 数据表结构（4 张业务表 + 8 条测试数据）'),
            simpleTable([
                ['表名', '字段', '记录数', '说明'],
                ['zjq_news', 'id, title, summary, content, source, publish_time, cover_img', '8', '科技新闻'],
                ['zjq_gallery', 'id, title, description, img_url, category, create_time', '8', '图文列表'],
                ['zjq_kb_files', 'id, zjq_name, zjq_type, zjq_size, zjq_chunk_count, zjq_source, zjq_create_time', '8', '知识库文件'],
                ['zjq_kb_chunks', 'id, zjq_file_id, zjq_index, zjq_content, zjq_create_time', '10+', '知识库切片']
            ]),

            h2('1.4 大模型后端代理核心代码（zjq_chatController.js 节选）'),
            new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: '// system 人设放最前，其余历史原样透传', size: 20, font: { ascii: 'Consolas', eastAsia: cjkFont }, color: '1F4E79' })] }),
            new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'const zjq_full = [{ role:"system", content: zjq_scenes[zjq_scene] }].concat(zjq_messages);', size: 20, font: { ascii: 'Consolas', eastAsia: cjkFont }, color: '1F4E79' })] }),
            new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'const zjq_result = await zjq_llm.zjq_callChat({ platform, messages: zjq_full, temperature, max_tokens });', size: 20, font: { ascii: 'Consolas', eastAsia: cjkFont }, color: '1F4E79' })] }),
            new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'return zjq_reply.zjq_ok(res, zjq_result.zjq_offline ? "ok（离线演示）" : "ok", { answer, sent, received });', size: 20, font: { ascii: 'Consolas', eastAsia: cjkFont }, color: '1F4E79' })] }),

            // ===== 2. 项目功能概述 =====
            h1('2 项目功能概述'),
            h2('2.1 前端页面（共 8 个 HTML 页面）'),
            simpleTable([
                ['页面', '对应接口', '功能描述'],
                ['index.html', '/api/health', '项目首页：姓名学号、canvas 粒子背景、全部页面导航、答辩速记'],
                ['database.html', '/api/db-test, /api/db-init', 'MySQL 连接测试，成功后一键初始化数据库'],
                ['news.html', '/api/news', '科技新闻列表，页面顶部显示接口地址，控制台打印返回数据'],
                ['gallery.html', '/api/gallery', '图文列表，网格上图下文，图片加载失败显示占位色块'],
                ['chat.html', '/api/chat', 'AI 聊天 + 在线客服（双平台热切换：硅基流动 / 七牛），多轮对话'],
                ['kb.html', '/api/kb/*', '知识库 RAG：上传文件解析分块 → 检索 → LLM 作答，含管理模块'],
                ['vision.html', '/api/vision', '图像识别：上传图片 → 多模态模型返回中文描述'],
                ['asr.html', '/api/asr', '语音识别：录音或上传音频 → 七牛 ASR 输出文字']
            ]),

            h2('2.2 统一 JSON 响应格式'),
            p('所有 /api/* 接口返回统一格式：{ "code": 0, "msg": "提示信息", "data": {...} }，code=0 表示成功，非 0 表示失败。data.sent / data.received 分别是发送给大模型的数据和收到的数据，前后端控制台均完整打印，便于取证。'),

            // ===== 3. 使用的 AI 工具 =====
            h1('3 使用的 AI 工具'),
            simpleTable([
                ['工具', '用途', '版本 / 说明'],
                ['Trae IDE', 'AI 辅助编程（Vibe Coding）', '2025 版，MCP 插件市场'],
                ['Tencent Hunyuan Hy', '主要开发大模型', '均衡模式'],
                ['Node.js', '后端运行时', 'v24.16.0'],
                ['Express', 'Web 框架', 'v5.3.0'],
                ['mysql2', 'MySQL 驱动', 'v3.24.6'],
                ['dotenv', '环境变量', 'v18.0.10'],
                ['cors', '跨域中间件', 'v2.8.6'],
                ['multer', '文件上传', 'v2.5.0'],
                ['jszip + pdf-parse', '文件解析', '多格式支持'],
                ['Google Chrome / Edge', '浏览器测试', '最新版']
            ]),

            // ===== 4. 使用的大模型及版本 =====
            h1('4 使用的大模型及版本'),
            simpleTable([
                ['平台', '模型 ID', '用途', '说明'],
                ['硅基流动 SiliconFlow', 'deepseek-ai/DeepSeek-V4-Flash', 'AI 聊天 / 知识库问答', '默认模型，长上下文、推理成本低'],
                ['硅基流动 SiliconFlow', 'Qwen/Qwen2.5-VL-32B-Instruct', '图像识别', '多模态，支持图片理解'],
                ['七牛云', 'qiniu/conatus-free', '在线客服', '免费额度，对话稳定'],
                ['七牛云', 'qwen/qwen-audio-3.0-asr-flash', '语音识别', 'ASR 专用模型，实时流式输出']
            ]),
            p('API Key 三条红线：只写在 backend/.env；不写进 AGENTS.md、前端源码或任何会进 git 的文件；.env 已在 .gitignore 排除。对外截图一律打码成 sk-****。'),

            // ===== 5. AI 应用截图占位说明 =====
            h1('5 AI 应用截图（见附录 / 答辩演示）'),
            p('以下为各页面截图说明，实际截图请在答辩前使用浏览器 F12 控制台 + 页面正常视图组合截取。由于本报告生成时使用离线演示模式，截图将反映以下状态：'),
            bullet('首页 index.html：canvas 粒子背景 + 8 张导航卡片（全部 PASS）'),
            bullet('news.html：顶部显示接口地址 /api/news，下方卡片列表展示 8 条新闻标题、摘要、来源、时间'),
            bullet('gallery.html：网格布局 8 张上图下文卡片，图片来自 frontend/images/ 目录'),
            bullet('chat.html：AI 聊天（system=通用助手）和在线客服（system=中华美食街客服）两套人设，支持硅基流动/七牛热切换'),
            bullet('kb.html：知识库文件列表 + 上传按钮 + 问答界面，展示发送给大模型的完整 system 提示词（含检索到的片段）'),
            bullet('vision.html：上传图片后返回中文描述，data.sent 中包含 image_url base64'),
            bullet('asr.html：录音或上传音频后输出文字'),

            // ===== 6. 发送给 LLM 的提示词 =====
            h1('6 发送给 LLM 的提示词（system prompt）'),
            h2('6.1 通用 AI 聊天人设（chat.html 默认）'),
            new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: '你是一个友好、严谨、有用的中文助手。回答简洁清楚，适当分点。', size: 22, font: { ascii: 'Consolas', eastAsia: cjkFont }, color: '1F4E79' })] }),

            h2('6.2 中华美食街在线客服人设（chat.html service 场景）'),
            new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: '你是「中华美食街」的在线客服。只回答营业时间、招牌菜、配送范围三类问题；其他问题礼貌说明暂不在线受理范围并引导用户留言。用中文回答，语气亲切。', size: 22, font: { ascii: 'Consolas', eastAsia: cjkFont }, color: '1F4E79' })] }),

            h2('6.3 知识库 RAG 提示词结构（kb.html ask）'),
            boldP('System 段：', '你是一个基于知识库的问答助手。请严格根据以下检索到的资料（用【资料开始】【资料结束】包裹）回答用户问题。如果资料中没有相关信息，请诚实说明"资料中未涉及此内容"，不要编造。'),
            boldP('资料段：', '【资料开始】\n' +
                '片段1 (来源: zjq_kb_service.txt, score: 0.92): 中华美食街营业时间...\n' +
                '片段2 (来源: zjq_kb_faq.md, score: 0.85): 配送范围3公里内5元...\n' +
                '...\n' +
                '【资料结束】'),
            boldP('User 段：', '配送费怎么算？超过6公里能送吗？'),

            h2('6.4 图像识别提示词（vision.html）'),
            boldP('System：', '你是一个专业的图像识别助手。请用中文详细描述图片中的内容，包括物体、场景、颜色、构图等。'),
            boldP('User：', '请描述这张图片。（图片以 data:image/jpeg;base64,... 形式放在 image_url 字段）'),

            // ===== 7. 收到的 LLM 信息 =====
            h1('7 收到的 LLM 信息（返回结构示例）'),
            h2('7.1 离线演示模式（未配置 Key 时自动降级）'),
            p('未在 backend/.env 填写 API Key 时，所有 /api/chat、/api/kb/ask、/api/vision、/api/asr 接口都会进入离线演示模式：'),
            simpleTable([
                ['字段', '值', '说明'],
                ['code', '0', '成功'],
                ['msg', 'ok（离线演示）', '标注离线'],
                ['data.answer', '【离线演示】...', '离线模拟回答'],
                ['data.offline', 'true', '明确告知前端'],
                ['data.sent', '{...完整请求体}', '发送给模型的数据（完整保留）'],
                ['data.received', '{ zjq_offline: true, ... }', '模拟的模型返回结构']
            ]),

            h2('7.2 真实模型调用（填 Key 后）'),
            p('填入 SILICONFLOW_API_KEY 并重启后，/api/chat 接口会真实调用 deepseek-ai/DeepSeek-V4-Flash：'),
            simpleTable([
                ['字段', '值', '说明'],
                ['code', '0', '成功'],
                ['msg', 'ok', '正常模式'],
                ['data.answer', '你好！我是...', '模型真实回答'],
                ['data.offline', 'false', '真实调用'],
                ['data.sent', '{ model, messages:[...完整多轮...], temperature, max_tokens }', '完整请求体'],
                ['data.received', '{ id, choices:[{ message:{ content:"..." } }] }', '模型原始返回']
            ]),
            p('后端在控制台打印"发送给大模型的数据"和"接收自大模型的数据"，前端同步 console.log，便于 F12 取证。'),

            // ===== 8. 项目总结 =====
            h1('8 项目总结'),

            h2('8.1 完成情况'),
            bullet('✅ 全栈项目初始化：AGENTS.md 规则、git 仓库、前后端骨架、start.bat 一键启动、端口 8205'),
            bullet('✅ 全栈初始化课验收：health / db-test / news / gallery 四接口，news.html / gallery.html / database.html 三页面'),
            bullet('✅ llm-app 课验收：AI 聊天 + 在线客服（双平台热切换、多轮对话、系统人设）、知识库 RAG（上传解析、检索问答、管理模块）、图像识别、语音识别 四大模块'),
            bullet('✅ MySQL 离线降级：news/gallery 接口在 MySQL 未连接时自动返回 8 条 mock 数据，页面不白屏'),
            bullet('✅ API Key 三条红线：只存 backend/.env，.gitignore 排除，不进 git'),
            bullet('✅ 记录文件完整：zjq_prompt.md（开发指令记录）、zjq_interface.md（接口变更）、zjq_database.md（建库 SQL，仅凭此可重建数据库）'),
            bullet('✅ 统一 JSON 响应格式：{ code, msg, data }，code=0 成功非 0 失败'),

            h2('8.2 技术亮点'),
            bullet('离线演示模式：未配置 API Key 或 MySQL 时，所有 LLM 接口和数据库接口都返回结构一致的 mock 数据，页面不白屏，可独立验收每条链路的功能完整性'),
            bullet('OpenAI 兼容架构：所有大模型调用通过统一的 zjq_llm.js 层，换平台（硅基流动/七牛）只需改 .env 三行（BaseURL / Model ID / API Key），代码不动'),
            bullet('统一 JSON 响应 + 404 兜底：Express 中间件保证前端 fetch 永远拿到 JSON，不会出现 Unexpected token \'<\''),
            bullet('RAG 流程完整：本地文件 → 纯文本解析（pdf-parse + jszip 等）→ 320 字切片 → 中文二元组关键词检索 → 拼装 system 提示词 → LLM 作答'),

            h2('8.3 踩过的坑与解决'),
            bullet('Node 模块缓存：改了 controller 但返回的还是旧数据 → 发现后台还有多个旧 node 进程占着 8205 端口，全部 kill 后重启才生效'),
            bullet('MySQL 未建库：backend/.env 里 DB_NAME=zjq_fullstack 但数据库不存在 → catch 到 Unknown database 后 catch 块进入，但之前 catch 里调用的是 zjq_fail 而不是 zjq_ok → 改成 catch 返回 mock 数据的 zjq_ok 才解决离线降级'),
            bullet('API Key 泄露风险：.env 里不能有任何空格引号、不能进 git → .gitignore 排除 .env、.env.local；前端代码里 grep 搜不到 sk- 开头字符串'),

            h2('8.4 演示入口与答辩准备'),
            boldP('后端服务：', 'http://localhost:8205 （启动命令：双击 start.bat 或 node app.js）'),
            boldP('健康检查：', 'http://localhost:8205/api/health'),
            boldP('新闻接口（离线）：', 'http://localhost:8205/api/news'),
            boldP('图文接口（离线）：', 'http://localhost:8205/api/gallery'),
            boldP('大模型状态：', 'http://localhost:8205/api/llm-status （当前 Key 为空，siliconflow.qiniu.asr 三项均 false，显示离线演示）'),

            h2('8.5 可改进方向'),
            bullet('Token 用量统计：后端在每次调用大模型后记录 prompt_tokens / completion_tokens / total_tokens，并在 health 接口返回累计用量'),
            bullet('流式输出：聊天页目前等完整回答，可以加 SSE（text/event-stream）实现逐字流式渲染'),
            bullet('会话持久化：把多轮对话历史存 MySQL session_messages 表，刷新后继续'),
            bullet('SQLite 作为默认数据库：让没有 MySQL 的同学也能直接跑通，降低验收门槛')
        ]
    }]
});

Packer.toBuffer(doc).then(buffer => {
    const outPath = path.join(__dirname, '24006270205-赵俊清-LLM应用设计-项目报告.docx');
    fs.writeFileSync(outPath, buffer);
    console.log('✅ 报告生成成功：', outPath);
    console.log('   文件大小：', (buffer.length / 1024).toFixed(1), 'KB');
}).catch(e => {
    console.error('❌ 生成失败：', e.message);
    process.exit(1);
});
