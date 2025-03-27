document.addEventListener("DOMContentLoaded", function () {
  // 国際会議と国内会議の投稿コンテナを取得
  const internationalContainer = document.getElementById("international-publications");
  const domesticContainer = document.getElementById("domestic-publications");

  // publications/index.jsonを読み込む処理（既存のまま）
  if (internationalContainer || domesticContainer) {
    loadPublications();
  }

  // アニメーション効果の適用
  handleScrollAnimations();
  window.addEventListener("scroll", handleScrollAnimations);
  setTimeout(handleScrollAnimations, 300);

  // ダークモード切り替えボタン
  setupDarkModeToggle();
});

// 論文情報を読み込み、表示する関数
function loadPublications() {
  const internationalContainer = document.getElementById("international-publications");
  const domesticContainer = document.getElementById("domestic-publications");

  fetch("./publications/index.json")
    .then((res) => res.json())
    .then((publicationsList) => {
      // 各論文ファイルを処理
      publicationsList.forEach((pubInfo) => {
        const filename = pubInfo.filename || `${pubInfo}.md`;
        
        fetch(`./publications/${filename}`)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to load ${filename}`);
            return res.text();
          })
          .then((html) => {
            // YAMLフロントマターを解析
            const yamlMatch = html.match(/^---([\s\S]*?)---\s*([\s\S]*)$/);
            if (!yamlMatch) return;
            
            const yamlText = yamlMatch[1];
            const meta = jsyaml.load(yamlText);
            
            // typeをフロントマターから取得
            const pubType = meta.type; // "international" または "domestic"
            
            const pubCard = document.createElement("div");
            pubCard.className = "pub-card";
            pubCard.style.opacity = "0";
            pubCard.style.transform = "translateY(20px)";
            pubCard.style.transition = "opacity 0.5s ease, transform 0.5s ease";

            pubCard.innerHTML = `
              <a href="./publications.html?pub=${filename.replace('.md', '')}" class="pub-title">${meta.title}</a>
              <div class="pub-venue">${meta.venue}</div>
              <p>${meta.description}</p>
              <div class="pub-links">
                ${meta.pdf_link ? `<a href="${meta.pdf_link}">PDF</a>` : ""}
                ${meta.code_link ? `<a href="${meta.code_link}">Code</a>` : ""}
                <button class="copy-bibtex-btn">Copy BibTeX</button>
              </div>
            `;

            pubCard
              .querySelector(".copy-bibtex-btn")
              .addEventListener("click", () => {
                navigator.clipboard
                  .writeText(meta.bibtex)
                  .then(() => {
                    alert("BibTeX copied!");
                  });
              });

            // typeに基づいて適切なコンテナに追加
            if (pubType === "international" && internationalContainer) {
              internationalContainer.appendChild(pubCard);
            } else if (pubType === "domestic" && domesticContainer) {
              domesticContainer.appendChild(pubCard);
            }

            // 追加したらアニメーション処理を呼び出し
            handleScrollAnimations();
          })
          .catch((error) => console.error(`論文読み込みエラー: ${error}`));
      });
    })
    .catch((error) => {
      console.error(`index.json読み込みエラー: ${error}`);
      // エラー時のフォールバック処理をここに書ける
    });
}

// アニメーション用関数
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function handleScrollAnimations() {
  document
    .querySelectorAll(".pub-card, .timeline-item, .badge, .skill-item, .blog-post")
    .forEach((el) => {
      if (isInViewport(el)) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }
    });
}

// ダークモード切り替えボタン設定
function setupDarkModeToggle() {
  if (!document.querySelector(".theme-toggle")) {
    const themeToggle = document.createElement("button");
    themeToggle.className = "theme-toggle";
    themeToggle.innerHTML = "🌙";
    themeToggle.setAttribute("aria-label", "Toggle dark mode");
    document.body.appendChild(themeToggle);

    themeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark-theme");
      this.innerHTML = document.body.classList.contains("dark-theme")
        ? "☀️"
        : "🌙";
    });
  }
}