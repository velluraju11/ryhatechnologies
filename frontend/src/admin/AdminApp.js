import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import LoginPage from "./pages/LoginPage";

// Lazy load pages
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const EarlyAccessPage = lazy(() => import("./pages/EarlyAccessPage"));
const ContactMessagesPage = lazy(() => import("./pages/ContactPage"));
const ContentPage = lazy(() => import("./pages/ContentPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const InternshipApplicationsPage = lazy(() => import("./pages/InternshipPage"));
const JobsPage = lazy(() => import("./pages/AdminJobsPage"));
const JobApplicationsPage = lazy(() => import("./pages/AdminJobApplicationsPage"));
const JobAlertsPage = lazy(() => import("./pages/AdminJobAlertsPage"));

const AdminApp = () => {
    return (
        <Routes>
            <Route path="login" element={<LoginPage />} />

            <Route path="/" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route
                    path="dashboard"
                    element={
                        <Suspense fallback={<div>Loading...</div>}>
                            <DashboardPage />
                        </Suspense>
                    }
                />
                <Route
                    path="early-access"
                    element={
                        <Suspense fallback={<div>Loading...</div>}>
                            <EarlyAccessPage />
                        </Suspense>
                    }
                />
                <Route
                    path="messages"
                    element={
                        <Suspense fallback={<div>Loading...</div>}>
                            <ContactMessagesPage />
                        </Suspense>
                    }
                />
                <Route
                    path="content"
                    element={
                        <Suspense fallback={<div>Loading...</div>}>
                            <ContentPage />
                        </Suspense>
                    }
                />
                <Route
                    path="faq"
                    element={
                        <Suspense fallback={<div>Loading...</div>}>
                            <FAQPage />
                        </Suspense>
                    }
                />
                <Route
                    path="internships"
                    element={
                        <Suspense fallback={<div>Loading...</div>}>
                            <InternshipApplicationsPage />
                        </Suspense>
                    }
                />
                <Route
                    path="jobs"
                    element={
                        <Suspense fallback={<div>Loading...</div>}>
                            <JobsPage />
                        </Suspense>
                    }
                />
                <Route
                    path="applications"
                    element={
                        <Suspense fallback={<div>Loading...</div>}>
                            <JobApplicationsPage />
                        </Suspense>
                    }
                />
                <Route
                    path="alerts"
                    element={
                        <Suspense fallback={<div>Loading...</div>}>
                            <JobAlertsPage />
                        </Suspense>
                    }
                />
            </Route>

            <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
    );
};

export default AdminApp;
