document.addEventListener("DOMContentLoaded", function () {
  const internationalContainer = document.getElementById(
    "international-publications"
  );
  const domesticContainer = document.getElementById("domestic-publications");

  fetch("./publications/publications.json")
    .then((res) => res.json())
    .then((publications) => {
      publications.forEach((pub) => {
        fetch(`./publications/${pub.filename}`)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to load ${pub.filename}`);
            return res.text();
          })
          .then((html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const pubCard = document.createElement("div");
            pubCard.className = "pub-card";
            pubCard.style.opacity = "0";
            pubCard.style.transform = "translateY(20px)";
            pubCard.style.transition = "opacity 0.5s ease, transform 0.5s ease";

            pubCard.innerHTML = `
              <a href="./publications/${pub.filename}" class="pub-title">${
              doc.querySelector(".title").textContent
            }</a>
              <div class="pub-venue">${
                doc.querySelector(".venue").textContent
              }</div>
              <p>${doc.querySelector(".description").textContent}</p>
              <div class="pub-links">
                ${
                  doc.querySelector(".pdf-link")
                    ? `<a href="${doc.querySelector(".pdf-link").href}">PDF</a>`
                    : ""
                }
                ${
                  doc.querySelector(".code-link")
                    ? `<a href="${
                        doc.querySelector(".code-link").href
                      }">Code</a>`
                    : ""
                }
                <button class="copy-bibtex-btn">Copy BibTeX</button>
              </div>
            `;

            pubCard
              .querySelector(".copy-bibtex-btn")
              .addEventListener("click", () => {
                navigator.clipboard
                  .writeText(doc.querySelector(".bibtex").textContent)
                  .then(() => {
                    alert("BibTeX copied!");
                  });
              });

            if (pub.type === "international") {
              internationalContainer.appendChild(pubCard);
            } else {
              domesticContainer.appendChild(pubCard);
            }

            // 追加したらアニメーション処理を呼び出し✨
            handleScrollAnimations();
          })
          .catch((error) => console.error(error));
      });
    });

  // アニメーション用関数
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function handleScrollAnimations() {
    document
      .querySelectorAll(".pub-card, .timeline-item, .badge, .skill-item")
      .forEach((el) => {
        if (isInViewport(el)) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      });
  }

  // 初期化とスクロールでのアニメーション
  window.addEventListener("scroll", handleScrollAnimations);
  setTimeout(handleScrollAnimations, 300);

  // ダークモード切り替えボタンもそのまま使えるよ〜🌙✨
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
});
