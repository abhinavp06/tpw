class TrackReviewLoader {
  constructor() {
    this.albumPath = this.getAlbumPathFromURL();
    this.trackNumber = this.getTrackNumberFromURL();
    this.albumInfo = null;
    this.trackInfo = null;
    this.init();
  }

  getAlbumPathFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('album') || 'albums/album-001';
  }

  getTrackNumberFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('track') || '1';
  }

  async init() {
    // Set up the back link first
    this.setupBackLink();
    
    // Then load album info and track content
    await this.loadAlbumInfo();
    await this.loadTrackContent();
  }

  async loadAlbumInfo() {
    try {
      const response = await fetch(`${this.albumPath}/info.json`);
      this.albumInfo = await response.json();
      
      // Find the specific track info
      this.trackInfo = this.albumInfo.tracklist.find(track => track.sequence === this.trackNumber);
      
      // Update page title
      if (this.trackInfo) {
        document.title = `${this.trackInfo.songName} - ${this.albumInfo.albumName} - The Philosopher's Window`;
      }
    } catch (error) {
      console.error('Error loading album info:', error);
    }
  }

  setupBackLink() {
    const backLink = document.getElementById('back-to-album');
    if (backLink) {
      const albumReviewUrl = `album-review.html?album=${encodeURIComponent(this.albumPath)}`;
      backLink.href = albumReviewUrl;
      
      // Also add click handler for better reliability
      backLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = albumReviewUrl;
      });
    }
  }

  async loadTrackContent() {
    const trackContentSection = document.getElementById('track-content');
    
    try {
      // Try to load the track-specific markdown file
      const response = await fetch(`${this.albumPath}/reviews/${this.trackNumber}.md`);
      
      if (response.ok) {
        const content = await response.text();
        
        // Add track header with navigation arrows
        let headerHtml = '';
        if (this.trackInfo && this.albumInfo) {
          const currentTrackNum = parseInt(this.trackNumber);
          const totalTracks = this.albumInfo.tracklist.length;
          
          const prevTrack = currentTrackNum > 1 ? currentTrackNum - 1 : null;
          const nextTrack = currentTrackNum < totalTracks ? currentTrackNum + 1 : null;
          
          headerHtml = `
            <div class="track-header-container">
              <h1 class="track-title">#${this.trackNumber} ${this.trackInfo.songName}</h1>
              <div class="track-navigation">
                ${prevTrack ? 
                  `<button class="nav-arrow nav-arrow-left" onclick="navigateToTrack(${prevTrack})" title="Previous track">←</button>` : 
                  `<button class="nav-arrow nav-arrow-left disabled" disabled title="First track">←</button>`
                }
                ${nextTrack ? 
                  `<button class="nav-arrow nav-arrow-right" onclick="navigateToTrack(${nextTrack})" title="Next track">→</button>` : 
                  `<button class="nav-arrow nav-arrow-right disabled" disabled title="Last track">→</button>`
                }
              </div>
            </div>
          `;
        }
        
        // Convert markdown to HTML and display
        const htmlContent = convertMarkdownToHtml(content);
        trackContentSection.innerHTML = headerHtml + htmlContent;
      } else {
        throw new Error('Track review not found');
      }
    } catch (error) {
      console.error('Error loading track content:', error);
      
      let errorHtml = '<p>Error loading track content.</p>';
      if (this.trackInfo && this.albumInfo) {
        const currentTrackNum = parseInt(this.trackNumber);
        const totalTracks = this.albumInfo.tracklist.length;
        
        const prevTrack = currentTrackNum > 1 ? currentTrackNum - 1 : null;
        const nextTrack = currentTrackNum < totalTracks ? currentTrackNum + 1 : null;
        
        errorHtml = `
          <div class="track-header-container">
            <h1 class="track-title">${this.trackInfo.songName}</h1>
            <div class="track-navigation">
              ${prevTrack ? 
                `<button class="nav-arrow nav-arrow-left" onclick="navigateToTrack(${prevTrack})" title="Previous track">←</button>` : 
                `<button class="nav-arrow nav-arrow-left disabled" disabled title="First track">←</button>`
              }
              ${nextTrack ? 
                `<button class="nav-arrow nav-arrow-right" onclick="navigateToTrack(${nextTrack})" title="Next track">→</button>` : 
                `<button class="nav-arrow nav-arrow-right disabled" disabled title="Last track">→</button>`
              }
            </div>
          </div>
          <p>Review for this track is not yet available.</p>
        `;
      }
      
      trackContentSection.innerHTML = errorHtml;
    }
  }
}

// Global function for navigation arrows
function navigateToTrack(trackNumber) {
  const urlParams = new URLSearchParams(window.location.search);
  const albumPath = urlParams.get('album');
  window.location.href = `track-review.html?album=${encodeURIComponent(albumPath)}&track=${trackNumber}`;
}

// Initialize the track review loader when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new TrackReviewLoader();
});
