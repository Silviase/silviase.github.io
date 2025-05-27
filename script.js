document.addEventListener("DOMContentLoaded", function () {
  const internationalContainer = document.getElementById("international-papers");
  const domesticContainer = document.getElementById("domestic-papers");

  // Papersセクションがあればデータを読み込む
  if (internationalContainer || domesticContainer) {
    loadPapers();
  }

  // スクロールアニメーションの初期化とイベントリスナー設定
  // (handleScrollAnimations関数は loadPublications のデータロード後に呼び出すのが良い)
  window.addEventListener("scroll", handleScrollAnimations);

  // 必要ならダークモードなどの他の初期化処理をここに追加
  // setupDarkModeToggle();
});

// 論文情報をJSONから読み込み、表示する関数
function loadPapers() {
  const internationalContainer = document.getElementById("international-papers");
  const domesticContainer = document.getElementById("domestic-papers");

  // コンテナが存在しない場合は処理を中断
  if (!internationalContainer && !domesticContainer) {
    console.warn("Paper containers not found on this page.");
    return;
  }

  // Jekyllが生成したJSONデータをfetchする
  fetch("./assets/js/papers_data.json") // Step 3で指定したパス
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load papers data (status: ${res.status})`);
      }
      return res.json();
    })
    .then((papersData) => {
      // 既存のコンテナ内容をクリア (念のため)
      if (internationalContainer) internationalContainer.innerHTML = '';
      if (domesticContainer) domesticContainer.innerHTML = '';

      // 取得したデータ配列をループ処理
      papersData.forEach((meta) => {
        // JSONから取得したデータ（nullチェックも含む）
        const title = meta.title || 'No Title Provided';
        const venue = meta.venue || '';
        const description = meta.description || '';
        const pdfLink = meta.pdf_link; // nullかもしれない
        const codeLink = meta.code_link; // nullかもしれない
        const bibtex = meta.bibtex || ''; // 空文字列かもしれない
        // 詳細ページのURL。Jekyllが生成した相対URLを使う
        const detailUrl = meta.url ? meta.url : '#';

        const pubCard = document.createElement("div");
        pubCard.className = "pub-card";
        // アニメーション用の初期スタイル
        pubCard.style.opacity = "0";
        pubCard.style.transform = "translateY(20px)";
        pubCard.style.transition = "opacity 0.5s ease, transform 0.5s ease";

        // カードのHTMLを生成
        pubCard.innerHTML = `
          <a href="${detailUrl}" class="pub-title">${title}</a>
          <div class="pub-venue">${venue}</div>
          <p>${description}</p>
          <div class="pub-links">
            ${pdfLink ? `<a href="${pdfLink}" target="_blank">PDF</a>` : ""}
            ${codeLink ? `<a href="${codeLink}" target="_blank">Code</a>` : ""}
            ${bibtex ? `<button class="copy-bibtex-btn">Copy BibTeX</button>` : ""}
          </div>
        `;

        // BibTeXコピーボタンのイベントリスナー (BibTeXが存在する場合のみ)
        if (bibtex) {
          const bibtexButton = pubCard.querySelector(".copy-bibtex-btn");
          if (bibtexButton) {
            bibtexButton.addEventListener("click", (e) => {
              e.preventDefault(); // デフォルトの挙動を抑制
              navigator.clipboard.writeText(bibtex)
                .then(() => {
                  alert("BibTeX copied!");
                })
                .catch(err => {
                   console.error('Failed to copy BibTeX:', err);
                   alert("Failed to copy BibTeX.");
                });
            });
          }
        }

        // typeに基づいて適切なコンテナに追加
        if (meta.type === "international" && internationalContainer) {
          internationalContainer.appendChild(pubCard);
        } else if (meta.type === "domestic" && domesticContainer) {
          domesticContainer.appendChild(pubCard);
        } else {
          // どちらでもない場合や、片方のコンテナしかないページの場合のフォールバック
          // console.warn(`Paper "${title}" has type: ${meta.type}. Placing in international.`);
          if (internationalContainer) internationalContainer.appendChild(pubCard);
          else if(domesticContainer) domesticContainer.appendChild(pubCard); // またはdomesticに入れるなど
        }
      });

      // データがDOMに追加された後にアニメーション関数を呼び出す
      // 少し遅延させると確実
      setTimeout(handleScrollAnimations, 100);

    })
    .catch((error) => {
      console.error(`Error loading or processing papers data: ${error}`);
      // ユーザーにエラーを通知
      const errorMessage = "<p>論文リストの読み込みに失敗しました。</p>";
      if (internationalContainer) internationalContainer.innerHTML = errorMessage;
      if (domesticContainer) domesticContainer.innerHTML = errorMessage;
    });
}

// アニメーション用関数 (変更なし、または微調整)
function isInViewport(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  // 画面内に少しでも入っていればtrueを返すように調整も可能
  return (
    rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom > 0 &&
    rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right > 0
  );
}

function handleScrollAnimations() {
  document.querySelectorAll(".pub-card, .timeline-item, .badge, .skill-item, .blog-post")
    .forEach((el) => {
      // opacityが"0"の要素（まだ表示されていない要素）のみ処理
      if (el.style.opacity === "0" && isInViewport(el)) {
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