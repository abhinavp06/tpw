// Individual note article functionality
document.addEventListener('DOMContentLoaded', function() {
    loadNoteArticle();
});

async function loadNoteArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const notePath = urlParams.get('path');
    
    if (!notePath) {
        document.getElementById('note-content').innerHTML = '<p>No note specified.</p>';
        return;
    }
    
    try {
        // Load note info
        const infoResponse = await fetch(`${notePath}/info.json`);
        const noteInfo = await infoResponse.json();
        
        // Load note content
        const contentResponse = await fetch(`${notePath}/note.md`);
        const noteContent = await contentResponse.text();
        
        // Update page title
        document.title = `${noteInfo.title} - The Philosopher's Window`;
        
        // Convert markdown to HTML using the same function as blogs
        const htmlContent = convertMarkdownToHtml(noteContent);
        
        // Display the content directly (same as blog structure)
        document.getElementById('note-content').innerHTML = htmlContent;
        
    } catch (error) {
        console.error('Error loading note:', error);
        document.getElementById('note-content').innerHTML = '<p>Error loading note content.</p>';
    }
}
