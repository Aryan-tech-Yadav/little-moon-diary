# Midnight Diary 👻

A responsive, dark-dreamy personal text blog with a floating ghost companion. It is a static site designed for GitHub Pages: posts are Markdown files and a JSON index, so no database or backend is required.

## Features

- Responsive layout for mobile and desktop
- Animated ghost, moon, stars, and subtle ambient glow
- Markdown posts with individual shareable URLs (`?post=slug`)
- Category filters, search, dates, and reading-time labels
- Keyboard-friendly links and reduced-motion support
- GitHub Pages-friendly relative paths

## Run locally on Ubuntu

From the project directory:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser. Keep the terminal running while testing; press `Ctrl+C` to stop it. Do not open `index.html` directly as a `file://` URL because browsers block local `fetch()` requests.

## Add a blog post

1. Create a Markdown file inside `posts/`, for example `posts/my-new-post.md`.
2. Add an object to `posts/index.json` (the newest date appears first automatically):

```json
{
  "slug": "my-new-post",
  "title": "My new post",
  "date": "2026-10-16",
  "category": "Thoughts",
  "excerpt": "A short preview for the card.",
  "readingTime": "2 min read",
  "file": "posts/my-new-post.md"
}
```

3. Make sure the `slug` is unique, the JSON commas are valid, and the `file` path matches the Markdown filename.
4. Test locally, then commit and push to GitHub. GitHub Pages will publish the changes.

Markdown headings, lists, links, blockquotes, and code blocks are supported. Markdown rendering uses the `marked` library from jsDelivr; Google Fonts are also loaded externally. If those services are unavailable, the page still loads, but Markdown may display as plain text and fallback fonts will be used.

## Personalize before publishing

- Replace the sample entries with your own posts.
- Change the About section text in `index.html`.
- Replace `hello@example.com` in `index.html` with your email, or remove the contact link.
- Update the page title and description in the `<head>` of `index.html`.

## Deploy to GitHub Pages

Create a new empty repository on GitHub (for example, `midnight-diary`), then from this directory run:

```bash
git init
git branch -M main
git add .
git commit -m "Build Midnight Diary personal blog"
git remote add origin https://github.com/YOUR-USERNAME/midnight-diary.git
git push -u origin main
```

On GitHub, open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/(root)`, then save. Wait for the Pages deployment to finish. The site URL will usually be `https://YOUR-USERNAME.github.io/midnight-diary/`.

If the repository already exists, do not run `git init` or overwrite its remote blindly. Check `git remote -v` first and use that repository's normal workflow.

## Before calling it finished

- [ ] Replace sample content and contact email
- [ ] Check mobile and desktop layouts
- [ ] Check every post opens and browser back works
- [ ] Check the GitHub Pages URL after deployment
- [ ] Avoid publishing private details in a public diary
