document.addEventListener('DOMContentLoaded', () => {
  wireCopyButtons();
  wireThemeToggle();
});

function wireCopyButtons() {
  const buttons = document.querySelectorAll('.copy-bibtex');
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const bibtex = button.dataset.bibtex;
      if (!bibtex) return;

      try {
        await navigator.clipboard.writeText(bibtex);
        showCopyFeedback(button, 'Copied!', 2000);
      } catch (error) {
        console.error('Failed to copy BibTeX', error);
        showCopyFeedback(button, 'Copy failed', 2000);
      }
    });
  });
}

function wireThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');

  toggle.addEventListener('click', () => {
    isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    try {
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
    } catch (e) {
      /* private browsing */
    }
    toggle.setAttribute('aria-label', isDark ? 'Switch to dark mode' : 'Switch to light mode');
  });
}

function showCopyFeedback(button, message, duration) {
  const original = button.dataset.originalLabel || button.textContent;
  if (!button.dataset.originalLabel) {
    button.dataset.originalLabel = original;
  }
  button.textContent = message;
  button.disabled = true;
  setTimeout(() => {
    button.textContent = button.dataset.originalLabel;
    button.disabled = false;
  }, duration);
}
