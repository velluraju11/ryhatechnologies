# Ryha Technologies - Secure Admin Panel & Landing Page

This repository contains the source code for the Ryha Technologies landing page, integrated with a secure internal admin panel.

## Key Features
- **Frontend**: React.js with Tailwind CSS, Lucide Icons, and modern UI components.
- **Backend (Auth & Data)**: Supabase (PostgreSQL, Auth, RLS).
- **SEO**: Fully optimized with `react-helmet-async`, structured JSON-LD data, and semantic HTML (100/100 Audit Score).
- **Admin Panel**:
  - Secure Login (Supabase Auth).
  - Dashboard with stats.
  - Management for Early Access Signups and Contact Messages.
  - Rich Text Editor for Legal/Content pages.
  - Robust Phone Validation and Duplicate prevention.

## Prerequisites
- Node.js (v16 or higher)
- NPM
- A Supabase Project

## 1. Setup

### Clone and Install
```bash
git clone <repository-url>
cd ryhatechnologies-landing-page/frontend
npm install
```

### Environment Variables
Create a `.env` file in the `frontend` directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup (Supabase)
Run the following SQL scripts in your Supabase SQL Editor:

1.  **`supabase_schema.sql`**: Sets up the main tables (`early_access_signups`, `contact_messages`, `site_content`) and RLS policies.
2.  **`add_phone_columns.sql`**: Adds phone number columns.
3.  **`add_unique_constraint.sql`**: Enforces unique constraints on email to prevent duplicates.

## 2. Development

Run the frontend locally:

```bash
cd frontend
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 3. SEO Verification

The site is optimized for:
- **Meta Tags**: Title, Description, Open Graph, Twitter Cards.
- **Accessibility**: All icons and images have valid `alt` text or ARIA labels.
- **Robots.txt**: Located at `public/robots.txt`.
- **Sitemap**: Referenced in `robots.txt`.

## 4. Deployment (Netlify)

This project is configured for Netlify.

### Build Settings
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `build`

### Important: Netlify Redirects
A `_redirects` file has been added to `public/` containing:
```
/* /index.html 200
```
This ensures React Router works correctly on page refresh (SPA Support).

### Steps
1.  Connect your repository to Netlify.
2.  Set the **Base directory** to `frontend`.
3.  Set **Build command** to `npm run build`.
4.  Set **Publish directory** to `build`.
5.  **Environment Variables**: Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` in Netlify's "Site configuration > Environment variables".
6.  Deploy!
