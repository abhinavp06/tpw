class AlbumReviewLoader {
  constructor() {
    this.albumPath = this.getAlbumPathFromURL();
    this.albumInfo = null;
    this.init();
  }

  getAlbumPathFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const album = urlParams.get('album') || 'albums/album-001'; // Default fallback
    return album;
  }

  async init() {
    try {
      await this.loadAlbumInfo();
      await this.renderAlbumInfo();
      await this.renderAlbumPreReview();
      this.renderTracklist();
      await this.renderAlbumMainReview();
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  async loadAlbumInfo() {
    try {
      const response = await fetch(`${this.albumPath}/info.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.albumInfo = await response.json();
      
      // Update page title
      document.title = `${this.albumInfo.albumName} - ${this.albumInfo.albumArtist} - The Philosopher's Window`;
    } catch (error) {
      console.error('Error loading album info:', error);
    }
  }

  async checkIfCoverExists() {
    try {
      const response = await fetch(`${this.albumPath}/cover.jpg`, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async renderAlbumInfo() {
    const albumInfoSection = document.getElementById('album-info');
    
    if (!this.albumInfo) {
      albumInfoSection.innerHTML = '<p>Error loading album information.</p>';
      return;
    }

    const coverExists = await this.checkIfCoverExists();
    
    const coverHtml = coverExists 
      ? `<div class="album-cover-large">
           <img src="${this.albumPath}/cover.jpg" alt="${this.albumInfo.albumName} cover" />
         </div>`
      : `<div class="album-cover-placeholder-large">
           <span>${this.albumInfo.albumName}</span>
         </div>`;

    const htmlContent = `
      <div class="album-details">
        ${coverHtml}
        <div class="album-metadata">
          <h1 class="album-title">${this.albumInfo.albumName}</h1>
          <h2 class="album-artist">${this.albumInfo.albumArtist}</h2>
          <div class="album-info-grid">
            <div class="info-item">
              <span class="info-label">Release Year:</span>
              <span class="info-value">${this.albumInfo.releaseYear}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Review Published:</span>
              <span class="info-value">${this.albumInfo.reviewPublishDate}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Global Sequence:</span>
              <span class="info-value">#${String(this.albumInfo.globalSequence).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    albumInfoSection.innerHTML = htmlContent;
  }

  async renderAlbumPreReview() {
    const albumReviewsSection = document.getElementById('album-reviews');
    
    try {
      // Load album pre-review
      let preReviewContent = null;
      try {
        const preReviewResponse = await fetch(`${this.albumPath}/reviews/album-pre-review.md`);
        if (preReviewResponse.ok) {
          preReviewContent = await preReviewResponse.text();
        }
      } catch (error) {
        console.error('Error loading pre-review:', error);
      }

      let reviewsHtml = '<div class="album-reviews-container">';
      
      if (preReviewContent) {
        // No lock for pre-review - show content directly
        reviewsHtml += `
          <div class="album-review-section">
            <h3 class="review-title">Album Pre-Review</h3>
            <div class="review-content" data-review-type="pre-review">
              <div class="review-text">
                ${convertMarkdownToHtml(preReviewContent)}
              </div>
            </div>
          </div>
        `;
      } else {
        reviewsHtml += '<p>No album pre-review available.</p>';
      }
      
      reviewsHtml += '</div>';
      albumReviewsSection.innerHTML = reviewsHtml;
      
    } catch (error) {
      console.error('Error loading album pre-review:', error);
      albumReviewsSection.innerHTML = '<p>Error loading album pre-review.</p>';
    }
  }

  async renderAlbumMainReview() {
    const albumMainReviewSection = document.getElementById('album-main-review');
    
    try {
      // Load album review
      let reviewContent = null;
      try {
        const reviewResponse = await fetch(`${this.albumPath}/reviews/album-review.md`);
        if (reviewResponse.ok) {
          reviewContent = await reviewResponse.text();
        }
      } catch (error) {
        console.error('Error loading review:', error);
      }

      let reviewsHtml = '<div class="album-reviews-container">';
      
      if (reviewContent) {
        const isUnlocked = isReviewUnlocked(this.albumPath, 'main-review');
        const lockedClass = isUnlocked ? '' : 'locked';
        const overlayHtml = isUnlocked ? '' : `
          <div class="review-lock-overlay">
            <div class="lock-icon">🔒</div>
            <div class="lock-text">Click to unlock and read the full album review</div>
            <button class="unlock-button" onclick="unlockReview(this)">Unlock Review</button>
          </div>
        `;
        const reviewTextStyle = isUnlocked ? '' : 'style="filter: blur(8px);"';
        
        reviewsHtml += `
          <div class="album-review-section">
            <h3 class="review-title">Album Review</h3>
            <div class="review-content ${lockedClass}" data-review-type="main-review">
              ${overlayHtml}
              <div class="review-text" ${reviewTextStyle}>
                ${convertMarkdownToHtml(reviewContent)}
              </div>
            </div>
          </div>
        `;
      } else {
        reviewsHtml += '<p>No album review available.</p>';
      }
      
      reviewsHtml += '</div>';
      albumMainReviewSection.innerHTML = reviewsHtml;
      
    } catch (error) {
      console.error('Error loading album main review:', error);
      albumMainReviewSection.innerHTML = '<p>Error loading album main review.</p>';
    }
  }

  renderTracklist() {
    const tracklistSection = document.getElementById('tracklist');
    
    if (!this.albumInfo || !this.albumInfo.tracklist) {
      tracklistSection.innerHTML = '<p>No tracklist available.</p>';
      return;
    }

    const tracklistHtml = this.albumInfo.tracklist
      .sort((a, b) => parseInt(a.sequence) - parseInt(b.sequence))
      .map(track => `
        <div class="track-item" data-track="${track.sequence}">
          <div class="track-number">${String(track.sequence).padStart(2, '0')}</div>
          <div class="track-name">${track.songName}</div>
          <div class="track-arrow">→</div>
        </div>
      `).join('');

    tracklistSection.innerHTML = `
      <div class="tracklist-container">
        <h3 class="tracklist-title">Tracklist</h3>
        <div class="tracklist">
          ${tracklistHtml}
        </div>
      </div>
    `;

    // Add click event listeners to tracks
    this.setupTrackNavigation();
  }

  setupTrackNavigation() {
    const trackItems = document.querySelectorAll('.track-item');
    
    trackItems.forEach(trackItem => {
      trackItem.addEventListener('click', () => {
        const trackNumber = trackItem.getAttribute('data-track');
        this.navigateToTrack(trackNumber);
      });
    });
  }

  navigateToTrack(trackNumber) {
    // Navigate to the track review page with parameters
    window.location.href = `track-review.html?album=${encodeURIComponent(this.albumPath)}&track=${trackNumber}`;
  }
}

// Global variables
let albumReviewLoader = null;

// Initialize the album review loader when the page loads
document.addEventListener('DOMContentLoaded', () => {
  albumReviewLoader = new AlbumReviewLoader();
});

// Global function to unlock review sections
function unlockReview(buttonElement) {
  const reviewContent = buttonElement.closest('.review-content');
  const overlay = reviewContent.querySelector('.review-lock-overlay');
  const reviewText = reviewContent.querySelector('.review-text');
  const reviewType = reviewContent.getAttribute('data-review-type');
  
  // Store unlock state in localStorage
  const albumPath = albumReviewLoader ? albumReviewLoader.albumPath : getAlbumPathFromURL();
  const storageKey = `unlocked_${albumPath}_${reviewType}`;
  localStorage.setItem(storageKey, 'true');
  
  // Add unlocking animation
  reviewContent.classList.add('unlocking');
  
  // Add unlock animation
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  
  // Remove blur from the review text
  reviewText.style.filter = 'none';
  reviewContent.classList.remove('locked');
  
  // Remove overlay completely after animation
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.remove();
    }
    reviewContent.classList.remove('unlocking');
  }, 300);
}

// Function to check if a review section should be unlocked
function isReviewUnlocked(albumPath, reviewType) {
  const storageKey = `unlocked_${albumPath}_${reviewType}`;
  return localStorage.getItem(storageKey) === 'true';
}

// Helper function to get album path from URL
function getAlbumPathFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('album') || 'albums/album-001';
}
