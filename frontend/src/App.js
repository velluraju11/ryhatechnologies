import React, { Suspense, lazy } from "react";
import "@/App.css";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";

const AdminApp = lazy(() => import("@/admin/AdminApp"));
import FAQPage from "@/pages/FAQPage"; // Create if not exported from RyhaPages yet, or update RyhaPages to export it. For now direct import.
import {
  AboutPage,
  ContactPage,
  HomePage,
  LegalDisclosurePage,
  MissionPage,
  PrivacyPage,
  ProductsPage,
  TermsPage,
} from "@/pages/RyhaPages";

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
                  <Route path="/" element={<HomePage />} />
                  <Route path="/mission" element={<MissionPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />

                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/legal" element={<LegalDisclosurePage />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </SiteLayout>
            }
          />
        </Routes>

      </BrowserRouter>
    </div >
  );
}

export default App;
