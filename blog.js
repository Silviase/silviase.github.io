document.addEventListener("DOMContentLoaded", function() {
    const blogPostsContainer = document.getElementById("blog-posts-container");
    
    // ブログ投稿の情報（実際にはJSONなどから取得するのが良い）
    const blogPosts = [
      {
        title: "Recent Advances in Image Captioning",
        date: "March 15, 2025",
        summary: "A look at how far image captioning has come in the last year, including our findings with query-based approaches.",
        slug: "recent-advances-image-captioning"
      },
      {
        title: "Building Multimodal Japanese Datasets",
        date: "February 22, 2025",
        summary: "Challenges and opportunities in creating high-quality Japanese datasets for vision-language models.",
        slug: "building-multimodal-japanese-datasets"
      },
      {
        title: "PhD Journey: First Year Reflections",
        date: "January 10, 2025",
        summary: "Personal reflections on my first year as a PhD student and the research challenges I've encountered.",
        slug: "phd-journey-first-year"
      }
    ];
    
    // ブログ投稿をDOMに追加
    blogPosts.forEach(post => {
      const postElement = document.createElement("article");
      postElement.className = "blog-post";
      
      postElement.innerHTML = `
        <h2 class="post-title"><a href="posts/${post.slug}.html">${post.title}</a></h2>
        <div class="post-date">${post.date}</div>
        <p class="post-summary">${post.summary}</p>
        <a href="posts/${post.slug}.html" class="read-more">Read more →</a>
      `;
      
      blogPostsContainer.appendChild(postElement);
    });
  });