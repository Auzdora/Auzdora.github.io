(function () {
  const STORAGE_KEY = 'theme';
  const root = document.documentElement;

  function currentEffectiveTheme() {
    const override = root.getAttribute('data-theme');
    if (override === 'dark' || override === 'light') return override;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') return;
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  function transitionDurationMs() {
    const raw = getComputedStyle(root).getPropertyValue('--theme-transition-duration').trim();
    if (!raw) return 1000;
    if (raw.endsWith('ms')) return parseFloat(raw);
    if (raw.endsWith('s')) return parseFloat(raw) * 1000;
    return parseFloat(raw) || 1000;
  }

  function toggleWithRipple(btn) {
    const next = currentEffectiveTheme() === 'dark' ? 'light' : 'dark';

    const supportsViewTransition = typeof document.startViewTransition === 'function';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!supportsViewTransition || prefersReducedMotion) {
      applyTheme(next);
      return;
    }

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const duration = transitionDurationMs();

    const transition = document.startViewTransition(() => applyTheme(next));

    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration,
          easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    btn.addEventListener('click', () => toggleWithRipple(btn));
  });
})();
