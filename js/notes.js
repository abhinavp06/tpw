// Notes page functionality - with debounced search capability
class NotesLoader {
    constructor() {
        this.sortDirection = 'desc'; // 'desc' for newest first, 'asc' for oldest first
        this.notesData = [];
        this.filteredNotesData = [];
        this.searchTerm = '';
        this.searchTimeout = null; // For debouncing
        this.SEARCH_DEBOUNCE_DELAY = 300; // milliseconds
        this.SEARCH_MIN_CHARS = 4; // minimum characters before debouncing
    }

    async init() {
        await this.loadNotes();
        this.setupSort();
        this.setupSearch();
        this.hideLoading();
    }

    setupSort() {
        const sortButton = document.getElementById('sort-button');

        // Sort functionality
        sortButton.addEventListener('click', () => {
            this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
            const sortText = this.sortDirection === 'desc' ? 'newest first ↓' : 'oldest first ↑';
            sortButton.textContent = `sort: ${sortText}`;
            this.renderNotes();
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const clearButton = document.getElementById('clear-search');

        // Search functionality with debouncing
        searchInput.addEventListener('input', (e) => {
            const inputValue = e.target.value.trim();
            
            // Clear any existing timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = null;
            }
            
            // Show/hide clear button immediately
            if (inputValue) {
                clearButton.style.display = 'block';
            } else {
                clearButton.style.display = 'none';
            }
            
            // Handle different input length scenarios
            if (inputValue.length === 0) {
                // Empty input: show all notes immediately
                this.searchTerm = '';
                this.filterAndRenderNotes();
            } else if (inputValue.length < this.SEARCH_MIN_CHARS) {
                // Less than 4 characters: show all notes but indicate search is pending
                this.searchTerm = '';
                this.filteredNotesData = [...this.notesData];
                this.renderNotesWithSearchIndicator(inputValue);
            } else {
                // 4 or more characters: apply debounced search
                this.searchTimeout = setTimeout(() => {
                    this.searchTerm = inputValue.toLowerCase();
                    this.filterAndRenderNotes();
                    this.searchTimeout = null;
                }, this.SEARCH_DEBOUNCE_DELAY);
                
                // Show immediate feedback that search is processing
                this.showSearchProcessing();
            }
        });

        // Clear search functionality
        clearButton.addEventListener('click', () => {
            // Clear any pending search timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = null;
            }
            
            searchInput.value = '';
            this.searchTerm = '';
            clearButton.style.display = 'none';
            this.filterAndRenderNotes();
            searchInput.focus();
        });
    }

    filterAndRenderNotes() {
        // Filter notes based on search term
        this.filteredNotesData = this.notesData.filter(note => {
            if (!this.searchTerm) return true;
            
            // Search in title and summary/excerpt
            const titleMatch = note.title.toLowerCase().includes(this.searchTerm);
            const summaryMatch = note.summary && note.summary.toLowerCase().includes(this.searchTerm);
            const excerptMatch = note.excerpt && note.excerpt.toLowerCase().includes(this.searchTerm);
            
            return titleMatch || summaryMatch || excerptMatch;
        });

        this.renderNotes();
    }

    async loadNotes() {
        try {
            const response = await fetch('notes/notes_sequence.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const sequenceData = await response.json();
            
            // Load all note details
            const notePromises = sequenceData.notes.map(async (noteRef) => {
                try {
                    const noteResponse = await fetch(`${noteRef.path}/info.json`);
                    if (!noteResponse.ok) {
                        console.warn(`Failed to load info for note ${noteRef.path}`);
                        return null;
                    }
                    const noteInfo = await noteResponse.json();
                    return { ...noteInfo, path: noteRef.path };
                } catch (error) {
                    console.warn(`Error loading note ${noteRef.path}:`, error);
                    return null;
                }
            });

            this.notesData = (await Promise.all(notePromises))
                .filter(note => note !== null)
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // Default to latest first

            // Initialize filtered data
            this.filteredNotesData = [...this.notesData];
            this.renderNotes();
        } catch (error) {
            console.error('Error loading notes:', error);
            this.showError();
        }
    }

    renderNotes() {
        const timeline = document.getElementById('notes-timeline');
        if (!timeline) return;

        // Clear existing content
        timeline.innerHTML = '';

        // Create notes container with same structure as blogs
        const notesContainer = document.createElement('div');
        notesContainer.className = 'blog-posts'; // Using same class as blogs
        
        // Sort filtered notes based on current sort direction
        const sortedNotes = [...this.filteredNotesData].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return this.sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
        });

        if (sortedNotes.length === 0) {
            // Show no results message
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <p>No notes found${this.searchTerm ? ` matching "${this.searchTerm}"` : ''}.</p>
            `;
            timeline.appendChild(noResults);
            return;
        }

        sortedNotes.forEach((note, index) => {
            const noteElement = this.createNoteElement(note);
            notesContainer.appendChild(noteElement);
            
            // Make immediately visible - no animation
            noteElement.classList.add('visible');
        });

        timeline.appendChild(notesContainer);
    }

    createNoteElement(note) {
        const article = document.createElement('article');
        article.className = 'blog-post'; // Using same class as blogs
        
        article.innerHTML = `
            <div class="post-header">
                <h2>
                    <a href="note-article.html?path=${encodeURIComponent(note.path)}" class="blog-title-link">${note.title}</a>
                </h2>
                <time datetime="${note.date}">${this.formatDate(note.date)}</time>
            </div>
            <div class="post-content">
                <p>${note.summary}</p>
            </div>
        `;

        return article;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    hideLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }

    showError() {
        const loadingIndicator = document.getElementById('loading-indicator');
        const errorMessage = document.getElementById('error-message');
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        if (errorMessage) {
            errorMessage.style.display = 'block';
        }
    }

    renderNotesWithSearchIndicator(partialSearchTerm) {
        const timeline = document.getElementById('notes-timeline');
        if (!timeline) return;

        // Clear existing content
        timeline.innerHTML = '';

        // Show search indicator for partial input
        const searchIndicator = document.createElement('div');
        searchIndicator.className = 'search-indicator';
        searchIndicator.innerHTML = `
            <p>Type ${this.SEARCH_MIN_CHARS - partialSearchTerm.length} more character${this.SEARCH_MIN_CHARS - partialSearchTerm.length === 1 ? '' : 's'} to search...</p>
        `;
        timeline.appendChild(searchIndicator);

        // Create notes container and show all notes
        const notesContainer = document.createElement('div');
        notesContainer.className = 'blog-posts';
        
        // Sort all notes based on current sort direction
        const sortedNotes = [...this.notesData].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return this.sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
        });

        sortedNotes.forEach((note, index) => {
            const noteElement = this.createNoteElement(note);
            notesContainer.appendChild(noteElement);
            
            // Make immediately visible - no animation
            noteElement.classList.add('visible');
        });

        timeline.appendChild(notesContainer);
    }

    showSearchProcessing() {
        const timeline = document.getElementById('notes-timeline');
        if (!timeline) return;

        // Clear existing content
        timeline.innerHTML = '';

        // Show processing indicator
        const processingIndicator = document.createElement('div');
        processingIndicator.className = 'search-processing';
        processingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Searching notes...</p>
        `;
        timeline.appendChild(processingIndicator);
    }
}

// Initialize when page loads
const notesLoader = new NotesLoader();

document.addEventListener('DOMContentLoaded', function() {
    notesLoader.init();
});
