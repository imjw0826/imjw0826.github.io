# Personal Knowledge Hub

A simple, single-page website for showcasing your CV and sharing university study notes.

## Preview

Open `index.html` in any modern browser to view the site. For local development, you can also run a lightweight server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Customizing The Content

- **Profile details**: Update the placeholder text inside `index.html` (hero section, quick snapshot card, contact information) with your own information.
- **CV download**:
  1. Replace `assets/docs/my-cv.pdf` with your actual CV file (keep the same filename or update the download link in `index.html`).
  2. The download button will always serve the most recent file you place in that location.
- **Study notes**:
  1. Add your note files inside `assets/notes/`.
  2. Edit `assets/data/notes.json` to list each note. Every note entry supports `title`, `subject`, `summary`, `topics`, `updated`, and `url`.
  3. Keep `url` values relative to the project root (for example `assets/notes/my-course-notes.pdf`).
- **Navigation links**: If you add more sections, update the navigation list inside `index.html` so the anchor tags match the new section IDs.

## Styling & Behavior

- All styling lives in `assets/css/styles.css`. Adjust colors, typography, or layout there.
- JavaScript in `assets/js/main.js` handles navigation toggling, populating the study notes grid from the JSON file, and keeping the footer year current.

## Deployment

Because the project is static, you can host it for free on services like GitHub Pages, Netlify, or Vercel by uploading the repository contents.
