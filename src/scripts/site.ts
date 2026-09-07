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
    html.dataset.lang === 'ja'
      ? html.dataset.theme === 'dark'
        ? 'ライトモードに切り替える'
        : 'ダークモードに切り替える'
      : html.dataset.theme === 'dark'
        ? 'Switch to light mode'
        : 'Switch to dark mode'
  );
}
syncThemeLabel();
themeToggle?.addEventListener('click', () => {
  const theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = theme;
  remember('theme', theme);
  syncThemeLabel();
});
const languageButtons = document.querySelectorAll<HTMLButtonElement>('[data-language]');
function syncLanguage() {
  const lang = html.dataset.lang === 'ja' ? 'ja' : 'en';
  html.dataset.lang = lang;
  html.lang = lang;
  languageButtons.forEach((button) =>
    button.setAttribute('aria-pressed', String(button.dataset.language === lang))
  );
  document.querySelectorAll<HTMLElement>('[data-en][data-ja]').forEach((element) => {
    const text = lang === 'ja' ? element.dataset.ja! : element.dataset.en!;
    const attribute = element.dataset.translateAttribute;
    if (attribute) element.setAttribute(attribute, text);
    else element.textContent = text;
  });
  syncThemeLabel();
  document.dispatchEvent(new Event('languagechange'));
}
syncLanguage();
languageButtons.forEach((button) =>
  button.addEventListener('click', () => {
    html.dataset.lang = button.dataset.language!;
    remember('lang', html.dataset.lang);
    syncLanguage();
  })
);
document.querySelectorAll<HTMLButtonElement>('.copy-bibtex').forEach((button) => {
  button.addEventListener('click', async () => {
    const original = [...button.childNodes].map((node) => node.cloneNode(true));
    const japanese = html.dataset.lang === 'ja';
    try {
      await navigator.clipboard.writeText(button.dataset.bibtex!);
      button.textContent = japanese ? 'コピーしました！' : 'Copied!';
    } catch {
      button.textContent = japanese ? 'コピーできませんでした' : 'Copy failed';
    }
    button.disabled = true;
    window.setTimeout(() => {
      button.replaceChildren(...original);
      button.disabled = false;
    }, 2000);
  });
});
