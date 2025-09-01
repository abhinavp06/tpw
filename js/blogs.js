class BlogLoader {
  constructor() {
    this.currentIndex = 0;
    this.blogsPerLoad = 3;
    this.loading = false;
    this.allBlogsLoaded = false;
    this.globalSequence = [];
    this.filteredSequence = [];
    this.sortDirection = 'desc'; // Default to newest first for blogs
    this.searchTerm = '';
    
    this.init();
  }

  async init() {
    await this.loadGlobalSequence();
    this.setupSearchAndSort();
    await this.loadInitialBlogs();
    this.setupInfiniteScroll();
  }

  async loadGlobalSequence() {
    try {
      const response = await fetch('blogs/blogs_sequence.json');
      const data = await response.json();
      this.globalSequence = data.blogs.sort((a, b) => a.sequence - b.sequence);
      this.filteredSequence = [...this.globalSequence];
      this.applySorting();
    } catch (error) {
      console.error('Error loading blogs sequence:', error);
    }
  }

  setupSearchAndSort() {
    const sortButton = document.getElementById('sort-button');

    // Sort functionality
    sortButton.addEventListener('click', () => {
      this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
      const sortText = this.sortDirection === 'desc' ? 'newest first ↓' : 'oldest first ↑';
      sortButton.textContent = `sort: ${sortText}`;
      this.filterAndSort();
    });
  }

  async filterAndSort() {
    // Reset state
    this.currentIndex = 0;
    this.allBlogsLoaded = false;
    document.getElementById('blogs-timeline').innerHTML = '';
    
    // Use all blogs (no search filtering)
    this.filteredSequence = [...this.globalSequence];
    
    this.applySorting();
    await this.loadInitialBlogs();
  }

  applySorting() {
    this.filteredSequence.sort((a, b) => {
      if (this.sortDirection === 'desc') {
        return a.sequence - b.sequence; // Lower sequence = newer
      } else {
        return b.sequence - a.sequence; // Higher sequence = older
      }
    });
  }

  async loadInitialBlogs() {
    await this.loadBlogBatch();
  }

  async loadBlogBatch() {
    if (this.loading || this.allBlogsLoaded) return;
    
    this.loading = true;
    this.showLoadingIndicator();
    
    const endIndex = Math.min(this.currentIndex + this.blogsPerLoad, this.filteredSequence.length);
    const blogsToLoad = this.filteredSequence.slice(this.currentIndex, endIndex);
    
    for (const blog of blogsToLoad) {
      try {
        const blogData = await this.loadBlogData(blog.folder);
        this.renderBlogCard(blogData, blog.folder);
      } catch (error) {
        console.error(`Error loading blog: ${blog.folder}`, error);
      }
    }
    
    this.currentIndex = endIndex;
    
    if (this.currentIndex >= this.filteredSequence.length) {
      this.allBlogsLoaded = true;
    }
    
    this.loading = false;
    this.hideLoadingIndicator();
  }

  async loadBlogData(folder) {
    const [infoResponse, contentResponse] = await Promise.all([
      fetch(`blogs/${folder}/info.json`),
      fetch(`blogs/${folder}/blog.md`)
    ]);
    
    const info = await infoResponse.json();
    const content = await contentResponse.text();
    
    return {
      ...info,
      content: content
    };
  }

  renderBlogCard(blog, folder) {
    const timeline = document.getElementById('blogs-timeline');
    
    const blogCard = document.createElement('article');
    blogCard.className = 'blog-post';
    blogCard.setAttribute('data-folder', folder);
    
    // Format date
    const publishDate = new Date(blog.publishDate);
    const formattedDate = publishDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
    
    blogCard.innerHTML = `
      <header class="post-header">
        <h2><a href="blog-article.html?folder=${folder}" class="blog-title-link">${blog.title}</a></h2>
        <time datetime="${blog.publishDate}">${formattedDate}</time>
      </header>
      
      <div class="post-content">
        <p>${blog.excerpt}</p>
      </div>
    `;
    
    timeline.appendChild(blogCard);
    
    // Make immediately visible - no animation
    blogCard.classList.add('visible');
  }

  setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loading && !this.allBlogsLoaded) {
          this.loadBlogBatch();
        }
      });
    }, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });

    // Create a sentinel element for infinite scroll
    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.height = '1px';
    document.getElementById('blogs-timeline').appendChild(sentinel);
    
    observer.observe(sentinel);
  }

  showLoadingIndicator() {
    document.getElementById('loading-indicator').style.display = 'flex';
  }

  hideLoadingIndicator() {
    document.getElementById('loading-indicator').style.display = 'none';
  }
}

// Initialize the blog loader when the page loads
let blogLoader;
document.addEventListener('DOMContentLoaded', () => {
  blogLoader = new BlogLoader();
});
