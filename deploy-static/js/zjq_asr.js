/*
姓名：赵俊清 | 学号：24006270205 |
时间：2026-11-26 | 大模型：Tencent Hunyuan Hy（均衡）
文件名：frontend/js/zjq_asr.js
说明：语音识别前端逻辑。原生 JS + MediaRecorder 录音（不用任何第三方库）。
     服务器数据与错误 console.log / console.error；控制台输出大模型收发数据。
*/
'use strict';

(function () {
    const zjq_api = './data/asr.json';
    const zjq_fileInput = document.getElementById('zjq_audioFile');
    const zjq_drop = document.getElementById('zjq_dropAsr');
    const zjq_btnRecord = document.getElementById('zjq_btnRecord');
    const zjq_btnStop = document.getElementById('zjq_btnStop');
    const zjq_btnAsr = document.getElementById('zjq_btnAsr');
    const zjq_recordStatus = document.getElementById('zjq_recordStatus');
    const zjq_asrStatus = document.getElementById('zjq_asrStatus');
    const zjq_transcript = document.getElementById('zjq_transcript');
    const zjq_audioMeta = document.getElementById('zjq_audioMeta');
    const zjq_player = document.getElementById('zjq_audioPlayer');
    const zjq_sentEl = document.getElementById('zjq_sentAsr');
    const zjq_recvEl = document.getElementById('zjq_recvAsr');
    const zjq_sentTag = document.getElementById('zjq_sentTagAsr');
    const zjq_recvTag = document.getElementById('zjq_recvTagAsr');
    const zjq_url = document.getElementById('zjq_asrUrl');

    let zjq_picked = null;
    let zjq_recorder = null;
    let zjq_stream = null;
    let zjq_chunks = [];

    if (zjq_url) zjq_url.textContent = window.location.origin + zjq_api;

    function zjq_setStatus(zjq_el, zjq_text, zjq_kind) {
        zjq_el.textContent = zjq_text;
        zjq_el.className = 'zjq_statusLine' + (zjq_kind ? ' ' + zjq_kind : '');
    }

    function zjq_useBlob(zjq_blob, zjq_name) {
        const zjq_file = new File([zjq_blob], zjq_name, { type: zjq_blob.type || 'audio/webm' });
        zjq_picked = zjq_file;
        zjq_audioMeta.textContent = '音频信息：' + zjq_file.name + ' · ' +
            (zjq_file.type || '未知') + ' · ' + (zjq_file.size / 1024).toFixed(1) + ' KB';
        const zjq_objUrl = URL.createObjectURL(zjq_file);
        zjq_player.src = zjq_objUrl;
        zjq_player.style.display = 'block';
        zjq_player.onended = function () { /* 保留播放器以便重听 */ };
        return zjq_file;
    }

    function zjq_pickFile(zjq_file) {
        if (!zjq_file) return;
        zjq_useBlob(zjq_file, zjq_file.name);
        zjq_setStatus(zjq_recordStatus, '已选择本地音频，点「语音转文字」开始识别。', 'zjq_ok');
    }

    zjq_fileInput.addEventListener('change', function (zjq_e) { zjq_pickFile(zjq_e.target.files[0]); });
    ['dragenter', 'dragover'].forEach(function (zjq_ev) {
        zjq_drop.addEventListener(zjq_ev, function (zjq_e) { zjq_e.preventDefault(); zjq_drop.classList.add('zjq_over'); });
    });
    ['dragleave', 'drop'].forEach(function (zjq_ev) {
        zjq_drop.addEventListener(zjq_ev, function (zjq_e) { zjq_e.preventDefault(); zjq_drop.classList.remove('zjq_over'); });
    });
    zjq_drop.addEventListener('drop', function (zjq_e) {
        if (zjq_e.dataTransfer && zjq_e.dataTransfer.files.length) zjq_pickFile(zjq_e.dataTransfer.files[0]);
    });
    zjq_drop.addEventListener('click', function (zjq_e) { if (zjq_e.target !== zjq_fileInput) zjq_fileInput.click(); });

    /* ---------- 浏览器录音：MediaRecorder（原生 API） ---------- */
    async function zjq_startRecord() {
        if (!navigator.mediaDevices || !window.MediaRecorder) {
            zjq_setStatus(zjq_recordStatus, '当前浏览器不支持录音，请改用「上传本地音频文件」。', 'zjq_bad');
            console.error('[语音识别] 浏览器不支持 MediaRecorder');
            return;
        }
        try {
            zjq_stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            zjq_chunks = [];
            const zjq_mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus' : '';
            zjq_recorder = zjq_mime ? new MediaRecorder(zjq_stream, { mimeType: zjq_mime }) : new MediaRecorder(zjq_stream);
            zjq_recorder.ondataavailable = function (zjq_e) { if (zjq_e.data.size) zjq_chunks.push(zjq_e.data); };
            zjq_recorder.onstop = function () {
                const zjq_blob = new Blob(zjq_chunks, { type: zjq_recorder.mimeType || 'audio/webm' });
                zjq_useBlob(zjq_blob, 'zjq_record.' + (zjq_blob.type.indexOf('ogg') >= 0 ? 'ogg' : 'webm'));
                zjq_setStatus(zjq_recordStatus, '录音完成，可试听，点「语音转文字」开始识别。', 'zjq_ok');
                console.log('[语音识别] 录音完成：', zjq_blob.size, 'bytes', zjq_blob.type);
                if (zjq_stream) { zjq_stream.getTracks().forEach(function (zjq_t) { zjq_t.stop(); }); zjq_stream = null; }
            };
            zjq_recorder.start();
            zjq_btnRecord.disabled = true;
            zjq_btnStop.disabled = false;
            zjq_setStatus(zjq_recordStatus, '<span class="zjq_recDot"></span>正在录音…说完点「停止录音」。', 'zjq_warn');
            console.log('[语音识别] 开始录音，mimeType =', zjq_recorder.mimeType || '(默认)');
        } catch (zjq_err) {
            console.error('[语音识别] 无法访问麦克风：', zjq_err);
            zjq_setStatus(zjq_recordStatus, '麦克风授权失败：' + zjq_err.message + '，可改用上传本地音频。', 'zjq_bad');
        }
    }

    function zjq_stopRecord() {
        if (zjq_recorder && zjq_recorder.state !== 'inactive') zjq_recorder.stop();
        zjq_btnRecord.disabled = false;
        zjq_btnStop.disabled = true;
    }

    /* 页面展示时折叠 base64，控制台保留完整对象 */
    function zjq_shrink(zjq_data) {
        try {
            const zjq_copy = JSON.parse(null); // 静态部署：跳过 POST body
            const zjq_msgs = zjq_copy && zjq_copy.messages;
            if (Array.isArray(zjq_msgs)) {
                zjq_msgs.forEach(function (zjq_m) {
                    if (Array.isArray(zjq_m.content)) {
                        zjq_m.content.forEach(function (zjq_c) {
                            if (zjq_c.type === 'input_audio' && zjq_c.input_audio && zjq_c.input_audio.data) {
                                const zjq_d = zjq_c.input_audio.data;
                                zjq_c.input_audio.data = zjq_d.slice(0, 42) +
                                    '…[base64 已折叠，共 ' + zjq_d.length + ' 字符；完整数据在控制台]';
                            }
                        });
                    }
                });
            }
            return zjq_copy;
        } catch (zjq_e) { return zjq_data; }
    }

    async function zjq_run() {
        const zjq_file = zjq_picked || zjq_fileInput.files[0];
        if (!zjq_file) { zjq_setStatus(zjq_asrStatus, '请先录音或选择音频文件。', 'zjq_bad'); return; }
        zjq_btnAsr.disabled = true;
        zjq_setStatus(zjq_asrStatus, '正在上传音频并请求七牛 Qwen-Audio-3.0-ASR-Flash…', '');
        zjq_transcript.textContent = '正在识别…';
        const zjq_fd = new FormData();
        zjq_fd.append('zjq_audio', zjq_file, zjq_file.name);
        console.log('[语音识别] → 请求 ./data/asr.json：', zjq_file.name, zjq_file.type, zjq_file.size);
        try {
            const zjq_res = await fetch(zjq_api, { method: "GET", body: zjq_fd });
            const zjq_json = await zjq_res.json();
            console.log('[语音识别] ← ./data/asr.json 响应：', zjq_json);
            if (zjq_json.code !== 0) console.error('[语音识别] 接口失败：', zjq_json.msg, zjq_json.data);
            const zjq_d = zjq_json.data || {};

            console.log('%c【发送给大模型的数据】', 'color:#A5341F;font-weight:bold', zjq_d.sent || null);
            console.log('%c【接收自大模型的数据】', 'color:#2F6B4F;font-weight:bold', zjq_d.received || null);
            zjq_sentEl.textContent = JSON.stringify(zjq_shrink(zjq_d.sent || {}), null, 2);
            zjq_recvEl.textContent = JSON.stringify(zjq_d.received || {}, null, 2);
            zjq_sentTag.textContent = (zjq_d.model || '') + ' · 含音频 data URI';
            zjq_recvTag.textContent = zjq_d.offline ? '离线演示响应' : '真实模型响应';

            zjq_transcript.textContent = zjq_json.code === 0 ? (zjq_d.text || '（模型没有返回文字）')
                : ('请求失败：' + zjq_json.msg + ' ' + (zjq_d.error || ''));
            zjq_audioMeta.textContent = '音频信息：' + (zjq_d.filename || zjq_file.name) + ' · ' +
                (zjq_d.mime || '') + ' · ' + (zjq_d.size || zjq_file.size) + ' 字节 · 模型 ' + (zjq_d.model || '');
            zjq_setStatus(zjq_asrStatus, zjq_json.code === 0
                ? (zjq_d.offline ? '识别完成（离线演示模式，填 Key 后为真实转写）。' : '识别完成（真实模型返回）。')
                : '识别失败：' + zjq_json.msg, zjq_d.offline ? 'zjq_warn' : (zjq_json.code === 0 ? 'zjq_ok' : 'zjq_bad'));
        } catch (zjq_err) {
            console.error('[语音识别] 请求异常：', zjq_err);
            zjq_transcript.textContent = '网络异常：' + zjq_err.message;
            zjq_setStatus(zjq_asrStatus, '网络异常：' + zjq_err.message, 'zjq_bad');
        } finally { zjq_btnAsr.disabled = false; }
    }

    zjq_btnRecord.addEventListener('click', zjq_startRecord);
    zjq_btnStop.addEventListener('click', zjq_stopRecord);
    zjq_btnAsr.addEventListener('click', zjq_run);
})();
