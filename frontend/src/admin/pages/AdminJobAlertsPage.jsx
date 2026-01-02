import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Mail, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from 'date-fns';

export default function AdminJobAlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const { data, error } = await supabase
                .from('job_alerts')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setAlerts(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load alerts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this email from alerts?")) return;
        try {
            const { error } = await supabase.from('job_alerts').delete().eq('id', id);
            if (error) throw error;
            toast.success("Subscriber removed");
            fetchAlerts();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 pb-5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Alerts Subscribers</h1>
                <p className="text-slate-500 text-sm mt-1">Users waiting for new job openings.</p>
            </div>

            <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden max-w-3xl">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-slate-200 hover:bg-slate-50">
                                <TableHead className="text-slate-500 font-medium">Email Address</TableHead>
                                <TableHead className="text-slate-500 font-medium">Subscribed Date</TableHead>
                                <TableHead className="text-slate-500 font-medium text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-slate-400">
                                        No subscribers yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                alerts.map((alert) => (
                                    <TableRow key={alert.id} className="border-slate-100 hover:bg-slate-50/50">
                                        <TableCell className="text-slate-900 font-medium flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                            {alert.email}
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {format(new Date(alert.created_at), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(alert.id)} className="hover:bg-red-50 text-slate-400 hover:text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
