// Simple JavaScript for TPW Blog
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
