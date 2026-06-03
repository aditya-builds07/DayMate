/* ============================================
   LITTLEBIRD — ANIMATIONS JS
   Scroll reveals via IntersectionObserver
   ============================================ */

const Animations = (() => {
  let observer = null;

  function init() {
    setupScrollReveal();
    setupStaggerChildren();
  }

  function setupScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!revealEls.length) return;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  }

  function setupStaggerChildren() {
    const staggerGroups = document.querySelectorAll('[data-stagger]');
    staggerGroups.forEach(group => {
      const children = group.children;
      Array.from(children).forEach((child, i) => {
        child.style.transitionDelay = `${i * 0.07}s`;
      });
    });
  }

  // Apply cell entrance animation with stagger
  function animateCells(cells) {
    cells.forEach((cell, i) => {
      cell.classList.remove('cell-enter');
      cell.style.animationDelay = `${i * 0.02}s`;
      // Force reflow
      void cell.offsetWidth;
      cell.classList.add('cell-enter');
    });
  }

  // Show toast notification
  function showToast(message, icon = 'check') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const iconSVG = getToastIcon(icon);
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `${iconSVG}<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  function getToastIcon(type) {
    const icons = {
      check: '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
      trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>',
      info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
    };
    return icons[type] || icons.check;
  }

  return { init, animateCells, showToast };
})();
