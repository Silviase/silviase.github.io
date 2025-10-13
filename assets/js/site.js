document.addEventListener('DOMContentLoaded', () => {
  wireCopyButtons();
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
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(bibtex);
        } else {
          fallbackCopyText(bibtex);
        }
        toggleCopyLabel(button, 'Copied!', 2000);
      } catch (error) {
        console.error('Failed to copy BibTeX', error);
        toggleCopyLabel(button, 'Copy failed', 2000);
      }
    });
  });
}

function fallbackCopyText(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function toggleCopyLabel(button, message, duration) {
  const original = button.dataset.originalLabel || button.textContent;
  if (!button.dataset.originalLabel) {
    button.dataset.originalLabel = original;
  }
  button.textContent = message;
  button.setAttribute('disabled', 'disabled');
  setTimeout(() => {
    button.textContent = button.dataset.originalLabel;
    button.removeAttribute('disabled');
  }, duration);
}
