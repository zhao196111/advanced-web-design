/*
姓名：赵俊清 | 学号：24006270205 |
时间：2026-11-19 | 大模型：Tencent Hunyuan Hy（均衡）
文件名：frontend/js/zjq_gallery.js
说明：fetch GET ./data/gallery.json，console.log 完整响应，渲染「上图下文」网格，
     图片 onerror 换占位色块并 console.error。
*/
'use strict';

(function () {
    const zjq_api = './data/gallery.json';
    const zjq_grid = document.getElementById('zjq_grid');
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
        zjq_grid.innerHTML = '';
        zjq_grid.appendChild(zjq_el('div', 'zjq_empty', zjq_text));
    }

    function zjq_card(zjq_row) {
        const zjq_cardEl = zjq_el('div', 'zjq_gcard');
        const zjq_wrap = zjq_el('div', 'zjq_gimgWrap');

        const zjq_img = document.createElement('img');
        zjq_img.className = 'zjq_gimg';
        zjq_img.alt = zjq_row.title || '图文图片';
        zjq_img.loading = 'lazy';
        zjq_img.addEventListener('error', function () {
            console.error('[gallery] 图片加载失败：', zjq_row.img_url);
            zjq_wrap.innerHTML = '';
            zjq_wrap.appendChild(zjq_el('div', 'zjq_gfallback', '图片暂不可用 · 占位色块'));
        });
        zjq_img.src = zjq_row.img_url || '';
        zjq_wrap.appendChild(zjq_img);
        zjq_cardEl.appendChild(zjq_wrap);

        const zjq_body = zjq_el('div', 'zjq_gbody');
        zjq_body.appendChild(zjq_el('span', 'zjq_gcat', zjq_row.category || '未分类'));
        zjq_body.appendChild(zjq_el('h3', 'zjq_gtitle', zjq_row.title || '无标题'));
        zjq_body.appendChild(zjq_el('p', 'zjq_gdesc', zjq_row.description || ''));
        zjq_cardEl.appendChild(zjq_body);
        return zjq_cardEl;
    }

    async function zjq_load() {
        zjq_btnReload.disabled = true;
        zjq_showEmpty('正在从数据库读取…');
        try {
            const zjq_res = await fetch(zjq_api, { method: 'GET' });
            const zjq_json = await zjq_res.json();
            console.log('[gallery] 接口完整响应：', zjq_json);   /* 老师要求：数据输出到控制台 */

            if (zjq_json.code !== 0) {
                const zjq_errText = (zjq_json.data && zjq_json.data.error) || zjq_json.msg;
                console.error('[gallery] 接口返回失败：', zjq_errText);
                zjq_showEmpty('读取失败：' + zjq_errText + '\n请先在 database.html 连接并初始化数据库。');
                zjq_status.textContent = 'code=' + zjq_json.code + ' · 错误详情见控制台';
                return;
            }

            const zjq_rows = (zjq_json.data && zjq_json.data.list) || [];
            console.log('[gallery] 取 data.list，共', zjq_rows.length, '条');
            zjq_grid.innerHTML = '';
            if (!zjq_rows.length) {
                zjq_showEmpty('表里还没有数据，请先在 database.html 点「初始化数据库与测试数据」。');
            } else {
                zjq_rows.forEach(function (zjq_row) { zjq_grid.appendChild(zjq_card(zjq_row)); });
            }
            zjq_status.textContent = 'code=0 · 表 ' + (zjq_json.data.table || 'zjq_gallery') +
                ' · 共 ' + (zjq_json.data.total || zjq_rows.length) + ' 条 · 完整响应已输出到控制台';
        } catch (zjq_err) {
            console.error('[gallery] 请求异常：', zjq_err);
            zjq_showEmpty('请求失败：' + zjq_err.message + ' —— 请确认后端已启动且端口为 8205');
            zjq_status.textContent = '请求异常，详情见控制台';
        } finally {
            zjq_btnReload.disabled = false;
        }
    }

    zjq_btnReload.addEventListener('click', zjq_load);
    zjq_load();
})();
