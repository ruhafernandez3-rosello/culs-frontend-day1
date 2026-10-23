Modified by: Ruha

# The Little Herb Garden — Single Page Application (SPA)

## Project Overview
"The Little Herb Garden" is a fully responsive, highly accessible Single Page Application (SPA) built from scratch using pure HTML5, CSS3, JavaScript (ES6+), and the DOM API without external frameworks, libraries, or heavy dependencies. It features an interactive herb encyclopedia, dynamic JSON data loading, growth stage trackers, garden layout planners, a soil/water compatibility checker, voice search functionality, and high-contrast theme toggling.

## Folder Structure
```text
the_little_herb_garden_pro_v4/
├── index.html
├── style.css
├── app.js
├── data/
│   ├── basil.json
│   ├── spearmint.json
│   ├── rosemary.json
│   ├── thyme.json
│   ├── lavender.json
│   ├── sage.json
│   ├── chamomile.json
│   └── chives.json
├── image/
│   ├── collection-banner.jpg
│   ├── basil.svg
│   ├── spearmint.svg
│   ├── rosemary.svg
│   ├── thyme.svg
│   ├── lavender.svg
│   ├── sage.svg
│   ├── chamomile.svg
│   └── chives.svg
└── README.md
```

## How JSON Data is Loaded
All herb records are stored modularly as individual JSON files inside the `data/` directory (`basil.json`, `spearmint.json`, etc.). When the application initializes, `app.js` issues asynchronous `fetch()` requests concurrently via `Promise.all()` to load all JSON files into memory. This ensures clean separation of concerns and dynamic extensibility.

## How the Herb Image and Slider Work
- **Uploaded Collection Image:** Displayed prominently at the top of the homepage (`index.html`) with proper responsive sizing, lazy loading, descriptive `alt` text, and the required caption: *“Our Herb Collection — Fresh from The Little Herb Garden.”*
- **Hero Slider / Carousel:** Built in `app.js`, it automatically cycles through featured herbs every 4 seconds with smooth CSS transitions. Users can also navigate using previous/next arrow buttons or pagination dots. Hovering over the slider pauses auto-scrolling for better readability.

## Voice Search Functionality
Powered by the browser's native Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), users can click the **🎤 Voice Search** button and speak natural language commands such as:
- *"Show me basil"*
- *"Find perennial herbs"*
- *"Annual"*

The application listens to the voice input, automatically switches to the Herbs tab, parses keywords, applies category filters, and updates the search query instantly.

## Accessibility Features
- **Semantic HTML5 Elements:** Proper usage of `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, and `<table>`.
- **ARIA Attributes & Roles:** Tablists (`role="tablist"`), modals (`role="dialog"`), live regions (`aria-live="polite"`), and explicit button labels.
- **Keyboard Navigation:** Full support for `Tab`, `Enter`, and `Space` key interaction across cards, tabs, and modals.
- **High Contrast & Theme Toggle:** A built-in theme toggle supports high-contrast dark/light mode switching.
- **Screen Reader Support:** Descriptive alternative text (`alt`) for all images and skip-to-content links.

## How to Run the Project
1. Extract the downloaded ZIP archive.
2. Open `index.html` directly in any modern web browser (Chrome, Edge, Safari, Firefox), or run it locally via a development server (such as VS Code Live Server) for optimal asynchronous `fetch()` support.
