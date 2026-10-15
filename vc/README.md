# Volunteer Connect (React + Laravel)

Folder layout: `frontend/` (React + Vite) and `backend/` (Laravel files to copy into a fresh Laravel project).

## 1. Backend (Laravel 11 or 12, PHP 8.2+)
```bash
composer create-project laravel/laravel volunteer-connect-api
cd volunteer-connect-api
php artisan install:api          # installs Sanctum + routes/api.php
```
Copy the contents of `backend/` into `volunteer-connect-api/`, overwriting:
`app/Models/*`, `app/Http/Controllers/*`, `routes/api.php`, `database/migrations/*`, `database/seeders/DatabaseSeeder.php`, and `Dockerfile`.

Edit `.env` (SQLite is the easiest locally; the default `DB_CONNECTION=sqlite` already works), then:
```bash
php artisan migrate --seed
php artisan serve                # http://localhost:8000
```
Demo logins (password `password123`): `org@demo.com` and `volunteer@demo.com`.
Test an endpoint: `GET http://localhost:8000/api/opportunities` (use Postman or Thunder Client in VS Code).

## 2. Frontend
```bash
cd frontend
copy .env.example .env           # (macOS/Linux: cp)
npm install
npm run dev                      # http://localhost:5173
```

## 3. Deploy
**Backend on Render** (Docker web service + free PostgreSQL):
1. Push the Laravel project to GitHub (it must include the `Dockerfile`).
2. Render: New > PostgreSQL, then New > Web Service > connect repo > Runtime: Docker.
3. Environment variables: `APP_KEY` (run `php artisan key:generate --show` locally), `APP_ENV=production`, `APP_DEBUG=false`, `DB_CONNECTION=pgsql`, `DB_URL` = the database's Internal URL.
4. After the first deploy, open the service Shell and run `php artisan db:seed --force` (optional demo data).

**Frontend on Netlify**: connect the repo, base directory `frontend`, build `npm run build`, publish `dist`, and set `VITE_API_URL=https://YOUR-SERVICE.onrender.com/api`. `public/_redirects` makes React Router work on refresh.

Tokens are sent as `Authorization: Bearer` headers, so no cookie or CORS-credentials setup is needed. Render's free tier sleeps, so the first request can be slow.

## UI notes
- Design tokens live at the top of `frontend/src/index.css` (colors, radius, shadows). Change `--pri` / `--acc` to re-theme the whole app.
- Light/dark mode follows the system and can be toggled from the header (saved in `localStorage`).
- Category colors and icons are defined once in `components/OppCard.jsx` (`CAT`).
- The "Try a demo account" buttons on the login page use the seeded demo logins; delete that block in `pages/Auth.jsx` before a real launch.

## Added frontend improvements
- **Saved opportunities**: bookmark any opportunity card and find it later at `/saved`. The shortlist is stored in the current browser's local storage, so it does not require a database migration. Saved items are browser-specific and are not synced across devices.
- **About / How it works page**: visit `/about` for a clearer introduction to Volunteer Connect, the volunteer journey, and the platform's goals.
- Added quick links to these pages in the navigation/footer and responsive styling for the new screens.

## Database credential safety
Do not commit a real `.env` file or database password into a ZIP/Git repository. For Render, configure `DB_CONNECTION=pgsql` and the database connection values in the web service's Environment settings. Use the complete Render Internal Database URL in `DB_URL` for services in the same Render region. Keep `.env.example` as a template only.


## Enhanced features added
- In-app notifications for volunteer sign-ups and verified hours.
- Public organization profile pages linked from opportunity details.
- Reviews and 1–5 star feedback after a volunteer's signup is marked completed.
- Attendance and volunteer-hour verification remains available to the owning organization; confirmations now notify the volunteer.
- Administrator console for platform overview and opportunity moderation.

### Database update
Run `php artisan migrate` in the Laravel backend after setting the environment variables. This creates the notifications and reviews tables. Existing admin accounts must be assigned `role=admin` manually by a trusted database administrator; public registration intentionally does not allow admin role selection.


## Added features (October 2026)
- In-app notifications for volunteer sign-ups and verified volunteer hours.
- Public organization profile pages, with current opportunities and links to the organization website. Organizations can edit bio, location, and website in My Profile.
- Star ratings and written feedback available to volunteers after the organization verifies their attendance. One review per volunteer per activity; it can be updated.
- Attendance and hour verification remains available to the organization that owns the activity; successful confirmations notify the volunteer.
- Administrator console for platform metrics and opportunity moderation (publish/unpublish/remove).

### Database update required
After configuring the Laravel environment, run `php artisan migrate` from the backend directory. This creates the `notifications` and `reviews` tables.

### Admin account setup
Public registration deliberately does not permit administrator accounts. To grant admin access, assign `role = 'admin'` to a trusted existing user directly in the database. Then log in and open `/admin`. The admin API independently checks the role on every request.

### Notes
- The ZIP does not contain live database passwords or a production `.env` file. Keep secrets in Render environment settings.
- These features are code changes and have not been tested against your live Render database. Run migrations and test sign-up, notifications, attendance confirmation, reviews, and admin moderation after deployment.
