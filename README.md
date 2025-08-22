# TPW - A Minimal Blog Website

TPW (Thoughts, Photography, Words) is a clean, minimal blog website built with pure HTML, CSS, and JavaScript.

## Structure

```
tpw/
├── index.html          # Home page
├── album.html          # Photo album section
├── blogs.html          # Blog posts section
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   └── main.js         # JavaScript functionality
├── images/             # Directory for images (placeholder)
└── README.md           # This file
```

## Features

- **Minimal Design**: Clean, distraction-free layout inspired by simple blog aesthetics
- **Responsive**: Works well on desktop, tablet, and mobile devices
- **Three Sections**:
  - **Home**: Welcome page with introduction and recent activity
  - **Album**: Photo gallery with placeholder images organized in collections
  - **Blogs**: Blog posts with sample content
- **Navigation**: Simple top navigation with active state indication
- **Accessibility**: Keyboard navigation support (Alt+1/2/3 for quick section switching)
- **Smooth Animations**: Subtle fade-in effects for content sections

## Getting Started

1. Open `index.html` in your web browser to view the home page
2. Navigate between sections using the top navigation menu
3. The design is intentionally minimal and focuses on content readability

## Customization

- **Colors**: Modify the CSS variables in `css/style.css` to change the color scheme
- **Typography**: Update the font-family in the body selector for different fonts
- **Layout**: Adjust the max-width of `.main-content` to change content width
- **Images**: Replace photo placeholders in the album section with actual images

## Browser Support

This website uses modern CSS features but maintains broad browser compatibility:

- CSS Grid for layouts
- Flexbox for navigation
- CSS transitions for smooth interactions
- Intersection Observer API for scroll animations

## Philosophy

TPW embraces the philosophy of minimal web design:

- No complex frameworks or build processes
- Fast loading with minimal dependencies
- Focus on content over decoration
- Clean, semantic HTML structure
- Progressive enhancement with JavaScript

## Future Enhancements

Potential improvements while maintaining simplicity:

- Image lightbox for album photos
- Blog post pagination
- Search functionality
- RSS feed generation
- Dark mode toggle
