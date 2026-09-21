# SolvexSolution website

Static website (HTML, CSS, JavaScript). No build step, no framework, no server needed.

## Folder structure

```
index.html              page structure
favicon.svg, robots.txt
assets/
  css/style.css         all styling
  js/app.js             CONFIG (contact, stats, about) + all page behaviour  <-- edit contact/about here
  js/projects.js        the list of projects  <-- add new projects here
  js/scenes.js          3D scenes (hero, showroom, room transformation, concept renders)
  js/textures.js        procedural textures for the 3D scenes and material library
  js/images.js          map of photo names to files in assets/img
  img/                  project photographs
```

## Run it on your computer

Double-click `index.html`, or for a more accurate test run from this folder:

```
python -m http.server 8000
```
then open http://localhost:8000

## Edit content

Open `assets/js/app.js`. Everything editable is at the top:

- `CONFIG.contact`  phone numbers, WhatsApp, email, address, Instagram (`instagramUrl` makes it clickable)
- `CONFIG.about`    company story, founder, experience, project count, service area
- `CONFIG.stats`    animated numbers ("Happy clients" is still a placeholder)
- `CONFIG.testimonials`  placeholders, replace with genuine reviews
- `CONFIG.formEmail`  where the contact form sends mail (see "Contact form" below)

## Add a new project

1. Upload the photos to `assets/img/` (GitHub: open the folder > Add file > Upload files).
2. Open `assets/js/projects.js`, copy an existing block, paste it after the last one and change the text.
   Use the file path as the photo name, for example `img:'assets/img/my-new-project.jpg'` and
   `gallery:['assets/img/my-new-project.jpg','assets/img/my-new-project-2.jpg']`.
3. Commit the change. The live site updates in about a minute.

Categories that appear in the filter: Residential, Commercial, Office, Luxury Interiors, Modular Kitchen, Bedroom, Living Room (put any of these in `cats`).

Photo tips: keep each photo under about 300 KB (max 1600 px wide) so the site stays fast, avoid photos where people are visible, and get the client's permission before publishing photos of their home.

## Put it on GitHub

1. Install Git (https://git-scm.com) and create a free GitHub account.
2. On GitHub click **New repository**. Name it (for example `solvexsolution-website`), leave it empty (no README), click **Create**.
3. In this folder open a terminal (Windows: right-click > Open in Terminal) and run:

```
git init
git add .
git commit -m "Initial website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/solvexsolution-website.git
git push -u origin main
```

## Publish it (free options)

**GitHub Pages**
1. Repository > **Settings** > **Pages**.
2. Source: **Deploy from a branch**. Branch: **main**, folder: **/ (root)**. Save.
3. After about a minute the site is live at `https://YOUR-USERNAME.github.io/solvexsolution-website/`.

**Netlify, Vercel or Cloudflare Pages** (automatic redeploys on every push)
1. Sign in with GitHub and choose **Add new site / Import project** and pick the repository.
2. Build command: leave empty. Publish / output directory: `.` (the root).
3. Deploy. Each `git push` republishes the site.

**Custom domain**: add the domain in your host's dashboard (GitHub Pages: Settings > Pages > Custom domain) and point the DNS records it shows.

## Update the site later

```
git add .
git commit -m "Describe what you changed"
git push
```

## Contact form

Right now the form opens the visitor's email app addressed to `CONFIG.formEmail`. To send to an inbox or Google Sheet without the visitor's email app, connect a form service (Netlify Forms, Formspree, or a Google Apps Script web app) and post the form data to it from the submit handler in `assets/js/app.js` (search for `formEmail`).

## Notes

- 3D uses three.js r128 loaded from cdnjs. If it fails to load, or a device cannot run WebGL, the site falls back to photographs automatically.
- "3D concept" project cards and the before/after slider are generated in the browser. Replace them with real photographs when available (`CONFIG.beforeAfter`).
- Google Fonts (Jost, Newsreader) load from Google. Text falls back to system fonts if they cannot load.
