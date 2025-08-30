// Individual TYLI article functionality
document.addEventListener('DOMContentLoaded', function() {
    loadTYLIArticle();
});

async function loadTYLIArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const tyliPath = urlParams.get('tyli');
    
    if (!tyliPath) {
        document.getElementById('tyli-content').innerHTML = '<p>No TYLI specified.</p>';
        return;
    }
    
    try {
        // Load TYLI info
        const infoResponse = await fetch(`${tyliPath}/info.json`);
        const tyliInfo = await infoResponse.json();
        
        // Load TYLI content
        const contentResponse = await fetch(`${tyliPath}/tyli.md`);
        const tyliContent = await contentResponse.text();
        
        // Update page title
        document.title = `${tyliInfo.title} - The Philosopher's Window`;
        
        // Convert markdown to HTML using the same function as blogs
        const htmlContent = convertMarkdownToHtml(tyliContent);
        
        // Display the content directly (same as blog structure)
        document.getElementById('tyli-content').innerHTML = htmlContent;
        
    } catch (error) {
        console.error('Error loading TYLI:', error);
        document.getElementById('tyli-content').innerHTML = '<p>Error loading TYLI content.</p>';
    }
}
