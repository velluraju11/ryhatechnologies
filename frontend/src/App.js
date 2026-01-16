import React, { Suspense, lazy } from "react";
import "@/App.css";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import { Loader2 } from "lucide-react";

// Admin App (Lazy Loaded)
const AdminApp = lazy(() => import("@/admin/AdminApp"));

// Pages (Lazy Loaded for Performance)
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const InternshipPage = lazy(() => import("@/pages/InternshipPage"));
const CareersPage = lazy(() => import("@/pages/CareersPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));

// RyhaPages (Lazy Loaded individually if they are exported as such, or we can lazy load the barrel file if possible, 
// but usually it's better to lazy load the components directly to tree-shake. 
// Assuming RyhaPages.jsx exports named components, we'll lazy import them from there or directly if we knew path.
// However, since RyhaPages.jsx is likely just a barrel, let's lazy load from there.)

// NOTE: Named exports with React.lazy is a bit tricky. 
// Standard pattern: const HomePage = lazy(() => import("./pages/RyhaPages").then(module => ({ default: module.HomePage })));
const HomePage = lazy(() => import("./pages/RyhaPages").then(module => ({ default: module.HomePage })));
const AboutPage = lazy(() => import("./pages/RyhaPages").then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import("./pages/RyhaPages").then(module => ({ default: module.ContactPage })));
const MissionPage = lazy(() => import("./pages/RyhaPages").then(module => ({ default: module.MissionPage })));
const ProductsPage = lazy(() => import("./pages/RyhaPages").then(module => ({ default: module.ProductsPage })));
const LegalDisclosurePage = lazy(() => import("./pages/RyhaPages").then(module => ({ default: module.LegalDisclosurePage })));
const LegalPage = lazy(() => import("./pages/RyhaPages").then(module => ({ default: module.LegalPage })));
const PrivacyPage = lazy(() => import("./pages/RyhaPages").then(module => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import("./pages/RyhaPages").then(module => ({ default: module.TermsPage })));

import { Capacitor } from "@capacitor/core";

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-black text-white">
    <Loader2 className="h-8 w-8 animate-spin text-white/50" />
  </div>
);

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Admin Routes - Isolated and High Priority */}
            <Route
              path="/admin/*"
              element={<AdminApp />}
            />

            {/* Public Routes - Wrapped in SiteLayout */}
            <Route
              path="*"
              element={
                <SiteLayout>
                  <Suspense fallback={<PageLoader />}>
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
                  </Suspense>
                </SiteLayout>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
