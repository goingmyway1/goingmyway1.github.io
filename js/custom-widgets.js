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

/* ============ 进阶动效：滚动渐入 / 视差 / 光晕 / 代码块 / 灯箱 / Konami / 圆扩散 / 开机 ============ */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. 滚动渐入 */
  function reveal() {
    var els = document.querySelectorAll('.index-card, .markdown-body img, .photo-grid img');
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) { return; }
    for (var i = 0; i < els.length; i++) els[i].classList.add('reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  /* 2. 横幅视差 */
  function parallax() {
    var banner = document.getElementById('banner');
    if (!banner || reduce) return;
    var text = banner.querySelector('.banner-text');
    var rain = banner.querySelector('.code-rain');
    var ticking = false;
    function apply() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (y < window.innerHeight) {
        if (text) text.style.transform = 'translateY(' + y * 0.25 + 'px)';
        if (rain) rain.style.transform = 'translateY(' + y * 0.12 + 'px)';
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
  }

  /* 3. 鼠标光晕 */
  function cursorGlow() {
    if (reduce || window.matchMedia('(hover: none)').matches) return;
    var g = document.createElement('div');
    g.className = 'cursor-glow';
    document.body.appendChild(g);
    var x = -200, y = -200, cx = x, cy = y;
    document.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; }, { passive: true });
    (function loop() {
      cx += (x - cx) * 0.12; cy += (y - cy) * 0.12;
      g.style.transform = 'translate3d(' + (cx - 160) + 'px,' + (cy - 160) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* 4. 代码块增强：三点标题栏 + 语言 + 复制 */
  function codeBlocks() {
    var pres = document.querySelectorAll('.markdown-body pre');
    for (var i = 0; i < pres.length; i++) {
      (function (pre) {
        if (pre.parentNode && pre.parentNode.classList.contains('code-wrap')) return;
        var code = pre.querySelector('code');
        var lang = '';
        if (code) {
          var m = (code.className || '').match(/language-([\w-]+)/);
          if (m) lang = m[1];
        }
        var wrap = document.createElement('div');
        wrap.className = 'code-wrap';
        pre.parentNode.insertBefore(wrap, pre);
        var bar = document.createElement('div');
        bar.className = 'code-bar';
        bar.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>' +
          '<em>' + (lang || 'code') + '</em><button type="button" class="code-copy">复制</button>';
        wrap.appendChild(bar);
        wrap.appendChild(pre);
        bar.querySelector('.code-copy').addEventListener('click', function () {
          var btn = this, txt = code ? code.textContent : pre.textContent;
          function done() { btn.textContent = '已复制'; setTimeout(function () { btn.textContent = '复制'; }, 1500); }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt).then(done, done);
          } else {
            var ta = document.createElement('textarea');
            ta.value = txt; document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta); done();
          }
        });
      })(pres[i]);
    }
  }

  /* 5. 图片灯箱 */
  function lightbox() {
    var imgs = document.querySelectorAll('.markdown-body img, .photo-grid img');
    if (!imgs.length) return;
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = '<button class="lb-close" aria-label="关闭">×</button><img alt="">';
    document.body.appendChild(box);
    var target = box.querySelector('img');
    var idx = 0, list = [];
    function show(i) {
      idx = (i + list.length) % list.length;
      target.src = list[idx].dataset.full || list[idx].src;
    }
    function open(i) { list = [].slice.call(imgs); show(i); box.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function close() { box.classList.remove('open'); document.body.style.overflow = ''; }
    imgs.forEach(function (img, i) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () { open(i); });
    });
    box.addEventListener('click', function (e) { if (e.target === box || e.target.className === 'lb-close' || e.target === target) { if (e.target !== target) close(); } });
    document.querySelector('.lb-close').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
  }

  /* 6. Konami 秘籍 */
  function konami() {
    var seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], pos = 0;
    document.addEventListener('keydown', function (e) {
      pos = (e.keyCode === seq[pos]) ? pos + 1 : (e.keyCode === seq[0] ? 1 : 0);
      if (pos === seq.length) { pos = 0; matrixMode(); }
    });
  }
  function matrixMode() {
    if (document.querySelector('.matrix-overlay')) return;
    var c = document.createElement('canvas');
    c.className = 'matrix-overlay';
    document.body.appendChild(c);
    var ctx = c.getContext('2d');
    var w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    var size = 16, cols = Math.floor(w / size), drops = [];
    for (var i = 0; i < cols; i++) drops[i] = Math.random() * -40;
    var chars = '01アイウエオカキクケコサシスセソ'.split('');
    var timer = setInterval(function () {
      ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(0, 0, w, h);
      ctx.font = size + 'px monospace';
      for (var i = 0; i < cols; i++) {
        ctx.fillStyle = Math.random() > 0.96 ? '#c8ffd4' : '#27c93f';
        ctx.fillText(chars[(Math.random() * chars.length) | 0], i * size, drops[i] * size);
        if (drops[i] * size > h && Math.random() > 0.97) drops[i] = 0;
        drops[i]++;
      }
    }, 50);
    setTimeout(function () {
      clearInterval(timer);
      c.style.transition = 'opacity .6s'; c.style.opacity = '0';
      setTimeout(function () { c.remove(); }, 700);
    }, 6000);
  }

  /* 7. 明暗切换圆形扩散 */
  function themeRipple() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('#color-toggle-btn') : null;
      if (!btn || !document.body.animate) return;
      var r = btn.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var d = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy)) * 2;
      var el = document.createElement('span');
      el.className = 'theme-ripple';
      el.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;width:' + d + 'px;height:' + d + 'px';
      document.body.appendChild(el);
      var isDark = document.documentElement.getAttribute('data-user-color-scheme') === 'dark';
      el.style.background = isDark ? '#0e1620' : '#fdfdfd';
      el.animate([{ transform: 'translate(-50%,-50%) scale(0)', opacity: .95 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }], { duration: 620, easing: 'ease-out' })
        .onfinish = function () { el.remove(); };
    }, true);
  }

  /* 8. 开机动画（每个会话一次） */
  function bootScreen() {
    if (reduce) return;
    try { if (sessionStorage.getItem('booted')) return; sessionStorage.setItem('booted', '1'); } catch (err) { return; }
    var el = document.createElement('div');
    el.className = 'boot-screen';
    el.innerHTML = '<pre class="boot-log"></pre>';
    document.body.appendChild(el);
    var log = el.querySelector('.boot-log');
    var lines = ['$ hexo generate', 'INFO  Generated: index.html', 'INFO  Generated: 213 files', '$ npm start', 'ready on https://www.sheffi.top'];
    var i = 0, j = 0, out = '',
      timer = setInterval(function () {
        if (i >= lines.length) { clearInterval(timer); setTimeout(function () { el.classList.add('done'); setTimeout(function () { el.remove(); }, 420); }, 160); return; }
        out = lines.slice(0, i).join('\n') + (i ? '\n' : '') + lines[i].slice(0, j);
        log.textContent = out; j++;
        if (j > lines[i].length) { i++; j = 0; }
      }, 18);
  }

  function boot() {
    bootScreen();
    reveal();
    parallax();
    cursorGlow();
    codeBlocks();
    lightbox();
    konami();
    themeRipple();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
