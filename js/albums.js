class AlbumLoader {
  constructor() {
    this.currentIndex = 0;
    this.albumsPerLoad = 3;
    this.loading = false;
    this.allAlbumsLoaded = false;
    this.globalSequence = [];
    this.filteredSequence = [];
    this.sortDirection = 'asc';
    this.searchTerm = '';
    
    this.init();
  }

  async init() {
    await this.loadGlobalSequence();
    this.setupSearchAndSort();
    await this.loadInitialAlbums();
    this.setupInfiniteScroll();
  }

  async loadGlobalSequence() {
    try {
      const response = await fetch('albums/global_sequence.json');
      const data = await response.json();
      this.globalSequence = data.albums.sort((a, b) => a.globalSequence - b.globalSequence);
      this.filteredSequence = [...this.globalSequence];
    } catch (error) {
      console.error('Error loading global sequence:', error);
    }
  }

  setupSearchAndSort() {
    const searchInput = document.getElementById('search-input');
    const clearButton = document.getElementById('clear-search');
    const sortButton = document.getElementById('sort-button');

    // Search functionality
    searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.trim();
      this.filterAndSort();
      
      if (this.searchTerm) {
        clearButton.style.display = 'inline-block';
      } else {
        clearButton.style.display = 'none';
      }
    });

    // Clear search
    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      this.searchTerm = '';
      clearButton.style.display = 'none';
      this.filterAndSort();
    });

    // Sort functionality
    sortButton.addEventListener('click', () => {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      sortButton.textContent = `Sort: ${this.sortDirection === 'asc' ? 'Ascending' : 'Descending'}`;
      this.filterAndSort();
    });
  }

  filterAndSort() {
    // Filter by search term
    if (this.searchTerm) {
      this.filteredSequence = this.globalSequence.filter(album => 
        album.globalSequence.toString().includes(this.searchTerm)
      );
    } else {
      this.filteredSequence = [...this.globalSequence];
    }

    // Sort
    this.filteredSequence.sort((a, b) => {
      if (this.sortDirection === 'asc') {
        return a.globalSequence - b.globalSequence;
      } else {
        return b.globalSequence - a.globalSequence;
      }
    });

    // Reset and reload
    this.currentIndex = 0;
    this.allAlbumsLoaded = false;
    this.clearTimeline();
    this.loadInitialAlbums();
  }

  clearTimeline() {
    const timeline = document.getElementById('albums-timeline');
    timeline.innerHTML = '';
  }

  async loadInitialAlbums() {
    await this.loadMoreAlbums();
  }

  async loadMoreAlbums() {
    if (this.loading || this.allAlbumsLoaded) return;

    this.loading = true;
    this.showLoadingIndicator();

    try {
      const albumsToLoad = this.filteredSequence.slice(
        this.currentIndex, 
        this.currentIndex + this.albumsPerLoad
      );

      for (const albumRef of albumsToLoad) {
        await this.loadAlbumData(albumRef);
      }

      this.currentIndex += albumsToLoad.length;
      
      if (this.currentIndex >= this.filteredSequence.length) {
        this.allAlbumsLoaded = true;
      }
    } catch (error) {
      console.error('Error loading albums:', error);
    } finally {
      this.loading = false;
      this.hideLoadingIndicator();
    }
  }

  async loadAlbumData(albumRef) {
    try {
      const response = await fetch(`${albumRef.path}/info.json`);
      const albumInfo = await response.json();
      
      // Add connecting line before the card if it's not the first one
      const timeline = document.getElementById('albums-timeline');
      if (timeline.children.length > 0) {
        this.addConnectingLine();
      }
      
      await this.renderAlbumCard(albumInfo, albumRef.path);
    } catch (error) {
      console.error(`Error loading album from ${albumRef.path}:`, error);
    }
  }

  async renderAlbumCard(albumInfo, albumPath) {
    const timeline = document.getElementById('albums-timeline');
    
    const albumCard = document.createElement('div');
    albumCard.className = 'album-card';
    albumCard.setAttribute('data-album-path', albumPath);
    albumCard.setAttribute('data-sequence', albumInfo.globalSequence);
    albumCard.style.cursor = 'pointer';
    
    // Add click event to navigate to album review
    albumCard.addEventListener('click', () => {
      // Navigate to the dynamic album review page
      window.location.href = `album-review.html?album=${encodeURIComponent(albumPath)}`;
    });

    const coverExists = await this.checkIfCoverExists(albumPath);
    const coverSrc = coverExists ? `${albumPath}/cover.jpg` : null;
    
    albumCard.innerHTML = `
      <div class="album-cover">
        <div class="album-placeholder" ${coverSrc ? `style="background-image: url('${coverSrc}'); background-size: cover; background-position: center;"` : ''}>
          ${!coverSrc ? `<span>${albumInfo.albumName}</span>` : ''}
        </div>
        <div class="sequence-number">${String(albumInfo.globalSequence).padStart(2, '0')}</div>
      </div>
      <div class="album-info">
        <p class="published-date">Published: ${albumInfo.reviewPublishDate}</p>
      </div>
    `;
    
    timeline.appendChild(albumCard);
  }

  addConnectingLine() {
    const timeline = document.getElementById('albums-timeline');
    const connectingLine = document.createElement('div');
    connectingLine.className = 'connecting-line';
    timeline.appendChild(connectingLine);
  }

  async checkIfCoverExists(albumPath) {
    try {
      const response = await fetch(`${albumPath}/cover.jpg`, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
      if (this.loading || this.allAlbumsLoaded) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when user is 200px from bottom
      if (scrollTop + windowHeight >= documentHeight - 200) {
        this.loadMoreAlbums();
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

// Initialize the album loader when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new AlbumLoader();
});
