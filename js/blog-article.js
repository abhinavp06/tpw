// Individual blog article functionality
document.addEventListener('DOMContentLoaded', function() {
    loadBlogArticle();
});

async function loadBlogArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const blogFolder = urlParams.get('folder');
    
    if (!blogFolder) {
        document.getElementById('blog-content').innerHTML = '<p>No blog specified.</p>';
        return;
    }
    
    try {
        // Load blog info
        const infoResponse = await fetch(`blogs/${blogFolder}/info.json`);
        const blogInfo = await infoResponse.json();
        
        // Load blog content
        const contentResponse = await fetch(`blogs/${blogFolder}/blog.md`);
        const blogContent = await contentResponse.text();
        
        // Update page title
        document.title = `${blogInfo.title} - The Philosopher's Window`;
        
        // Convert markdown to HTML using the same function as other content
        const htmlContent = convertMarkdownToHtml(blogContent);
        
        // Display the content directly (same as note structure)
        document.getElementById('blog-content').innerHTML = htmlContent;
        
    } catch (error) {
        console.error('Error loading blog:', error);
        document.getElementById('blog-content').innerHTML = '<p>Error loading blog content.</p>';
    }
}
