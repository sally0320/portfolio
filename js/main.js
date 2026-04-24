document.addEventListener('DOMContentLoaded', () => {
  // ── フォント読み込み待ち → アニメーション開始 ──
  function startHeroAnimation() {
  let totalCharTime = 0;
  document.querySelectorAll('.text-animate').forEach(el => {
    const html = el.innerHTML;
    el.innerHTML = '';
    const lines = html.split(/<br\s*\/?>/i);
    let charIndex = 0;
    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        const br = document.createElement('span');
        br.classList.add('char-br');
        el.appendChild(br);
      }
      const chars = line.trim().split('');
      chars.forEach((char, i) => {
        const span = document.createElement('span');
        span.classList.add('char', `char-line-${lineIndex}`);
        span.textContent = char === ' ' ? '\u00A0' : char;
        const delay = 300 + charIndex * 120;
        span.style.animationDelay = `${delay}ms`;
        el.appendChild(span);
        charIndex++;
        totalCharTime = delay + 700;
      });
      charIndex += 2; // 行間のディレイ
    });
  });

  }

  // フォント読み込みを待ってからキャッチコピーアニメーション開始
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => startHeroAnimation());
  } else {
    setTimeout(startHeroAnimation, 500);
  }

  // ── Hero: アイコン等はすぐに1項目ずつ出す（フォント待ちしない） ──
  document.querySelectorAll('.hero-stagger').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 400 + i * 250);
  });

  // ── Scroll fade-in ──
  function checkVisibility() {
    document.querySelectorAll('.fade-in').forEach(el => {
      if (el.classList.contains('visible')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', checkVisibility, { passive: true });
  checkVisibility();
  setTimeout(checkVisibility, 500);

  // ── Count-up animation for stats ──
  let countDone = false;
  function animateCountUp() {
    if (countDone) return;
    const statsSection = document.querySelector('.about-stats');
    if (!statsSection) return;
    const rect = statsSection.getBoundingClientRect();
    if (rect.top > window.innerHeight - 100) return;

    countDone = true;
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      const duration = 1500;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  window.addEventListener('scroll', animateCountUp, { passive: true });

  // ── Nav scroll effect ──
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ── Mobile menu toggle ──
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // ── ✨ Sparkle particles on Hero ──
  const canvas = document.getElementById('sparkles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const colors = ['#c9a84c', '#c4a0e8', '#e8d5a0', '#d4b8f0', '#ffffff'];

    function resize() {
      const hero = document.querySelector('.hero');
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedY = -Math.random() * 0.3 - 0.1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.6 + 0.1;
        this.fadeSpeed = Math.random() * 0.008 + 0.002;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.03 + 0.01;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.twinklePhase += this.twinkleSpeed;
        const twinkle = (Math.sin(this.twinklePhase) + 1) / 2;
        this.currentOpacity = this.opacity * twinkle;

        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
          this.reset();
          this.y = canvas.height + 10;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.currentOpacity;
        ctx.fillStyle = this.color;

        // Draw 4-point star shape
        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - s * 2);
        ctx.quadraticCurveTo(this.x + s * 0.3, this.y - s * 0.3, this.x + s * 2, this.y);
        ctx.quadraticCurveTo(this.x + s * 0.3, this.y + s * 0.3, this.x, this.y + s * 2);
        ctx.quadraticCurveTo(this.x - s * 0.3, this.y + s * 0.3, this.x - s * 2, this.y);
        ctx.quadraticCurveTo(this.x - s * 0.3, this.y - s * 0.3, this.x, this.y - s * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Create particles
    const count = window.innerWidth < 768 ? 25 : 50;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }

  // ── Parallax for hero decorations ──
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    document.querySelectorAll('.hero .deco').forEach(el => {
      el.style.transform = `translateY(${scrolled * 0.15}px)`;
    });
  }, { passive: true });
});
