import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function AdminLayout() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!loading && !session) {
            navigate("/admin/login");
        }
    }, [session, loading, navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/admin/login");
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading Access...</div>;
    }

    if (!session) {
        return null;
    }

    // Extracted Nav Content for reusability
    const NavContent = () => (
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                }
            >
                Dashboard
            </NavLink>
            <NavLink
                to="/admin/early-access"
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                }
            >
                Early Access
            </NavLink>
            <NavLink
                to="/admin/messages"
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                }
            >
                Messages
            </NavLink>
            <NavLink
                to="/admin/content"
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                }
            >
                Site Content
            </NavLink>
            <NavLink
                to="/admin/faq"
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                }
            >
                FAQ Manager
            </NavLink>
            <NavLink
                to="/admin/internships"
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                }
            >
                Internships
            </NavLink>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Blog
            </div>
            <NavLink
                to="/admin/blog"
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                }
            >
                Posts
            </NavLink>
            <NavLink
                to="/admin/comments"
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                }
            >
                Comments
            </NavLink>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Careers
            </div>
            <NavLink
                to="/admin/jobs"
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                }
            >
                Job Postings
            </NavLink>
            <NavLink
                to="/admin/applications"
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                }
            >
                Applicants
            </NavLink>
            <NavLink
                to="/admin/alerts"
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                }
            >
                Alerts
            </NavLink>
        </nav>
    );

    const UserProfile = () => (
        <div className="p-4 border-t border-slate-100 mt-auto">
            <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-xs font-semibold text-slate-400 truncate max-w-[120px]">
                    {session.user.email}
                </span>
            </div>
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
            >
                Sign out
            </button>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Desktop Sidebar (hidden on mobile) */}
            <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-lg font-bold tracking-tight text-slate-800">Ryha Admin</h1>
                    <p className="text-xs text-slate-500 mt-1">Internal Control</p>
                </div>
                <NavContent />
                <UserProfile />
            </aside>

            {/* Mobile Header (visible only on mobile) */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md">
                                <Menu className="h-6 w-6" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[80%] max-w-[300px] p-0 flex flex-col bg-white border-slate-200">
                            <div className="p-6 border-b border-slate-100">
                                <h1 className="text-lg font-bold tracking-tight text-slate-800">Ryha Admin</h1>
                                <p className="text-xs text-slate-500 mt-1">Mobile Access</p>
                            </div>
                            <NavContent />
                            <UserProfile />
                        </SheetContent>
                    </Sheet>
                    <span className="font-bold text-slate-800">Dashboard</span>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
