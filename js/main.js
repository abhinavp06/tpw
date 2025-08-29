// Simple JavaScript for The Philosopher's Window Blog
// Minimal functionality to enhance user experience

document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add a simple fade-in animation for content
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    document.querySelectorAll('.blog-post, .post-card, .album-collection').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add a simple loading indicator
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
});

// Simple photo placeholder click handler for future enhancement
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('photo-placeholder')) {
        // Future: Could open a lightbox or navigate to full image
        console.log('Photo clicked:', e.target.textContent);
    }
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Simple keyboard shortcuts
    if (e.altKey) {
        switch(e.key) {
            case '1':
                window.location.href = 'index.html';
                break;
            case '2':
                window.location.href = 'album.html';
                break;
            case '3':
                window.location.href = 'blogs.html';
                break;
        }
    }
});

// Simple markdown to HTML converter
function convertMarkdownToHtml(markdown) {
    let html = markdown;
    
    // Convert headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Convert bold text (but preserve existing HTML tags)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Convert italic text (both asterisk and underscore)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Convert code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Convert images first (before links)
    html = html.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; display: block; margin: 1rem 0;">');
    
    // Convert links with neon green highlighting and open in new tab
    html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2" class="markdown-link" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convert line breaks to paragraphs (but preserve existing HTML)
    html = html.split('\n\n').map(paragraph => {
        paragraph = paragraph.trim();
        if (paragraph === '') return '';
        if (paragraph.startsWith('<') || paragraph.includes('<h') || paragraph.includes('<pre') || paragraph.includes('<ul') || paragraph.includes('<ol')) {
            return paragraph;
        }
        return '<p>' + paragraph.replace(/\n/g, '<br>') + '</p>';
    }).join('\n');
    
    // Convert unordered lists
    html = html.replace(/^\- (.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Convert ordered lists
    html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');
    
    // Convert blockquotes
    html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');
    
    return html;
}
