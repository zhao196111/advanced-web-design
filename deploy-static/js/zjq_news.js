/*
姓名：赵俊清 | 学号：24006270205 |
时间：2026-11-19 | 大模型：Tencent Hunyuan Hy（均衡）
文件名：frontend/js/zjq_news.js
说明：fetch GET ./data/news.json，console.log 完整响应，遍历 data.list 渲染列表。
*/
'use strict';

(function () {
    const zjq_api = './data/news.json';
    const zjq_listEl = document.getElementById('zjq_list');
    const zjq_empty = document.getElementById('zjq_empty');
    const zjq_status = document.getElementById('zjq_status');
    const zjq_btnReload = document.getElementById('zjq_btnReload');
    const zjq_apiUrl = document.getElementById('zjq_apiUrl');
    const zjq_apiLink = document.getElementById('zjq_apiLink');

    if (zjq_apiUrl) zjq_apiUrl.textContent = window.location.origin + zjq_api;
    if (zjq_apiLink) zjq_apiLink.setAttribute('href', zjq_api);

    function zjq_el(zjq_tag, zjq_cls, zjq_text) {
        const zjq_node = document.createElement(zjq_tag);
        if (zjq_cls) zjq_node.className = zjq_cls;
        if (zjq_text !== undefined && zjq_text !== null) zjq_node.textContent = String(zjq_text);
        return zjq_node;
    }

    function zjq_showEmpty(zjq_text) {
        zjq_listEl.innerHTML = '';
        zjq_listEl.appendChild(zjq_el('div', 'zjq_empty', zjq_text));
    }

    function zjq_render(zjq_rows) {
        zjq_listEl.innerHTML = '';
        zjq_rows.forEach(function (zjq_row, zjq_i) {
            const zjq_item = zjq_el('div', 'zjq_item');
            zjq_item.appendChild(zjq_el('div', 'zjq_itemIndex', String(zjq_i + 1).padStart(2, '0')));

            const zjq_body = zjq_el('div', '');
            zjq_body.appendChild(zjq_el('h3', 'zjq_itemTitle', zjq_row.title));

            const zjq_meta = zjq_el('div', 'zjq_itemMeta');
            zjq_meta.appendChild(document.createTextNode(zjq_row.source || '未标注来源'));
            const zjq_dot = zjq_el('i', '', '·');
            zjq_meta.appendChild(zjq_dot);
            zjq_meta.appendChild(document.createTextNode(zjq_row.publish_time || ''));
            zjq_meta.appendChild(zjq_el('span', 'zjq_pill', 'id ' + zjq_row.id));
            zjq_body.appendChild(zjq_meta);

            zjq_body.appendChild(zjq_el('p', 'zjq_itemSummary', zjq_row.summary || ''));
            zjq_item.appendChild(zjq_body);
            zjq_listEl.appendChild(zjq_item);
        });
    }

    async function zjq_load() {
        zjq_btnReload.disabled = true;
        zjq_showEmpty('正在从数据库读取…');
        try {
            const zjq_res = await fetch(zjq_api, { method: 'GET' });
            const zjq_json = await zjq_res.json();
            console.log('[news] 接口完整响应：', zjq_json);   /* 老师要求：数据输出到控制台 */

            if (zjq_json.code !== 0) {
                const zjq_errText = (zjq_json.data && zjq_json.data.error) || zjq_json.msg;
                console.error('[news] 接口返回失败：', zjq_errText);
                zjq_showEmpty('读取失败：' + zjq_errText + '\n请先在 database.html 连接并初始化数据库。');
                zjq_status.textContent = 'code=' + zjq_json.code + ' · 错误详情见控制台';
                return;
            }

            const zjq_rows = (zjq_json.data && zjq_json.data.list) || [];
            console.log('[news] 取 data.list，共', zjq_rows.length, '条');
            if (!zjq_rows.length) {
                zjq_showEmpty('表里还没有数据，请先在 database.html 点「初始化数据库与测试数据」。');
            } else {
                zjq_render(zjq_rows);
            }
            zjq_status.textContent = 'code=0 · 表 ' + (zjq_json.data.table || 'zjq_news') +
                ' · 共 ' + (zjq_json.data.total || zjq_rows.length) + ' 条 · 完整响应已输出到控制台';
        } catch (zjq_err) {
            console.error('[news] 请求异常：', zjq_err);
            zjq_showEmpty('请求失败：' + zjq_err.message + ' —— 请确认后端已启动且端口为 8205');
            zjq_status.textContent = '请求异常，详情见控制台';
        } finally {
            zjq_btnReload.disabled = false;
        }
    }

    zjq_btnReload.addEventListener('click', zjq_load);
    zjq_load();
})();
