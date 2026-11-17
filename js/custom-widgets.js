/* 站点小动画与挂件：代码雨、季节彩蛋、阅读进度、终端挂件 */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 首页横幅代码雨 ---------- */
  function codeRain() {
    if (reduce) return;
    var banner = document.getElementById('banner');
    if (!banner) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'code-rain';
    banner.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var chars = '01{}[]()<>;=+-*/#$.'.split('');
    var cols = 0, drops = [], size = 14;

    function resize() {
      canvas.width = banner.clientWidth;
      canvas.height = banner.clientHeight;
      cols = Math.max(1, Math.floor(canvas.width / size));
      drops = [];
      for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;
    }
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = size + 'px monospace';
      for (var i = 0; i < cols; i++) {
        var ch = chars[(Math.random() * chars.length) | 0];
        var x = i * size, y = drops[i] * size;
        ctx.fillStyle = Math.random() > 0.97 ? 'rgba(120,255,170,.85)' : 'rgba(70,200,130,.35)';
        ctx.fillText(ch, x, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.55;
      }
    }
    var timer = null;
    function start() { if (!timer) timer = setInterval(draw, 65); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    resize();
    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
  }

  /* ---------- 2. 季节彩蛋：樱花 / 雪花 ---------- */
  function seasonParticles() {
    if (reduce) return;
    var month = new Date().getMonth() + 1;
    var isSnow = month >= 12 || month <= 2;
    var isSakura = month >= 3 && month <= 5;
    if (!isSnow && !isSakura) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'season-layer';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var w, h, items = [];

    function init() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      items = [];
      var count = Math.min(45, Math.max(18, Math.floor(w / 30)));
      for (var i = 0; i < count; i++) {
        items.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: isSnow ? 1.4 + Math.random() * 2.2 : 3 + Math.random() * 3,
          vy: isSnow ? 0.35 + Math.random() * 0.8 : 0.5 + Math.random() * 0.9,
          vx: isSnow ? (Math.random() - 0.5) * 0.35 : 0.4 + Math.random() * 0.7,
          a: 0.35 + Math.random() * 0.45,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.04
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < items.length; i++) {
        var p = items[i];
        ctx.save();
        ctx.globalAlpha = p.a;
        ctx.translate(p.x, p.y);
        if (isSnow) {
          ctx.beginPath();
          ctx.fillStyle = '#fff';
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.rotate(p.rot);
          ctx.fillStyle = '#ffb7c9';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.y / 40) * 0.4;
        p.rot += p.vr;
        if (p.y > h + 10 || p.x > w + 10) { p.y = -10; p.x = Math.random() * w; }
      }
      raf = requestAnimationFrame(draw);
    }
    var raf = null;
    init();
    draw();
    window.addEventListener('resize', init);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf) draw();
    });
  }

  /* ---------- 3. 文章阅读进度条 ---------- */
  function readingProgress() {
    if (!document.querySelector('.markdown-body')) return;
    var bar = document.createElement('div');
    bar.className = 'reading-progress';
    document.body.appendChild(bar);
    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- 4. 右下角终端挂件 ---------- */
  function terminalWidget() {
    if (document.querySelector('.term-widget')) return;
    var lines = [
      '$ npm run build',
      '\u2713 hexo generated 213 files in 1.8s',
      '$ git push origin master',
      '\u2713 deployed to www.sheffi.top',
      '$ echo "代码能跑，就别动它"',
      '代码能跑，就别动它'
    ];
    var box = document.createElement('div');
    box.className = 'term-widget';
    box.innerHTML =
      '<button class="term-toggle" type="button" aria-label="打开终端">&gt;_</button>' +
      '<div class="term-panel" hidden><div class="term-bar"><span></span><span></span><span></span><em>zsh</em></div><pre class="term-body"></pre></div>';
    document.body.appendChild(box);

    var btn = box.querySelector('.term-toggle');
    var panel = box.querySelector('.term-panel');
    var body = box.querySelector('.term-body');
    var timer = null;

    function play() {
      body.textContent = '';
      var i = 0, j = 0;
      clearInterval(timer);
      timer = setInterval(function () {
        if (i >= lines.length) { clearInterval(timer); return; }
        var line = lines[i];
        if (j <= line.length) {
          var done = lines.slice(0, i).join('\n');
          body.textContent = (done ? done + '\n' : '') + line.slice(0, j);
          j++;
        } else { i++; j = 0; }
      }, 45);
    }
    btn.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      box.classList.toggle('open', open);
      if (open) play(); else clearInterval(timer);
    });
  }

  function boot() {
    codeRain();
    seasonParticles();
    readingProgress();
    terminalWidget();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
