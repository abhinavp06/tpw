class TYLILoader {
  constructor() {
    this.currentIndex = 0;
    this.tyliPerLoad = 3;
    this.loading = false;
    this.allTYLILoaded = false;
    this.globalSequence = [];
    this.filteredSequence = [];
    this.sortDirection = 'desc'; // Default to newest first for TYLI
    this.searchTerm = '';
    
    this.init();
  }

  async init() {
    await this.loadGlobalSequence();
    this.setupSearchAndSort();
    await this.loadInitialTYLI();
    this.setupInfiniteScroll();
  }

  async loadGlobalSequence() {
    try {
      const response = await fetch('tyli/tyli_sequence.json');
      const data = await response.json();
      this.globalSequence = data.tyli.sort((a, b) => a.sequence - b.sequence);
      this.filteredSequence = [...this.globalSequence];
      this.applySorting();
    } catch (error) {
      console.error('Error loading TYLI sequence:', error);
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
    this.allTYLILoaded = false;
    document.getElementById('tyli-timeline').innerHTML = '';
    
    // Apply current sorting and load
    this.applySorting();
    await this.loadInitialTYLI();
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

  async loadInitialTYLI() {
    await this.loadMoreTYLI();
  }

  async loadMoreTYLI() {
    if (this.loading || this.allTYLILoaded) return;
    
    this.loading = true;
    this.showLoadingIndicator();
    
    const endIndex = Math.min(this.currentIndex + this.tyliPerLoad, this.filteredSequence.length);
    const tyliToLoad = this.filteredSequence.slice(this.currentIndex, endIndex);
    
    for (const tyli of tyliToLoad) {
      try {
        const tyliData = await this.loadTYLIData(tyli.folder);
        this.renderTYLICard(tyliData, tyli.folder);
      } catch (error) {
        console.error(`Error loading TYLI: ${tyli.folder}`, error);
      }
    }
    
    this.currentIndex = endIndex;
    
    if (this.currentIndex >= this.filteredSequence.length) {
      this.allTYLILoaded = true;
    }
    
    this.loading = false;
    this.hideLoadingIndicator();
  }

  async loadTYLIData(folder) {
    const infoResponse = await fetch(`tyli/${folder}/info.json`);
    const info = await infoResponse.json();
    return info;
  }

  renderTYLICard(tyli, folder) {
    const timeline = document.getElementById('tyli-timeline');
    
    const tyliCard = document.createElement('article');
    tyliCard.className = 'blog-post';
    tyliCard.setAttribute('data-folder', folder);
    
    // Format date
    const publishDate = new Date(tyli.publishDate);
    const formattedDate = publishDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
    
    tyliCard.innerHTML = `
      <header class="post-header">
        <h2><a href="tyli-article.html?tyli=tyli/${folder}" class="blog-title-link">${tyli.title}</a></h2>
        <time datetime="${tyli.publishDate}">${formattedDate}</time>
      </header>
      
      <div class="post-content">
        <p>${tyli.excerpt}</p>
      </div>
    `;
    
    timeline.appendChild(tyliCard);
    
    // Make immediately visible - no animation
    tyliCard.classList.add('visible');
  }

  setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
      if (this.loading || this.allTYLILoaded) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when user is 200px from bottom
      if (scrollTop + windowHeight >= documentHeight - 200) {
        this.loadMoreTYLI();
      }
    });
  }

  showLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
      indicator.style.display = 'block';
    }
  }

  hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }
}

// Initialize the TYLI loader when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new TYLILoader();
});
