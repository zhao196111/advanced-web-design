/*
姓名：赵俊清 | 学号：24006270205 |
时间：2026-11-26 | 大模型：Tencent Hunyuan Hy（均衡）
文件名：frontend/js/zjq_vision.js
说明：图像识别前端逻辑。原生 JS。图片加载失败显示占位色块；
     服务器数据与错误 console.log / console.error；控制台输出大模型收发数据。
*/
'use strict';

(function () {
    const zjq_api = './data/vision.json';
    const zjq_input = document.getElementById('zjq_image');
    const zjq_drop = document.getElementById('zjq_dropVision');
    const zjq_previewWrap = document.getElementById('zjq_previewWrap');
    const zjq_btn = document.getElementById('zjq_btnVision');
    const zjq_status = document.getElementById('zjq_visionStatus');
    const zjq_desc = document.getElementById('zjq_description');
    const zjq_meta = document.getElementById('zjq_metaInfo');
    const zjq_platform = document.getElementById('zjq_platformVision');
    const zjq_prompt = document.getElementById('zjq_visionPrompt');
    const zjq_sentEl = document.getElementById('zjq_sentVision');
    const zjq_recvEl = document.getElementById('zjq_recvVision');
    const zjq_sentTag = document.getElementById('zjq_sentTagVision');
    const zjq_recvTag = document.getElementById('zjq_recvTagVision');
    const zjq_url = document.getElementById('zjq_visionUrl');

    let zjq_picked = null;

    if (zjq_url) zjq_url.textContent = window.location.origin + zjq_api;

    function zjq_setStatus(zjq_text, zjq_kind) {
        zjq_status.textContent = zjq_text;
        zjq_status.className = 'zjq_statusLine' + (zjq_kind ? ' ' + zjq_kind : '');
    }

    function zjq_preview(zjq_file) {
        zjq_previewWrap.innerHTML = '';
        const zjq_reader = new FileReader();
        zjq_reader.onload = function (zjq_e) {
            const zjq_img = document.createElement('img');
            zjq_img.className = 'zjq_preview';
            zjq_img.alt = '待识别图片预览：' + zjq_file.name;
            zjq_img.src = zjq_e.target.result;
            /* 图片加载失败：占位色块，不出现破图图标（AGENTS.md 约定） */
            zjq_img.onerror = function () {
                console.error('[图像识别] 预览图片加载失败：', zjq_file.name);
                const zjq_ph = document.createElement('div');
                zjq_ph.className = 'zjq_previewFail';
                zjq_ph.textContent = '图片预览失败（占位色块）· ' + zjq_file.name;
                zjq_previewWrap.innerHTML = '';
                zjq_previewWrap.appendChild(zjq_ph);
            };
            zjq_previewWrap.appendChild(zjq_img);
        };
        zjq_reader.onerror = function () { console.error('[图像识别] FileReader 读取失败'); };
        zjq_reader.readAsDataURL(zjq_file);
    }

    function zjq_pick(zjq_file) {
        if (!zjq_file) return;
        if (zjq_file.type && zjq_file.type.indexOf('image/') !== 0) {
            zjq_setStatus('请上传图片文件（JPG / PNG / GIF / WEBP / BMP）。', 'zjq_bad');
            return;
        }
        zjq_picked = zjq_file;
        zjq_preview(zjq_file);
        zjq_meta.textContent = '图片信息：' + zjq_file.name + ' · ' + (zjq_file.type || '未知类型') +
            ' · ' + (zjq_file.size / 1024).toFixed(1) + ' KB';
        zjq_setStatus('已选择图片，点「识别图片」发给大模型。', 'zjq_ok');
    }

    zjq_input.addEventListener('change', function (zjq_e) { zjq_pick(zjq_e.target.files[0]); });
    ['dragenter', 'dragover'].forEach(function (zjq_ev) {
        zjq_drop.addEventListener(zjq_ev, function (zjq_e) { zjq_e.preventDefault(); zjq_drop.classList.add('zjq_over'); });
    });
    ['dragleave', 'drop'].forEach(function (zjq_ev) {
        zjq_drop.addEventListener(zjq_ev, function (zjq_e) { zjq_e.preventDefault(); zjq_drop.classList.remove('zjq_over'); });
    });
    zjq_drop.addEventListener('drop', function (zjq_e) {
        if (zjq_e.dataTransfer && zjq_e.dataTransfer.files.length) zjq_pick(zjq_e.dataTransfer.files[0]);
    });
    zjq_drop.addEventListener('click', function (zjq_e) { if (zjq_e.target !== zjq_input) zjq_input.click(); });

    /* 页面展示时对 base64 做折叠（控制台仍是完整对象） */
    function zjq_shrink(zjq_data) {
        try {
            const zjq_copy = JSON.parse(null); // 静态部署：跳过 POST body
            const zjq_msgs = zjq_copy && zjq_copy.messages;
            if (Array.isArray(zjq_msgs)) {
                zjq_msgs.forEach(function (zjq_m) {
                    if (Array.isArray(zjq_m.content)) {
                        zjq_m.content.forEach(function (zjq_c) {
                            if (zjq_c.type === 'image_url' && zjq_c.image_url && zjq_c.image_url.url) {
                                const zjq_u = zjq_c.image_url.url;
                                zjq_c.image_url.url = zjq_u.slice(0, 42) +
                                    '…[base64 已折叠，共 ' + zjq_u.length + ' 字符；完整数据在控制台]';
                            }
                        });
                    }
                });
            }
            return zjq_copy;
        } catch (zjq_e) { return zjq_data; }
    }

    async function zjq_run() {
        const zjq_file = zjq_picked || zjq_input.files[0];
        if (!zjq_file) { zjq_setStatus('请先选择一张图片。', 'zjq_bad'); return; }
        zjq_btn.disabled = true;
        zjq_setStatus('正在上传图片并请求多模态模型…', '');
        zjq_desc.textContent = '正在思考…';
        const zjq_fd = new FormData();
        zjq_fd.append('zjq_image', zjq_file, zjq_file.name);
        zjq_fd.append('zjq_platform', zjq_platform.value);
        zjq_fd.append('zjq_prompt', zjq_prompt.value.trim());
        console.log('[图像识别] → 请求 ./data/vision.json：', zjq_file.name, zjq_file.type, zjq_file.size);
        try {
            const zjq_res = await fetch(zjq_api, { method: "GET", body: zjq_fd });
            const zjq_json = await zjq_res.json();
            console.log('[图像识别] ← ./data/vision.json 响应：', zjq_json);
            if (zjq_json.code !== 0) console.error('[图像识别] 接口失败：', zjq_json.msg, zjq_json.data);
            const zjq_d = zjq_json.data || {};

            console.log('%c【发送给大模型的数据】', 'color:#A5341F;font-weight:bold', zjq_d.sent || null);
            console.log('%c【接收自大模型的数据】', 'color:#2F6B4F;font-weight:bold', zjq_d.received || null);
            zjq_sentEl.textContent = JSON.stringify(zjq_shrink(zjq_d.sent || {}), null, 2);
            zjq_recvEl.textContent = JSON.stringify(zjq_d.received || {}, null, 2);
            zjq_sentTag.textContent = (zjq_d.model || '') + ' · 含图片 data URI';
            zjq_recvTag.textContent = zjq_d.offline ? '离线演示响应' : '真实模型响应';

            zjq_desc.textContent = zjq_json.code === 0 ? (zjq_d.description || '（模型没有返回描述）')
                : ('请求失败：' + zjq_json.msg + ' ' + (zjq_d.error || ''));
            zjq_meta.textContent = '图片信息：' + (zjq_d.filename || zjq_file.name) + ' · ' +
                (zjq_d.mime || '') + ' · ' + (zjq_d.size || zjq_file.size) + ' 字节 · 平台 ' +
                (zjq_d.platform || '') + ' · ' + (zjq_d.model || '');
            zjq_setStatus(zjq_json.code === 0
                ? (zjq_d.offline ? '识别完成（离线演示模式，填 Key 后为真实描述）。' : '识别完成（真实模型返回）。')
                : '识别失败：' + zjq_json.msg, zjq_d.offline ? 'zjq_warn' : (zjq_json.code === 0 ? 'zjq_ok' : 'zjq_bad'));
        } catch (zjq_err) {
            console.error('[图像识别] 请求异常：', zjq_err);
            zjq_desc.textContent = '网络异常：' + zjq_err.message;
            zjq_setStatus('网络异常：' + zjq_err.message, 'zjq_bad');
        } finally { zjq_btn.disabled = false; }
    }

    zjq_btn.addEventListener('click', zjq_run);
})();
