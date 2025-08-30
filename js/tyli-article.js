class TYLIArticleLoader {
  constructor() {
    this.tyliPath = this.getTYLIPathFromURL();
    this.tyliInfo = null;
    this.init();
  }

  getTYLIPathFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tyli') || urlParams.get('folder'); // Support both parameter names
  }

  async init() {
    // Set up the back link first
    this.setupBackLink();
    
    // Then load TYLI content
    await this.loadTYLIContent();
  }

  setupBackLink() {
    const backLink = document.querySelector('.back-link');
    if (backLink) {
      const tyliUrl = 'tyli.html';
      backLink.href = tyliUrl;
      
      // Also add click handler for better reliability
      backLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = tyliUrl;
      });
    }
  }

  async loadTYLIContent() {
    const tyliContentSection = document.getElementById('tyli-content');
    
    if (!this.tyliPath) {
      tyliContentSection.innerHTML = '<p>No TYLI specified.</p>';
      return;
    }
    
    try {
      // Load TYLI info and content
      const [infoResponse, contentResponse] = await Promise.all([
        fetch(`${this.tyliPath}/info.json`),
        fetch(`${this.tyliPath}/tyli.md`)
      ]);
      
      if (!infoResponse.ok || !contentResponse.ok) {
        throw new Error('TYLI content not found');
      }
      
      this.tyliInfo = await infoResponse.json();
      const tyliContent = await contentResponse.text();
      
      // Update page title
      document.title = `${this.tyliInfo.title} - The Philosopher's Window`;
      
      // Add TYLI header
      const headerHtml = `
        <div class="article-header-container">
          <h1 class="article-title">${this.tyliInfo.title}</h1>
          <div class="article-meta">
            <time datetime="${this.tyliInfo.publishDate}">${new Date(this.tyliInfo.publishDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</time>
            <span class="article-author">by ${this.tyliInfo.author}</span>
          </div>
        </div>
      `;
      
      // Convert markdown to HTML and display
      const htmlContent = convertMarkdownToHtml(tyliContent);
      tyliContentSection.innerHTML = headerHtml + htmlContent;
      
    } catch (error) {
      console.error('Error loading TYLI:', error);
      
      let errorHtml = '<p>Error loading TYLI content.</p>';
      if (this.tyliInfo) {
        errorHtml = `
          <div class="article-header-container">
            <h1 class="article-title">${this.tyliInfo.title}</h1>
          </div>
          <p>TYLI content is not yet available.</p>
        `;
      }
      
      tyliContentSection.innerHTML = errorHtml;
    }
  }
}

// Initialize the TYLI article loader when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new TYLIArticleLoader();
});
