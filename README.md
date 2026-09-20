# GRAND Company Profile — Full Rebuild

This package is a fresh website/dashboard rebuild, not a patch of the previous page.

## Website
Open `index.html`.

## Dashboard
Open `/admin/`.
Login: `Grandcms` / `Grandcms2004`

## Supplied asset placement
- GRAND logo: `assets/brand/grand-logo.png` (supplied logo, used in the website header and footer)
- CEO photo: `assets/team/ceo.jpg`
- Client logos: `assets/clients/`
- Project images: `assets/projects/<project-id>/`

The supplied logo is included in the build. CEO, client and project image folders remain ready for additional original source assets when supplied.

## Brand direction
The website uses GRAND's profile direction: “We value what you have to say!”, established in 2004, with Event, Communication, Marketing and Supply as the four service pillars. The visual system uses a warm gold accent and a premium, experienced, execution-focused presentation.

## Social links
Facebook, LinkedIn, Instagram and WhatsApp are clickable. Replace the three generic social URLs in `index.html` with the actual GRAND profile URLs when supplied.

## Important CMS note
The dashboard supports up to 50 projects, project-wise title, client, discipline, date, detail and up to 20 image uploads per project. Existing projects can be edited or removed later. Opening a project on the public site shows a protected single-image lightbox with previous/next navigation; browser download and drag actions are deterred but screenshots cannot be fully prevented. Admins can select individual uploaded images as hero slides, with a maximum of 20 selected hero images. Published projects are stored in this browser and render on the main website. Client logos can also be added, renamed and removed from the dashboard and sync to the client wall. It also creates a social publish queue with official Facebook, Instagram and LinkedIn share entry points. Automatic posting to those networks requires their API credentials, OAuth permissions and a hosted backend; the browser-only build does not pretend to provide that server-side access.

## Supabase persistence
The site can load clients, projects and leadership from Supabase, with browser storage retained as a fallback. The project uses the public `assets` Storage bucket and the client configuration in `supabase/config.js`. Run `supabase/policies.sql` after creating an admin user in Supabase Auth. The dashboard accepts the Supabase user's email and password; the legacy local login remains available for local-only testing, but remote writes require an authenticated Supabase session.
