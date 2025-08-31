class BlogArticleLoader {
  constructor() {
    this.blogFolder = this.getBlogFolderFromURL();
    this.blogInfo = null;
    this.init();
  }

  getBlogFolderFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('folder') || urlParams.get('blog'); // Support both parameter names
  }

  async init() {
    // Set up the back link first
    this.setupBackLink();
    
    // Then load blog content
    await this.loadBlogContent();
  }

  setupBackLink() {
    const backLink = document.querySelector('.back-link');
    if (backLink) {
      const blogsUrl = 'blogs.html';
      backLink.href = blogsUrl;
      
      // Also add click handler for better reliability
      backLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = blogsUrl;
      });
    }
  }

  async loadBlogContent() {
    const blogContentSection = document.getElementById('blog-content');
    
    if (!this.blogFolder) {
      blogContentSection.innerHTML = '<p>No blog specified.</p>';
      return;
    }
    
    try {
      // Load blog info and content
      const [infoResponse, contentResponse] = await Promise.all([
        fetch(`blogs/${this.blogFolder}/info.json`),
        fetch(`blogs/${this.blogFolder}/blog.md`)
      ]);
      
      if (!infoResponse.ok || !contentResponse.ok) {
        throw new Error('Blog content not found');
      }
      
      this.blogInfo = await infoResponse.json();
      const blogContent = await contentResponse.text();
      
      // Update page title
      document.title = `${this.blogInfo.title} - The Philosopher's Window`;
      
      // Add blog header
      const headerHtml = `
        <div class="article-header-container">
          <h1 class="article-title">${this.blogInfo.title}</h1>
          <div class="article-meta">
            <time datetime="${this.blogInfo.publishDate}">${new Date(this.blogInfo.publishDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</time>
            <span class="article-author">by abhinavp06</span>
          </div>
        </div>
      `;
      
      // Convert markdown to HTML and display
      const htmlContent = convertMarkdownToHtml(blogContent);
      blogContentSection.innerHTML = headerHtml + htmlContent;
      
    } catch (error) {
      console.error('Error loading blog:', error);
      
      let errorHtml = '<p>Error loading blog content.</p>';
      if (this.blogInfo) {
        errorHtml = `
          <div class="article-header-container">
            <h1 class="article-title">${this.blogInfo.title}</h1>
          </div>
          <p>Blog content is not yet available.</p>
        `;
      }
      
      blogContentSection.innerHTML = errorHtml;
    }
  }
}

// Initialize the blog article loader when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new BlogArticleLoader();
});
