var I18N_DATA = {};

document.addEventListener('DOMContentLoaded', () => {
  buildI18nMap();
  wireCopyButtons();
  wireThemeToggle();
  wireLangToggle();
});

function buildI18nMap() {
  document.querySelectorAll('[data-i18n-key]').forEach((el) => {
    var key = el.getAttribute('data-i18n-key');
    var en = el.querySelector('[data-i18n="en"]');
    var ja = el.querySelector('[data-i18n="ja"]');
    if (en && ja) I18N_DATA[key] = { en: en.textContent.trim(), ja: ja.textContent.trim() };
  });
}

function i18nText(key, fallback) {
  var lang = document.documentElement.getAttribute('data-lang') || 'en';
  var entry = I18N_DATA[key];
  return entry ? entry[lang] || entry.en : fallback;
}

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
        showCopyFeedback(button, i18nText('btn_copied', 'Copied!'), 2000);
      } catch (error) {
        console.error('Failed to copy BibTeX', error);
        showCopyFeedback(button, i18nText('btn_copy_failed', 'Copy failed'), 2000);
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

function wireLangToggle() {
  const toggle = document.querySelector('.lang-toggle');
  if (!toggle) return;

  syncI18nOptions();

  toggle.addEventListener('click', () => {
    const isJa = document.documentElement.getAttribute('data-lang') === 'ja';
    if (isJa) {
      document.documentElement.removeAttribute('data-lang');
      document.documentElement.lang = 'en';
    } else {
      document.documentElement.setAttribute('data-lang', 'ja');
      document.documentElement.lang = 'ja';
    }
    try {
      localStorage.setItem('lang', isJa ? 'en' : 'ja');
    } catch (e) {
      /* private browsing */
    }
    syncI18nOptions();
  });
}

function syncI18nOptions() {
  var lang = document.documentElement.getAttribute('data-lang') || 'en';
  document.querySelectorAll('[data-i18n-en][data-i18n-ja]').forEach(function (el) {
    el.textContent = el.getAttribute('data-i18n-' + lang);
  });
}

function showCopyFeedback(button, message, duration) {
  if (!button.dataset.originalHtml) {
    button.dataset.originalHtml = button.innerHTML;
  }
  button.textContent = message;
  button.disabled = true;
  setTimeout(() => {
    button.innerHTML = button.dataset.originalHtml;
    button.disabled = false;
  }, duration);
}
