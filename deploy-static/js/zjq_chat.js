/*
姓名：赵俊清 | 学号：24006270205 |
时间：2026-11-26 | 大模型：Tencent Hunyuan Hy（均衡）
文件名：frontend/js/zjq_chat.js
说明：AI 聊天 / 在线客服前端逻辑。原生 JS，无第三方库。
     1) 维护完整 messages 数组实现多轮对话；
     2) 浏览器控制台输出「发送给大模型的数据」「接收自大模型的数据」；
     3) 服务器返回的数据与错误一律 console.log / console.error（AGENTS.md 约定）。
*/
'use strict';

(function () {
    const zjq_api = './data/chat.json';
    const zjq_statusApi = './data/health.json';
    const zjq_box = document.getElementById('zjq_chatBox');
    const zjq_input = document.getElementById('zjq_question');
    const zjq_btnSend = document.getElementById('zjq_btnSend');
    const zjq_btnClear = document.getElementById('zjq_btnClear');
    const zjq_platform = document.getElementById('zjq_platform');
    const zjq_scene = document.getElementById('zjq_scene');
    const zjq_keyStatus = document.getElementById('zjq_keyStatus');
    const zjq_sentEl = document.getElementById('zjq_sent');
    const zjq_recvEl = document.getElementById('zjq_received');
    const zjq_sentTag = document.getElementById('zjq_sentTag');
    const zjq_recvTag = document.getElementById('zjq_recvTag');
    const zjq_apiUrl = document.getElementById('zjq_apiUrl');

    /* 完整多轮历史：每次请求整体发送 */
    let zjq_messages = [];
    let zjq_busy = false;

    if (zjq_apiUrl) zjq_apiUrl.textContent = window.location.origin + zjq_api;

    function zjq_esc(zjq_s) {
        return String(zjq_s === undefined || zjq_s === null ? '' : zjq_s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function zjq_bubble(zjq_role, zjq_text, zjq_tag) {
        const zjq_wrap = document.createElement('div');
        zjq_wrap.className = 'zjq_msg' + (zjq_role === 'user' ? ' zjq_me' : '');
        const zjq_av = document.createElement('div');
        zjq_av.className = 'zjq_msgAvatar';
        zjq_av.textContent = zjq_role === 'user' ? '我' : 'AI';
        const zjq_body = document.createElement('div');
        zjq_body.className = 'zjq_msgBody';
        zjq_body.textContent = zjq_text;
        if (zjq_tag) {
            const zjq_meta = document.createElement('div');
            zjq_meta.className = 'zjq_msgMeta';
            zjq_meta.textContent = zjq_tag;
            zjq_body.appendChild(zjq_meta);
        }
        zjq_wrap.appendChild(zjq_av);
        zjq_wrap.appendChild(zjq_body);
        zjq_box.appendChild(zjq_wrap);
        zjq_box.scrollTop = zjq_box.scrollHeight;
        return zjq_wrap;
    }

    function zjq_setStatus(zjq_text, zjq_kind) {
        zjq_keyStatus.textContent = zjq_text;
        zjq_keyStatus.className = 'zjq_statusLine' + (zjq_kind ? ' ' + zjq_kind : '');
    }

    function zjq_showIO(zjq_el, zjq_tagEl, zjq_data, zjq_tag) {
        zjq_el.textContent = JSON.stringify(zjq_data, null, 2);
        if (zjq_tagEl) zjq_tagEl.textContent = zjq_tag;
    }

    async function zjq_loadStatus() {
        try {
            const zjq_res = await fetch(zjq_statusApi);
            const zjq_json = await zjq_res.json();
            console.log('[聊天] 平台状态响应：', zjq_json);
            const zjq_sf = zjq_json.data.siliconflow;
            const zjq_qn = zjq_json.data.qiniu;
            const zjq_asr = zjq_json.data.asr;
            const zjq_txt = '硅基流动 Key：' + (zjq_sf.zjq_hasKey ? '已配置' : '未配置') +
                '　｜　七牛 Key：' + (zjq_qn.zjq_hasKey ? '已配置' : '未配置') +
                '　｜　语音模型：' + zjq_asr.zjq_model;
            zjq_setStatus(zjq_txt + '　（' +
                (zjq_sf.zjq_hasKey || zjq_qn.zjq_hasKey ? '真实调用模式' : '离线演示模式，填 Key 后重启即真实调用') + '）',
                (zjq_sf.zjq_hasKey || zjq_qn.zjq_hasKey) ? 'zjq_ok' : 'zjq_warn');
        } catch (zjq_err) {
            console.error('[聊天] 读取平台状态失败：', zjq_err);
            zjq_setStatus('平台状态读取失败，请确认后端已启动在 8205 端口。', 'zjq_bad');
        }
    }

    async function zjq_send(zjq_text, zjq_display) {
        if (zjq_busy) return;
        const zjq_q = (zjq_text || zjq_input.value || '').trim();
        if (!zjq_q) return;
        zjq_busy = true;
        zjq_btnSend.disabled = true;
        zjq_input.value = '';

        zjq_bubble('user', zjq_display || zjq_q, '');
        zjq_messages.push({ role: 'user', content: zjq_q });
        const zjq_wait = zjq_bubble('assistant', '正在思考…', '');

        const zjq_payload = {
            messages: zjq_messages,
            platform: zjq_platform.value,
            scene: zjq_scene.value
        };
        /* 控制台输出：发给后端 ./data/chat.json 的数据 */
        console.log('[聊天] → 请求 ./data/chat.json：', zjq_payload);

        try {
            const zjq_res = await fetch(zjq_api, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zjq_payload)
            });
            const zjq_json = await zjq_res.json();
            /* 控制台输出：服务器返回的完整数据 */
            console.log('[聊天] ← ./data/chat.json 响应：', zjq_json);
            if (zjq_json.code !== 0) {
                console.error('[聊天] 接口返回失败：', zjq_json.msg, zjq_json.data);
            }

            const zjq_d = zjq_json.data || {};
            /* 本节课硬性要求：控制台输出发送给大模型的数据、接收自大模型的数据 */
            console.log('%c【发送给大模型的数据】', 'color:#A5341F;font-weight:bold', zjq_d.sent || null);
            console.log('%c【接收自大模型的数据】', 'color:#2F6B4F;font-weight:bold', zjq_d.received || null);
            zjq_showIO(zjq_sentEl, zjq_sentTag, zjq_d.sent || { note: '本次未产生请求体' },
                (zjq_d.model || '') + ' · ' + zjq_json.msg);
            zjq_showIO(zjq_recvEl, zjq_recvTag, zjq_d.received || {}, zjq_d.offline ? '离线演示响应' : '真实模型响应');

            const zjq_answer = zjq_json.code === 0 ? (zjq_d.answer || '（模型没有返回内容）')
                : ('请求失败：' + zjq_json.msg + ' ' + (zjq_d.error || ''));
            zjq_wait.querySelector('.zjq_msgBody').textContent = zjq_answer;
            const zjq_meta = document.createElement('div');
            zjq_meta.className = 'zjq_msgMeta';
            zjq_meta.textContent = (zjq_d.platform || '') + ' · ' + (zjq_d.model || '') +
                (zjq_d.offline ? ' · 离线演示' : ' · 真实模型');
            zjq_wait.querySelector('.zjq_msgBody').appendChild(zjq_meta);
            if (zjq_json.code === 0) zjq_messages.push({ role: 'assistant', content: zjq_answer });
        } catch (zjq_err) {
            console.error('[聊天] 请求异常：', zjq_err);
            zjq_wait.querySelector('.zjq_msgBody').textContent = '网络异常：' + zjq_err.message +
                '（请确认后端已启动、端口为 8205）';
            zjq_setStatus('请求异常：' + zjq_err.message, 'zjq_bad');
        } finally {
            zjq_busy = false;
            zjq_btnSend.disabled = false;
            zjq_box.scrollTop = zjq_box.scrollHeight;
            zjq_input.focus();
        }
    }

    zjq_btnSend.addEventListener('click', function () { zjq_send(); });
    zjq_input.addEventListener('keydown', function (zjq_e) {
        if (zjq_e.key === 'Enter' && !zjq_e.shiftKey) { zjq_e.preventDefault(); zjq_send(); }
    });
    zjq_btnClear.addEventListener('click', function () {
        zjq_messages = [];
        zjq_box.innerHTML = '';
        zjq_sentEl.innerHTML = '<div class="zjq_ioEmpty">尚未发送请求。</div>';
        zjq_recvEl.innerHTML = '<div class="zjq_ioEmpty">尚未收到响应。</div>';
        zjq_sentTag.textContent = '等待请求';
        zjq_recvTag.textContent = '等待响应';
        console.log('[聊天] 已清空多轮对话历史');
    });
    document.getElementById('zjq_btnDemo1').addEventListener('click', function () {
        zjq_input.value = '你们几点开门？周末会晚一点关门吗？';
        zjq_input.focus();
    });
    document.getElementById('zjq_btnDemo2').addEventListener('click', function () {
        zjq_input.value = '我刚才问了什么？';
        zjq_input.focus();
    });
    zjq_platform.addEventListener('change', function () {
        console.log('[聊天] 切换平台 →', zjq_platform.value, '（只改后端读到的配置，前端代码不变）');
    });

    zjq_bubble('assistant', '你好！我是本节课的 AI 助手。可以先问「你们几点开门？」，再问「我刚才问了什么？」验证多轮对话。', '系统提示');
    zjq_loadStatus();
})();
