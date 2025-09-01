class NoteArticleLoader {
  constructor() {
    this.notePath = this.getNotePathFromURL();
    this.noteInfo = null;
    this.init();
  }

  getNotePathFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('note') || urlParams.get('path'); // Support both parameter names
  }

  async init() {
    // Set up the back link first
    this.setupBackLink();
    
    // Then load note content
    await this.loadNoteContent();
  }

  setupBackLink() {
    const backLink = document.querySelector('.back-link');
    if (backLink) {
      const notesUrl = 'notes.html';
      backLink.href = notesUrl;
      
      // Also add click handler for better reliability
      backLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = notesUrl;
      });
    }
  }

  async loadNoteContent() {
    const noteContentSection = document.getElementById('note-content');
    
    if (!this.notePath) {
      noteContentSection.innerHTML = '<p>No note specified.</p>';
      return;
    }
    
    try {
      // Load note info and content
      const [infoResponse, contentResponse] = await Promise.all([
        fetch(`${this.notePath}/info.json`),
        fetch(`${this.notePath}/note.md`)
      ]);
      
      if (!infoResponse.ok || !contentResponse.ok) {
        throw new Error('Note content not found');
      }
      
      this.noteInfo = await infoResponse.json();
      const noteContent = await contentResponse.text();
      
      // Update page title
      document.title = `${this.noteInfo.title} - The Philosopher's Window`;
      
      // Add note header
      const headerHtml = `
        <div class="article-header-container">
          <h1 class="article-title">${this.noteInfo.title}</h1>
          <div class="article-meta">
            <time datetime="${this.noteInfo.date}">${new Date(this.noteInfo.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</time>
            <span class="article-author">by abhinavp06</span>
          </div>
        </div>
      `;
      
      // Convert markdown to HTML and display
      const htmlContent = convertMarkdownToHtml(noteContent);
      noteContentSection.innerHTML = headerHtml + htmlContent;
      
    } catch (error) {
      console.error('Error loading note:', error);
      
      let errorHtml = '<p>Error loading note content.</p>';
      if (this.noteInfo) {
        errorHtml = `
          <div class="article-header-container">
            <h1 class="article-title">${this.noteInfo.title}</h1>
          </div>
          <p>Note content is not yet available.</p>
        `;
      }
      
      noteContentSection.innerHTML = errorHtml;
    }
  }
}

// Initialize the note article loader when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new NoteArticleLoader();
});
