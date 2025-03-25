document.addEventListener("DOMContentLoaded", function () {
  const timelineItems = document.querySelectorAll(".timeline-item");

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
      .querySelectorAll(".timeline-item, .badge, .skill-item, .pub-card")
      .forEach((el) => {
        if (isInViewport(el)) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      });
  }

  document.querySelectorAll(".timeline-item, .pub-card").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  });

  document.querySelectorAll(".badge").forEach((badge) => {
    badge.style.opacity = "0";
    badge.style.transform = "scale(0.9)";
    badge.style.transition = "opacity 0.5s ease, transform 0.5s ease";

    badge.addEventListener("mouseenter", () =>
      badge.classList.add("badge-hover")
    );
    badge.addEventListener("mouseleave", () =>
      badge.classList.remove("badge-hover")
    );
  });

  document.querySelectorAll(".skill-item").forEach((skill) => {
    skill.style.opacity = "0";
    skill.style.transform = "translateY(15px)";
    skill.style.transition = "opacity 0.4s ease, transform 0.4s ease";
  });

  setTimeout(handleScrollAnimations, 300);
  window.addEventListener("scroll", handleScrollAnimations);

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

  const internationalContainer = document.getElementById(
    "international-publications"
  );
  const domesticContainer = document.getElementById("domestic-publications");

  fetch("./publications/index.json")
    .then((res) => res.json())
    .then((files) => {
      files.forEach((file) => {
        const fileHtml = file.replace(".md", ".html");
        fetch(`./publications/${fileHtml}`)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to load ${fileHtml}`);
            return res.text();
          })
          .then((html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const pubCard = document.createElement("div");
            pubCard.className = "pub-card";

            pubCard.innerHTML = `
              <a href="./publications/${fileHtml}" class="pub-title">${
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

            if (file.includes("international")) {
              internationalContainer.appendChild(pubCard);
            } else {
              domesticContainer.appendChild(pubCard);
            }
          })
          .catch((error) => console.error(error));
      });
    });
});
