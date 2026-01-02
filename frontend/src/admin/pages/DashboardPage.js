import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
    Users,
    MessageSquare,
    Briefcase,
    FileText,
    Bell,
    GraduationCap,
    ArrowUpRight
} from "lucide-react";

const DashboardPage = () => {
    const [stats, setStats] = useState({
        earlyAccess: 0,
        messages: 0,
        unansweredMessages: 0,
        internships: 0,
        newInternships: 0,
        activeJobs: 0,
        totalJobs: 0,
        jobApplications: 0,
        newJobApplications: 0,
        jobAlerts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Parallel fetching for performance
                const [
                    earlyAccess,
                    messages,
                    newMessages,
                    internships,
                    newInternships,
                    jobs,
                    activeJobs,
                    jobApps,
                    newJobApps,
                    alerts
                ] = await Promise.all([
                    // 1. Early Access
                    supabase.from("early_access_signups").select("*", { count: "exact", head: true }),

                    // 2. Messages
                    supabase.from("contact_messages").select("*", { count: "exact", head: true }),
                    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "New"),

                    // 3. Internship Applications
                    supabase.from("internship_applications").select("*", { count: "exact", head: true }),
                    supabase.from("internship_applications").select("*", { count: "exact", head: true }).eq("status", "New"),

                    // 4. Job Postings
                    supabase.from("job_postings").select("*", { count: "exact", head: true }),
                    supabase.from("job_postings").select("*", { count: "exact", head: true }).eq("status", "Open"),

                    // 5. Job Applications
                    supabase.from("job_applications").select("*", { count: "exact", head: true }),
                    supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("status", "New"),

                    // 6. Job Alerts
                    supabase.from("job_alerts").select("*", { count: "exact", head: true })
                ]);

                setStats({
                    earlyAccess: earlyAccess.count || 0,
                    messages: messages.count || 0,
                    unansweredMessages: newMessages.count || 0,
                    internships: internships.count || 0,
                    newInternships: newInternships.count || 0,
                    totalJobs: jobs.count || 0,
                    activeJobs: activeJobs.count || 0,
                    jobApplications: jobApps.count || 0,
                    newJobApplications: newJobApps.count || 0,
                    jobAlerts: alerts.count || 0
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, subValue, icon: Icon, colorClass }) => (
        <div className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-lg ${colorClass} bg-opacity-10`}>
                        <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="truncate text-sm font-medium text-slate-500">
                                {title}
                            </dt>
                            <dd>
                                <div className="text-2xl font-semibold text-slate-900">
                                    {value}
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            {subValue && (
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
                    <div className="text-sm font-medium text-slate-600 flex items-center">
                        {subValue}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-sm text-slate-500 mt-1">Real-time metrics and site activity.</p>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Early Access */}
                <StatCard
                    title="Early Access Signups"
                    value={stats.earlyAccess}
                    icon={Users}
                    colorClass="bg-blue-500 text-blue-500"
                    subValue={<span>Total accumulated leads</span>}
                />

                {/* Messages */}
                <StatCard
                    title="Contact Messages"
                    value={stats.messages}
                    icon={MessageSquare}
                    colorClass="bg-indigo-500 text-indigo-500"
                    subValue={
                        <span className={stats.unansweredMessages > 0 ? "text-orange-600" : "text-green-600"}>
                            {stats.unansweredMessages} New Unread
                        </span>
                    }
                />

                {/* Internships */}
                <StatCard
                    title="Internship Applications"
                    value={stats.internships}
                    icon={GraduationCap}
                    colorClass="bg-purple-500 text-purple-500"
                    subValue={
                        <span className={stats.newInternships > 0 ? "text-purple-600" : "text-slate-500"}>
                            {stats.newInternships} Pending Review
                        </span>
                    }
                />

                {/* Job Postings */}
                <StatCard
                    title="Job Postings"
                    value={stats.totalJobs}
                    icon={Briefcase}
                    colorClass="bg-slate-700 text-slate-700"
                    subValue={
                        <span className="text-green-600">
                            {stats.activeJobs} Active Listings
                        </span>
                    }
                />

                {/* Job Applications */}
                <StatCard
                    title="Job Applicants"
                    value={stats.jobApplications}
                    icon={FileText}
                    colorClass="bg-orange-500 text-orange-500"
                    subValue={
                        <span className={stats.newJobApplications > 0 ? "text-orange-600" : "text-slate-500"}>
                            {stats.newJobApplications} New Applications
                        </span>
                    }
                />

                {/* Job Alerts */}
                <StatCard
                    title="Job Alert Subscribers"
                    value={stats.jobAlerts}
                    icon={Bell}
                    colorClass="bg-pink-500 text-pink-500"
                    subValue={<span>Waiting for next opening</span>}
                />
            </div>

        </div>
    );
};

export default DashboardPage;
