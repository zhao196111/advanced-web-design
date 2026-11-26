/*
姓名：赵俊清 | 学号：24006270205 |
时间：2026-11-19 | 大模型：Tencent Hunyuan Hy（均衡）
说明：首页 canvas 背景动画（粒子 + 连线）。原生 JS，无第三方库；所有变量与函数 zjq_ 前缀。
*/

(function () {
    var zjq_canvas = document.getElementById('zjq_bgCanvas');
    if (!zjq_canvas) return;

    var zjq_ctx = zjq_canvas.getContext('2d');
    var zjq_dots = [];
    var zjq_w = 0;
    var zjq_h = 0;
    var zjq_dpr = 1;
    var zjq_frameId = 0;
    var zjq_reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function zjq_resize() {
        zjq_dpr = Math.min(window.devicePixelRatio || 1, 2);
        zjq_w = window.innerWidth;
        zjq_h = window.innerHeight;
        zjq_canvas.width = Math.round(zjq_w * zjq_dpr);
        zjq_canvas.height = Math.round(zjq_h * zjq_dpr);
        zjq_canvas.style.width = zjq_w + 'px';
        zjq_canvas.style.height = zjq_h + 'px';
        zjq_ctx.setTransform(zjq_dpr, 0, 0, zjq_dpr, 0, 0);

        var zjq_count = Math.max(30, Math.min(90, Math.round(zjq_w / 16)));
        zjq_dots = [];
        for (var zjq_i = 0; zjq_i < zjq_count; zjq_i++) {
            zjq_dots.push({
                x: Math.random() * zjq_w,
                y: Math.random() * zjq_h,
                vx: (Math.random() - .5) * .28,
                vy: (Math.random() - .5) * .28,
                r: Math.random() * 1.5 + .8
            });
        }
    }

    function zjq_draw() {
        zjq_ctx.clearRect(0, 0, zjq_w, zjq_h);

        for (var zjq_i = 0; zjq_i < zjq_dots.length; zjq_i++) {
            var zjq_a = zjq_dots[zjq_i];
            if (!zjq_reduce) {
                zjq_a.x += zjq_a.vx;
                zjq_a.y += zjq_a.vy;
                if (zjq_a.x < 0 || zjq_a.x > zjq_w) zjq_a.vx *= -1;
                if (zjq_a.y < 0 || zjq_a.y > zjq_h) zjq_a.vy *= -1;
            }
            for (var zjq_j = zjq_i + 1; zjq_j < zjq_dots.length; zjq_j++) {
                var zjq_b = zjq_dots[zjq_j];
                var zjq_dx = zjq_a.x - zjq_b.x;
                var zjq_dy = zjq_a.y - zjq_b.y;
                var zjq_dist = Math.sqrt(zjq_dx * zjq_dx + zjq_dy * zjq_dy);
                if (zjq_dist < 132) {
                    zjq_ctx.strokeStyle = 'rgba(26,25,21,' + (0.2 * (1 - zjq_dist / 132)).toFixed(3) + ')';
                    zjq_ctx.lineWidth = 1;
                    zjq_ctx.beginPath();
                    zjq_ctx.moveTo(zjq_a.x, zjq_a.y);
                    zjq_ctx.lineTo(zjq_b.x, zjq_b.y);
                    zjq_ctx.stroke();
                }
            }
            zjq_ctx.fillStyle = (zjq_i % 7 === 0) ? 'rgba(165,52,31,.7)' : 'rgba(26,25,21,.45)';
            zjq_ctx.beginPath();
            zjq_ctx.arc(zjq_a.x, zjq_a.y, zjq_a.r, 0, Math.PI * 2);
            zjq_ctx.fill();
        }

        zjq_frameId = window.requestAnimationFrame(zjq_draw);
    }

    zjq_resize();
    window.addEventListener('resize', zjq_resize);
    window.addEventListener('beforeunload', function () {
        if (zjq_frameId) window.cancelAnimationFrame(zjq_frameId);
    });
    zjq_draw();
})();
