# Skills Connect Network website

Static site (HTML, CSS, JS). No build step.

- Preview: open `index.html`, or run `npx serve .` in this folder.
- Deploy: works as-is on Vercel, Netlify or GitHub Pages (root directory = this folder).
- Photos live in `assets/images`. The pottery card shows a "Photos coming soon" tile; replace it with an <img> when you have pottery photos.

## v3 upgrade
New files: `css/upgrade.css` and `js/upgrade.js` (loaded after the originals). Adds preloader, word-by-word headline, hero photo slideshow with parallax, photo strip, image cards in Programs, cursor spotlight, magnetic buttons, training filters, lightbox arrows/swipe and a kente-style footer strip. Respects `prefers-reduced-motion`.
