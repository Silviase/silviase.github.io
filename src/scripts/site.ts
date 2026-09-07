const html = document.documentElement;
function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Storage can be unavailable. */
  }
}
const themeToggle = document.querySelector<HTMLButtonElement>('.theme-toggle');
function syncThemeLabel() {
  themeToggle?.setAttribute(
    'aria-label',
    html.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );
}
syncThemeLabel();
themeToggle?.addEventListener('click', () => {
  const theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = theme;
  remember('theme', theme);
  syncThemeLabel();
});
const langToggle = document.querySelector<HTMLButtonElement>('.lang-toggle');
function syncLangLabel() {
  langToggle?.setAttribute(
    'aria-label',
    html.dataset.lang === 'ja' ? 'Switch interface to English' : '表示を日本語に切り替える'
  );
}
syncLangLabel();
langToggle?.addEventListener('click', () => {
  const lang = html.dataset.lang === 'ja' ? 'en' : 'ja';
  html.dataset.lang = lang;
  remember('lang', lang);
  syncLangLabel();
});
document.querySelectorAll<HTMLButtonElement>('.copy-bibtex').forEach((button) => {
  button.addEventListener('click', async () => {
    const original = button.textContent;
    const japanese = html.dataset.lang === 'ja';
    try {
      await navigator.clipboard.writeText(button.dataset.bibtex!);
      button.textContent = japanese ? 'コピーしました！' : 'Copied!';
    } catch {
      button.textContent = japanese ? 'コピーできませんでした' : 'Copy failed';
    }
    button.disabled = true;
    window.setTimeout(() => {
      button.textContent = original;
      button.disabled = false;
    }, 2000);
  });
});
