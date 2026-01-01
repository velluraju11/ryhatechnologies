import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const DashboardPage = () => {
    const [stats, setStats] = useState({
        earlyAccess: 0,
        messages: 0,
        newEarlyAccess: 0,
        newMessages: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            // Early Access Stats
            const { count: eaCount } = await supabase
                .from("early_access_signups")
                .select("*", { count: "exact", head: true });

            const { count: eaNewCount } = await supabase
                .from("early_access_signups")
                .select("*", { count: "exact", head: true })
                .eq("status", "New");

            // Messages Stats
            const { count: msgCount } = await supabase
                .from("contact_messages")
                .select("*", { count: "exact", head: true });

            const { count: msgNewCount } = await supabase
                .from("contact_messages")
                .select("*", { count: "exact", head: true })
                .eq("status", "New");

            setStats({
                earlyAccess: eaCount || 0,
                messages: msgCount || 0,
                newEarlyAccess: eaNewCount || 0,
                newMessages: msgNewCount || 0,
            });
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">Overview of site activity</p>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Card 1 */}
                <div className="overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-slate-500">
                                        Total Early Access
                                    </dt>
                                    <dd>
                                        <div className="text-lg font-medium text-slate-900">
                                            {stats.earlyAccess}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-5 py-3">
                        <div className="text-sm">
                            <span className="font-medium text-slate-900">
                                {stats.newEarlyAccess}
                            </span>{" "}
                            <span className="text-slate-500">New signups</span>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-2xl">📩</span>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-slate-500">
                                        Total Messages
                                    </dt>
                                    <dd>
                                        <div className="text-lg font-medium text-slate-900">
                                            {stats.messages}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-5 py-3">
                        <div className="text-sm">
                            <span className="font-medium text-slate-900">
                                {stats.newMessages}
                            </span>{" "}
                            <span className="text-slate-500">New messages</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
