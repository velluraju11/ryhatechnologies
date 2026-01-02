# Ryha Technologies - Landing Page & Admin Panel

Enterprise-grade landing page and secure admin panel for Ryha Technologies, built with React, Tailwind CSS, and Supabase.

## 🚀 Deployment (Vercel) - Recommended

This project is optimized for deployment on **Vercel**.

1.  **Push to GitHub**: ensure your latest code is on GitHub.
2.  **Import to Vercel**:
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New...** -> **Project**.
    *   Import the `ryhain` repository.
3.  **Configure Project**:
    *   **Framework Preset**: `Create React App` (should auto-detect).
    *   **Root Directory**: Click "Edit" and select `frontend`. **(Crucial)**.
4.  **Environment Variables**:
    *   Add the following variables in the Vercel "Environment Variables" section:
        *   `REACT_APP_SUPABASE_URL`
        *   `REACT_APP_SUPABASE_ANON_KEY`
5.  **Deploy**: Click **Deploy**.

Your site will be live with automatic HTTPS and global CDN.

---

## 🛠 Development

### Prerequisites
*   Node.js (v18+)
*   Supabase Account

### Setup
1.  Navigate to `frontend`:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start local server:
    ```bash
    npm start
    ```

### Env Variables
Create a `.env` file in `frontend/`:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 Features

*   **Public Site**:
    *   High-performance Landing Page.
    *   Dynamic **FAQ Page** with Accordion & SEO Schema.
    *   Mission, Products, and Legal pages.
    *   Fully Responsive & SEO Optimized (100/100).
*   **Admin Panel** (`/admin`):
    *   Secure Login (Supabase Auth).
    *   **Dashboard**: Site overview.
    *   **Early Access**: Manage signups, export to CSV.
    *   **Messages**: View and reply to contact form submissions.
    *   **FAQ Manager**: Add, edit, delete, and reorder public FAQs.
    *   **Site Content**: CMS for Terms, Privacy, and Legal pages.

## 🗄 Database (Supabase)

Run the following SQL scripts in your Supabase SQL Editor to set up the backend:

1.  `supabase_schema.sql` (Base tables)
2.  `create_faq_table.sql` (FAQ feature)
3.  `add_phone_columns.sql` (Phone support)

## 🔍 SEO

*   Implemented with `react-helmet-async`.
*   Automatic JSON-LD Schema (`Organization`, `WebPage`, `FAQPage`).
*   Optimized Meta Tags (Open Graph, Twitter Cards).
