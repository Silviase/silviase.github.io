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
        await navigator.clipboard.writeText(bibtex);
        showCopyFeedback(button, 'Copied!', 2000);
      } catch (error) {
        console.error('Failed to copy BibTeX', error);
        showCopyFeedback(button, 'Copy failed', 2000);
      }
    });
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
