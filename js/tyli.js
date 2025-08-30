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
        return b.sequence - a.sequence;
      } else {
        return a.sequence - b.sequence;
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

    try {
      const tyliToLoad = this.filteredSequence.slice(
        this.currentIndex, 
        this.currentIndex + this.tyliPerLoad
      );

      for (const tyliRef of tyliToLoad) {
        await this.loadTYLIData(tyliRef);
      }

      this.currentIndex += tyliToLoad.length;
      
      if (this.currentIndex >= this.filteredSequence.length) {
        this.allTYLILoaded = true;
      }
    } catch (error) {
      console.error('Error loading TYLI:', error);
    } finally {
      this.loading = false;
      this.hideLoadingIndicator();
    }
  }

  async loadTYLIData(tyliRef) {
    try {
      const tyliPath = `tyli/${tyliRef.folder}`;
      const response = await fetch(`${tyliPath}/info.json`);
      if (!response.ok) {
        console.error(`Failed to load info for TYLI ${tyliPath}`);
        return;
      }
      
      const tyliInfo = await response.json();
      await this.renderTYLICard(tyliInfo, tyliPath);
    } catch (error) {
      console.error(`Error loading TYLI ${tyliRef.folder}:`, error);
    }
  }

  async renderTYLICard(tyliInfo, tyliPath) {
    const timeline = document.getElementById('tyli-timeline');
    
    const tyliCard = document.createElement('div');
    tyliCard.className = 'blog-card';
    tyliCard.style.cursor = 'pointer';
    
    // Add click event to navigate to TYLI article
    tyliCard.addEventListener('click', () => {
      window.location.href = `tyli-article.html?tyli=${encodeURIComponent(tyliPath)}`;
    });

    const formattedDate = new Date(tyliInfo.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    tyliCard.innerHTML = `
      <div class="blog-content">
        <div class="blog-meta">
          <span class="blog-date">${formattedDate}</span>
          <span class="blog-author">by ${tyliInfo.author}</span>
        </div>
        <h2 class="blog-title">${tyliInfo.title}</h2>
        <p class="blog-excerpt">${tyliInfo.summary}</p>
        <div class="blog-arrow">→</div>
      </div>
    `;
    
    timeline.appendChild(tyliCard);
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
