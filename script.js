/**
 * CV Animation and Interaction Script
 * Adds scroll-based animations and interactive elements to the CV
 */

document.addEventListener("DOMContentLoaded", function () {
  // Animate timeline items on scroll
  const timelineItems = document.querySelectorAll(".timeline-item");

  // Simple function to check if an element is in viewport
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

  // Function to handle scroll animations
  function handleScrollAnimations() {
    timelineItems.forEach((item) => {
      if (isInViewport(item)) {
        item.style.opacity = "1";
        item.style.transform = "translateX(0)";
      }
    });

    document.querySelectorAll(".badge").forEach((badge) => {
      if (isInViewport(badge)) {
        badge.style.opacity = "1";
        badge.style.transform = "scale(1)";
      }
    });

    document.querySelectorAll(".skill-item").forEach((skill) => {
      if (isInViewport(skill)) {
        skill.style.opacity = "1";
        skill.style.transform = "translateY(0)";
      }
    });

    document.querySelectorAll(".pub-card").forEach((card) => {
      if (isInViewport(card)) {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }
    });
  }

  // Initialize styles for animation
  timelineItems.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateX(-20px)";
    item.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  });

  document.querySelectorAll(".pub-card").forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  });

  document.querySelectorAll(".badge").forEach((badge) => {
    badge.style.opacity = "0";
    badge.style.transform = "scale(0.9)";
    badge.style.transition =
      "opacity 0.5s ease, transform 0.5s ease, background-color 0.3s ease, color 0.3s ease";
  });

  document.querySelectorAll(".skill-item").forEach((skill) => {
    skill.style.opacity = "0";
    skill.style.transform = "translateY(15px)";
    skill.style.transition =
      "opacity 0.4s ease, transform 0.4s ease, background-color 0.3s ease";
  });

  // Run once on page load with a slight delay to ensure all elements are rendered
  setTimeout(handleScrollAnimations, 300);

  // Add scroll event listener
  window.addEventListener("scroll", handleScrollAnimations);

  // Badge hover effect - fixed version
  const badges = document.querySelectorAll(".badge");

  badges.forEach((badge) => {
    badge.addEventListener("mouseenter", function () {
      // Instead of manipulating ::before directly (which isn't possible),
      // we can add a class that changes the animation state
      this.classList.add("badge-hover");
    });

    badge.addEventListener("mouseleave", function () {
      this.classList.remove("badge-hover");
    });
  });

  // Theme switcher functionality (if needed in the future)
  // Uncomment the following code to add a theme switcher
  const themeToggle = document.createElement("button");
  themeToggle.className = "theme-toggle";
  themeToggle.innerHTML = "🌙";
  themeToggle.setAttribute("aria-label", "Toggle dark mode");
  document.body.appendChild(themeToggle);

  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");
    if (document.body.classList.contains("dark-theme")) {
      this.innerHTML = "☀️";
    } else {
      this.innerHTML = "🌙";
    }
  });

  document.querySelectorAll(".pub-card").forEach((card) => {
    if (isInViewport(card)) {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }
  });
});

const internationalContainer = document.getElementById(
  "international-publications"
);
const domesticContainer = document.getElementById("domestic-publications");

// index.jsonを読み込むよ
fetch("./publications/index.json")
  .then((res) => res.json())
  .then((files) => {
    files.forEach((file) => {
      fetch(`./publications/${file}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load ${file}`);
          return res.text();
        })
        .then((data) => {
          const matched = data.match(/^---([\s\S]*?)---\s*([\s\S]*)$/);
          if (!matched) {
            throw new Error(
              `Metadata missing or incorrectly formatted in ${file}`
            );
          }
          const [, yamlText, markdownContent] = matched;
          const meta = jsyaml.load(yamlText);

          const pubCard = document.createElement("div");
          pubCard.className = "pub-card";

          pubCard.innerHTML = `
            <a href="publication.html?pub=${file.replace(
              ".md",
              ""
            )}" class="pub-title">${meta.title}</a>
            <div class="pub-venue">${meta.venue}</div>
            <p>${meta.description}</p>
            <div class="pub-links">
              ${meta.pdf_link ? `<a href="${meta.pdf_link}">PDF</a>` : ""}
              ${meta.code_link ? `<a href="${meta.code_link}">Code</a>` : ""}
              <button class="copy-bibtex-btn">Copy BibTeX</button>
            </div>
          `;

          // BibTeXのコピー機能
          pubCard
            .querySelector(".copy-bibtex-btn")
            .addEventListener("click", () => {
              navigator.clipboard.writeText(meta.bibtex).then(() => {
                alert("BibTeX copied!");
              });
            });

          if (meta.type === "international") {
            internationalContainer.appendChild(pubCard);
          } else {
            domesticContainer.appendChild(pubCard);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    });
  });
