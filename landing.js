const toggle = document.querySelector('#themeToggle');

function setTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  toggle.setAttribute('aria-checked', String(dark));
  toggle.querySelector('.theme-label').textContent = dark ? 'Modo claro' : 'Modo oscuro';
  toggle.querySelector('.theme-knob').textContent = dark ? '☾' : '☼';
  localStorage.setItem('chrismuladores-theme', theme);
}

function setupLandingMotion() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('landing-motion');
  const revealTargets = document.querySelectorAll('.site-header, .intro, main > section:not(.intro), .credits-section');
  revealTargets.forEach((target, index) => {
    target.classList.add('landing-reveal');
    target.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 60}ms`);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

  revealTargets.forEach(target => observer.observe(target));
}

toggle.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
setTheme(localStorage.getItem('chrismuladores-theme') || 'dark');
setupLandingMotion();
