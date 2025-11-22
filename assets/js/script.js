document.addEventListener('DOMContentLoaded', () => {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  function activateTab(tab, setFocus = true) {
    const target = tab.getAttribute('data-tab-btn');
    tabs.forEach(t => {
      const selected = t === tab;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      if (selected && setFocus) t.focus();
    });

    panels.forEach(p => {
      const isVisible = p.getAttribute('data-tab') === target || p.id === tab.getAttribute('aria-controls');
      p.classList.toggle('hidden', !isVisible);
      p.setAttribute('aria-hidden', !isVisible);
    });
  }

  // click handlers
  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab, false));

    tab.addEventListener('keydown', (e) => {
      const idx = tabs.indexOf(tab);
      let nextIdx = null;
      if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
      if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') nextIdx = 0;
      if (e.key === 'End') nextIdx = tabs.length - 1;
      if (nextIdx !== null) {
        e.preventDefault();
        activateTab(tabs[nextIdx]);
      }
    });
  });

  // Ensure initial state (first tab active)
  const firstTab = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
  if (firstTab) activateTab(firstTab, false);

  // Theme toggle (keeps existing behavior)
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('light');
      const isLight = document.documentElement.classList.contains('light');
      try { localStorage.setItem('profile_theme_light', isLight ? '1' : '0'); } catch (e) {}
    });
    try {
      const saved = localStorage.getItem('profile_theme_light');
      if (saved === '1') document.documentElement.classList.add('light');
    } catch (e) {}
  }

  // Photo upload preview
  const photoInput = document.getElementById('photoInput');
  const photoPreview = document.getElementById('photoPreview');
  if (photoInput && photoPreview) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      photoPreview.src = url;
    });
  }

  // Applications: render stepper states based on `data-status` on .app-card
  function updateApplicationSteppers() {
    const STATUS_ORDER = ['submitted','under-review','interview','accepted','rejected'];
    const cards = document.querySelectorAll('.app-card');
    cards.forEach(card => {
      const status = (card.getAttribute('data-status') || '').toLowerCase();
      const steps = Array.from(card.querySelectorAll('.stepper .step'));
      // find index of current status; default to 0
      let index = STATUS_ORDER.indexOf(status);
      if (index === -1) index = 0;

      steps.forEach((stepEl, i) => {
        stepEl.classList.remove('active','completed');
        // mark completed for steps before the active
        if (i < index) stepEl.classList.add('completed');
        else if (i === index) stepEl.classList.add('active');
      });

      // adjust status label color for rejected/accepted
      const statusEl = card.querySelector('.app-status');
      if (statusEl) {
        if (status === 'rejected') {
          statusEl.style.color = '#b91c1c';
        } else if (status === 'accepted') {
          statusEl.style.color = 'var(--accent-2)';
        } else {
          statusEl.style.color = 'var(--muted)';
        }
      }
    });
  }

  updateApplicationSteppers();

});
