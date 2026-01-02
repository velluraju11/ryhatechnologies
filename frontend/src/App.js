import React, { Suspense, lazy } from "react";
import "@/App.css";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";

const AdminApp = lazy(() => import("@/admin/AdminApp"));

import NotFoundPage from "@/pages/NotFoundPage";
import FAQPage from "@/pages/FAQPage";
import InternshipPage from "@/pages/InternshipPage";
import CareersPage from "@/pages/CareersPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";

import {
  HomePage,
  AboutPage,
  ContactPage,
  MissionPage,
  ProductsPage,
  LegalDisclosurePage,
  LegalPage,
  PrivacyPage,
  TermsPage
} from "./pages/RyhaPages";

import { Capacitor } from "@capacitor/core";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Admin Routes - Isolated and High Priority */}
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div>Loading admin...</div>}>
                <AdminApp />
              </Suspense>
            }
          />

          {/* Public Routes - Wrapped in SiteLayout */}
          <Route
            path="*"
            element={
              <SiteLayout>
                <Routes>
                  <Route
                    path="/"
                    element={
                      Capacitor.isNativePlatform() ? <Navigate to="/admin" replace /> : <HomePage />
                    }
                  />
                  <Route path="/mission" element={<MissionPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/internships" element={<InternshipPage />} />
                  <Route path="/careers" element={<CareersPage />} />

                  {/* Blog Routes */}
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />

                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/legal" element={<LegalDisclosurePage />} />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </SiteLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
