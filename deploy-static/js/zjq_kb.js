/*
姓名：赵俊清 | 学号：24006270205 |
时间：2026-11-26 | 大模型：Tencent Hunyuan Hy（均衡）
文件名：frontend/js/zjq_kb.js
说明：知识库（RAG）页面逻辑。原生 JS，无第三方库。
     上传 / 列表 / 删除 / 预置构建 / 问答；服务器数据与错误一律 console.log / console.error；
     控制台输出「发送给大模型的数据」「接收自大模型的数据」。
*/
'use strict';

(function () {
    const zjq_apiUpload = './data/kb-list.json';
    const zjq_apiList = './data/kb-list.json';
    const zjq_apiDelete = './data/kb-list.json';
    const zjq_apiSeed = './data/kb-list.json';
    const zjq_apiAsk = './data/kb-ask.json';

    const zjq_fileInput = document.getElementById('zjq_file');
    const zjq_drop = document.getElementById('zjq_drop');
    const zjq_btnUpload = document.getElementById('zjq_btnUpload');
    const zjq_btnSeed = document.getElementById('zjq_btnSeed');
    const zjq_btnReload = document.getElementById('zjq_btnReload');
    const zjq_uploadStatus = document.getElementById('zjq_uploadStatus');
    const zjq_listStatus = document.getElementById('zjq_listStatus');
    const zjq_kbList = document.getElementById('zjq_kbList');
    const zjq_askInput = document.getElementById('zjq_askInput');
    const zjq_btnAsk = document.getElementById('zjq_btnAsk');
    const zjq_platformKb = document.getElementById('zjq_platformKb');
    const zjq_askStatus = document.getElementById('zjq_askStatus');
    const zjq_answerWrap = document.getElementById('zjq_answerWrap');
    const zjq_answer = document.getElementById('zjq_answer');
    const zjq_hits = document.getElementById('zjq_hits');
    const zjq_sentEl = document.getElementById('zjq_sentKb');
    const zjq_recvEl = document.getElementById('zjq_recvKb');
    const zjq_sentTag = document.getElementById('zjq_sentTagKb');
    const zjq_recvTag = document.getElementById('zjq_recvTagKb');
    const zjq_uploadUrl = document.getElementById('zjq_uploadUrl');

    let zjq_pickedFile = null;
    let zjq_history = [];

    if (zjq_uploadUrl) zjq_uploadUrl.textContent = window.location.origin + zjq_apiUpload;

    function zjq_status(zjq_el, zjq_text, zjq_kind) {
        zjq_el.textContent = zjq_text;
        zjq_el.className = 'zjq_statusLine' + (zjq_kind ? ' ' + zjq_kind : '');
    }

    function zjq_showIO(zjq_el, zjq_tagEl, zjq_data, zjq_tag) {
        zjq_el.textContent = JSON.stringify(zjq_data, null, 2);
        if (zjq_tagEl) zjq_tagEl.textContent = zjq_tag;
    }

    /* ---------- 文件选择：点击 + 拖拽 ---------- */
    function zjq_pick(zjq_file) {
        if (!zjq_file) return;
        zjq_pickedFile = zjq_file;
        zjq_status(zjq_uploadStatus, '已选择：' + zjq_file.name + '（' +
            (zjq_file.size / 1024).toFixed(1) + ' KB），点「上传并解析」开始。', 'zjq_ok');
    }
    zjq_fileInput.addEventListener('change', function (zjq_e) { zjq_pick(zjq_e.target.files[0]); });
    ['dragenter', 'dragover'].forEach(function (zjq_ev) {
        zjq_drop.addEventListener(zjq_ev, function (zjq_e) {
            zjq_e.preventDefault(); zjq_drop.classList.add('zjq_over');
        });
    });
    ['dragleave', 'drop'].forEach(function (zjq_ev) {
        zjq_drop.addEventListener(zjq_ev, function (zjq_e) {
            zjq_e.preventDefault(); zjq_drop.classList.remove('zjq_over');
        });
    });
    zjq_drop.addEventListener('drop', function (zjq_e) {
        if (zjq_e.dataTransfer && zjq_e.dataTransfer.files.length) zjq_pick(zjq_e.dataTransfer.files[0]);
    });
    zjq_drop.addEventListener('click', function (zjq_e) {
        if (zjq_e.target !== zjq_fileInput) zjq_fileInput.click();
    });

    /* ---------- 上传解析 ---------- */
    async function zjq_upload() {
        const zjq_file = zjq_pickedFile || zjq_fileInput.files[0];
        if (!zjq_file) { zjq_status(zjq_uploadStatus, '请先选择或拖入一个本地文件。', 'zjq_bad'); return; }
        zjq_btnUpload.disabled = true;
        zjq_status(zjq_uploadStatus, '正在上传并解析 ' + zjq_file.name + ' …', '');
        const zjq_fd = new FormData();
        zjq_fd.append('zjq_file', zjq_file, zjq_file.name);
        zjq_fd.append('zjq_source', '用户上传');
        console.log('[知识库] → 上传文件：', zjq_file.name, zjq_file.type, zjq_file.size, 'bytes');
        try {
            const zjq_res = await fetch(zjq_apiUpload, { method: "GET", body: zjq_fd });
            const zjq_json = await zjq_res.json();
            console.log('[知识库] ← 上传响应：', zjq_json);
            if (zjq_json.code === 0) {
                const zjq_f = zjq_json.data.file;
                zjq_status(zjq_uploadStatus, '解析成功：' + zjq_f.zjq_name + ' → ' +
                    zjq_f.zjq_chars + ' 字，切成 ' + zjq_f.zjq_chunk_count + ' 片。' +
                    (zjq_f.zjq_note ? ' ' + zjq_f.zjq_note : ''), 'zjq_ok');
                await zjq_loadList();
            } else {
                console.error('[知识库] 上传失败：', zjq_json.msg, zjq_json.data);
                zjq_status(zjq_uploadStatus, '上传失败：' + zjq_json.msg + ' ' +
                    ((zjq_json.data && zjq_json.data.error) || ''), 'zjq_bad');
            }
        } catch (zjq_err) {
            console.error('[知识库] 上传异常：', zjq_err);
            zjq_status(zjq_uploadStatus, '网络异常：' + zjq_err.message, 'zjq_bad');
        } finally {
            zjq_btnUpload.disabled = false;
        }
    }

    /* ---------- 列表 / 管理 ---------- */
    async function zjq_loadList() {
        try {
            const zjq_res = await fetch(zjq_apiList);
            const zjq_json = await zjq_res.json();
            console.log('[知识库] ← 列表响应：', zjq_json);
            if (zjq_json.code !== 0) {
                console.error('[知识库] 列表失败：', zjq_json.msg);
                zjq_status(zjq_listStatus, '读取失败：' + zjq_json.msg, 'zjq_bad');
                return;
            }
            const zjq_list = zjq_json.data.list || [];
            zjq_status(zjq_listStatus, '共 ' + zjq_json.data.total + ' 个知识库文件 / ' +
                zjq_json.data.chunks + ' 个可检索片段。', 'zjq_ok');
            zjq_kbList.innerHTML = '';
            if (!zjq_list.length) {
                const zjq_e = document.createElement('div');
                zjq_e.className = 'zjq_kbEmpty';
                zjq_e.textContent = '知识库还是空的，点上面「一键构建 2 个预置知识库文件」或上传本地文件。';
                zjq_kbList.appendChild(zjq_e);
                return;
            }
            zjq_list.forEach(function (zjq_f) {
                const zjq_item = document.createElement('div');
                zjq_item.className = 'zjq_kbItem';
                const zjq_ext = document.createElement('div');
                zjq_ext.className = 'zjq_kbExt';
                zjq_ext.textContent = (zjq_f.zjq_type || 'FILE').replace('.', '').toUpperCase();
                const zjq_info = document.createElement('div');
                zjq_info.className = 'zjq_kbInfo';
                const zjq_name = document.createElement('div');
                zjq_name.className = 'zjq_kbName';
                zjq_name.textContent = zjq_f.zjq_name;
                const zjq_meta = document.createElement('div');
                zjq_meta.className = 'zjq_kbMeta';
                zjq_meta.textContent = zjq_f.zjq_chars + ' 字 · ' + zjq_f.zjq_chunk_count +
                    ' 片 · ' + zjq_f.zjq_size + ' 字节 · ' + zjq_f.zjq_source + ' · ' + zjq_f.zjq_time;
                zjq_info.appendChild(zjq_name);
                zjq_info.appendChild(zjq_meta);
                if (zjq_f.zjq_note) {
                    const zjq_note = document.createElement('div');
                    zjq_note.className = 'zjq_kbMeta';
                    zjq_note.textContent = zjq_f.zjq_note;
                    zjq_info.appendChild(zjq_note);
                }
                const zjq_del = document.createElement('button');
                zjq_del.className = 'zjq_btn zjq_btnGhost zjq_btnSm';
                zjq_del.type = 'button';
                zjq_del.textContent = '删除';
                zjq_del.addEventListener('click', function () { zjq_doDelete(zjq_f.zjq_id, zjq_f.zjq_name); });
                zjq_item.appendChild(zjq_ext);
                zjq_item.appendChild(zjq_info);
                zjq_item.appendChild(zjq_del);
                zjq_kbList.appendChild(zjq_item);
            });
        } catch (zjq_err) {
            console.error('[知识库] 列表异常：', zjq_err);
            zjq_status(zjq_listStatus, '网络异常：' + zjq_err.message, 'zjq_bad');
        }
    }

    async function zjq_doDelete(zjq_id, zjq_name) {
        console.log('[知识库] → 删除文件：', zjq_id, zjq_name);
        try {
            const zjq_res = await fetch(zjq_apiDelete, {
                method: "GET", headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ zjq_id: zjq_id })
            });
            const zjq_json = await zjq_res.json();
            console.log('[知识库] ← 删除响应：', zjq_json);
            if (zjq_json.code === 0) {
                zjq_status(zjq_listStatus, '已删除 ' + zjq_name, 'zjq_ok');
                await zjq_loadList();
            } else {
                console.error('[知识库] 删除失败：', zjq_json.msg);
                zjq_status(zjq_listStatus, '删除失败：' + zjq_json.msg, 'zjq_bad');
            }
        } catch (zjq_err) {
            console.error('[知识库] 删除异常：', zjq_err);
            zjq_status(zjq_listStatus, '网络异常：' + zjq_err.message, 'zjq_bad');
        }
    }

    async function zjq_seed() {
        zjq_btnSeed.disabled = true;
        zjq_status(zjq_uploadStatus, '正在构建 2 个预置知识库文件…', '');
        console.log('[知识库] → 一键构建预置知识库文件');
        try {
            const zjq_res = await fetch(zjq_apiSeed, { method: "GET" });
            const zjq_json = await zjq_res.json();
            console.log('[知识库] ← 构建响应：', zjq_json);
            if (zjq_json.code === 0) {
                zjq_status(zjq_uploadStatus, '已构建 ' + zjq_json.data.total +
                    ' 个知识库文件（backend/knowledge/ 下的 TXT 与 MD），解析切片完成。', 'zjq_ok');
                await zjq_loadList();
            } else {
                console.error('[知识库] 构建失败：', zjq_json.msg);
                zjq_status(zjq_uploadStatus, '构建失败：' + zjq_json.msg, 'zjq_bad');
            }
        } catch (zjq_err) {
            console.error('[知识库] 构建异常：', zjq_err);
            zjq_status(zjq_uploadStatus, '网络异常：' + zjq_err.message, 'zjq_bad');
        } finally { zjq_btnSeed.disabled = false; }
    }

    /* ---------- RAG 问答 ---------- */
    async function zjq_ask() {
        const zjq_q = zjq_askInput.value.trim();
        if (!zjq_q) { zjq_status(zjq_askStatus, '请先输入问题。', 'zjq_bad'); return; }
        zjq_btnAsk.disabled = true;
        zjq_status(zjq_askStatus, '正在检索知识库并请求大模型…', '');
        const zjq_payload = {
            question: zjq_q,
            platform: zjq_platformKb.value,
            history: zjq_history
        };
        console.log('[知识库] → 请求 ./data/kb-ask.json：', zjq_payload);
        try {
            const zjq_res = await fetch(zjq_apiAsk, {
                method: "GET", headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zjq_payload)
            });
            const zjq_json = await zjq_res.json();
            console.log('[知识库] ← ./data/kb-ask.json 响应：', zjq_json);
            if (zjq_json.code !== 0) console.error('[知识库] 问答失败：', zjq_json.msg, zjq_json.data);
            const zjq_d = zjq_json.data || {};

            /* 本节课硬性要求：控制台输出发送给大模型的数据、接收自大模型的数据 */
            console.log('%c【发送给大模型的数据】', 'color:#A5341F;font-weight:bold', zjq_d.sent || null);
            console.log('%c【接收自大模型的数据】', 'color:#2F6B4F;font-weight:bold', zjq_d.received || null);
            zjq_showIO(zjq_sentEl, zjq_sentTag, zjq_d.sent || { note: '本次未产生请求体' },
                (zjq_d.model || '') + ' · 含检索片段');
            zjq_showIO(zjq_recvEl, zjq_recvTag, zjq_d.received || {},
                zjq_d.offline ? '离线演示响应' : '真实模型响应');

            const zjq_text = zjq_json.code === 0 ? (zjq_d.answer || '（模型没有返回内容）')
                : ('请求失败：' + zjq_json.msg);
            zjq_answer.textContent = zjq_text;
            zjq_answerWrap.style.display = 'block';
            zjq_status(zjq_askStatus, '命中 ' + (zjq_d.hit_count || 0) + ' 个知识片段 · ' +
                (zjq_d.platform || '') + ' · ' + (zjq_d.model || '') +
                (zjq_d.offline ? ' · 离线演示模式' : ' · 真实模型'), zjq_d.offline ? 'zjq_warn' : 'zjq_ok');

            zjq_hits.innerHTML = '';
            const zjq_hitList = zjq_d.hits || [];
            if (!zjq_hitList.length) {
                const zjq_e = document.createElement('div');
                zjq_e.className = 'zjq_kbEmpty';
                zjq_e.textContent = '本次没有检索到相关资料（可先上传文件或构建预置知识库）。';
                zjq_hits.appendChild(zjq_e);
            } else {
                zjq_hitList.forEach(function (zjq_h, zjq_i) {
                    const zjq_box = document.createElement('div');
                    zjq_box.className = 'zjq_hit';
                    const zjq_head = document.createElement('div');
                    zjq_head.className = 'zjq_hitHead';
                    zjq_head.textContent = '资料 ' + (zjq_i + 1) + ' · ' + zjq_h.zjq_file +
                        ' · 第 ' + zjq_h.zjq_index + ' 片 · 相关度 ' + zjq_h.zjq_score;
                    zjq_box.appendChild(zjq_head);
                    zjq_box.appendChild(document.createTextNode(zjq_h.zjq_content));
                    zjq_hits.appendChild(zjq_box);
                });
            }
            if (zjq_json.code === 0) {
                zjq_history.push({ role: 'user', content: zjq_q });
                zjq_history.push({ role: 'assistant', content: zjq_text });
                if (zjq_history.length > 12) zjq_history = zjq_history.slice(-12);
            }
        } catch (zjq_err) {
            console.error('[知识库] 问答异常：', zjq_err);
            zjq_status(zjq_askStatus, '网络异常：' + zjq_err.message, 'zjq_bad');
        } finally { zjq_btnAsk.disabled = false; }
    }

    zjq_btnUpload.addEventListener('click', zjq_upload);
    zjq_btnSeed.addEventListener('click', zjq_seed);
    zjq_btnReload.addEventListener('click', zjq_loadList);
    zjq_btnAsk.addEventListener('click', zjq_ask);
    zjq_askInput.addEventListener('keydown', function (zjq_e) {
        if (zjq_e.key === 'Enter' && !zjq_e.shiftKey) { zjq_e.preventDefault(); zjq_ask(); }
    });
    function zjq_fill(zjq_t) { zjq_askInput.value = zjq_t; zjq_askInput.focus(); }
    document.getElementById('zjq_btnQ1').addEventListener('click', function () { zjq_fill('营业时间是几点？周末会延长吗？'); });
    document.getElementById('zjq_btnQ2').addEventListener('click', function () { zjq_fill('招牌菜有哪些？最推荐哪个？'); });
    document.getElementById('zjq_btnQ3').addEventListener('click', function () { zjq_fill('API Key 应该放在哪里？为什么？'); });

    zjq_loadList();
})();
