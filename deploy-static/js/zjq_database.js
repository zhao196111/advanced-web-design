/*
姓名：赵俊清 | 学号：24006270205 |
时间：2026-11-19 | 大模型：Tencent Hunyuan Hy（均衡）
文件名：frontend/js/zjq_database.js
说明：任务 4 交互。fetch 调用 /api/db-test 与 /api/db-init，
     返回数据与错误都输出到浏览器控制台（console.log / console.error）。
*/
'use strict';

(function () {
    const zjq_apiTest = '/api/db-test';
    const zjq_apiInit = '/api/db-init';

    const zjq_userEl = document.getElementById('zjq_user');
    const zjq_pwdEl = document.getElementById('zjq_password');
    const zjq_btnTest = document.getElementById('zjq_btnTest');
    const zjq_btnInit = document.getElementById('zjq_btnInit');
    const zjq_result = document.getElementById('zjq_result');
    const zjq_resultTitle = document.getElementById('zjq_resultTitle');
    const zjq_resultText = document.getElementById('zjq_resultText');
    const zjq_apiUrl = document.getElementById('zjq_apiUrl');

    if (zjq_apiUrl) zjq_apiUrl.textContent = window.location.origin + zjq_apiTest;

    function zjq_show(zjq_kind, zjq_title, zjq_text) {
        zjq_result.className = 'zjq_result zjq_isOn ' + (zjq_kind === 'ok' ? 'zjq_ok' : 'zjq_bad');
        zjq_resultTitle.textContent = zjq_title;
        zjq_resultText.textContent = zjq_text;
    }

    async function zjq_post(zjq_url, zjq_body) {
        const zjq_res = await fetch(zjq_url, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(zjq_body)
        });
        const zjq_json = await zjq_res.json();
        console.log('[response] ' + zjq_url, zjq_json);   /* 老师要求：数据输出到控制台 */
        return zjq_json;
    }

    zjq_btnTest.addEventListener('click', async function () {
        const zjq_user = (zjq_userEl.value || 'root').trim();
        const zjq_password = zjq_pwdEl.value || '';
        zjq_btnTest.disabled = true;
        zjq_btnTest.textContent = '连接中…';

        try {
            const zjq_json = await zjq_post(zjq_apiTest, {
                user: zjq_user,
                password: zjq_password,
                save: true
            });
            if (zjq_json.code === 0) {
                const zjq_d = zjq_json.data || {};
                console.log('[db-test] 成功，MySQL 版本：', zjq_d.version);
                zjq_show('ok', '数据库连接成功 · MySQL ' + (zjq_d.version || ''),
                    '账号 ' + (zjq_d.user || zjq_user) + ' @ ' + (zjq_d.host || 'localhost') +
                    '  |  ' + (zjq_d.note || '') +
                    '  |  完整响应已 console.log 输出到控制台');
                zjq_btnInit.disabled = false;
            } else {
                console.error('[db-test] 失败：', zjq_json.msg, (zjq_json.data || {}).error);
                zjq_show('bad', zjq_json.msg || '数据库连接失败',
                    (zjq_json.data && zjq_json.data.error) || '未知错误，详情见控制台');
                zjq_btnInit.disabled = true;
            }
        } catch (zjq_err) {
            console.error('[db-test] 请求异常：', zjq_err);
            zjq_show('bad', '请求失败：后端可能没启动',
                zjq_err.message + ' —— 请双击根目录 start.bat，并确认端口是 8205');
            zjq_btnInit.disabled = true;
        } finally {
            zjq_btnTest.disabled = false;
            zjq_btnTest.textContent = '测试连接';
        }
    });

    zjq_btnInit.addEventListener('click', async function () {
        zjq_btnInit.disabled = true;
        zjq_btnInit.textContent = '初始化中…';
        try {
            const zjq_json = await zjq_post(zjq_apiInit, {});
            if (zjq_json.code === 0) {
                const zjq_d = zjq_json.data || {};
                console.log('[db-init] 已建表：', zjq_d.tables, '新闻', zjq_d.news, '图文', zjq_d.gallery);
                zjq_show('ok', '数据库初始化完成',
                    '数据库 ' + (zjq_d.database || 'zjq_fullstack') + '  |  表 ' +
                    ((zjq_d.tables || []).join('、')) + '  |  数据 ' + zjq_d.news + '+' + zjq_d.gallery +
                    ' 条  |  共执行 ' + zjq_d.statements + ' 条 SQL，已追加写入 backend/zjq_database.md');
            } else {
                console.error('[db-init] 失败：', zjq_json.msg, (zjq_json.data || {}).error);
                zjq_show('bad', zjq_json.msg || '数据库初始化失败',
                    (zjq_json.data && zjq_json.data.error) || '未知错误，详情见控制台');
            }
        } catch (zjq_err) {
            console.error('[db-init] 请求异常：', zjq_err);
            zjq_show('bad', '请求失败', zjq_err.message);
        } finally {
            zjq_btnInit.disabled = false;
            zjq_btnInit.textContent = '初始化数据库与测试数据';
        }
    });

    /* 回车即可提交，方便课堂上快速验收 */
    zjq_pwdEl.addEventListener('keydown', function (zjq_e) {
        if (zjq_e.key === 'Enter') zjq_btnTest.click();
    });
})();
