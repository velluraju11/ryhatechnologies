import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, Download, Search, FileText, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from 'date-fns';

export default function AdminJobApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [selectedApp, setSelectedApp] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (error) {
            toast.error("Failed to fetch applications");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('job_applications')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
            if (selectedApp && selectedApp.id === id) {
                setSelectedApp(prev => ({ ...prev, status: newStatus }));
            }
            toast.success("Status updated");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this application?")) return;
        try {
            const { error } = await supabase.from('job_applications').delete().eq('id', id);
            if (error) throw error;
            setApplications(prev => prev.filter(app => app.id !== id));
            if (selectedApp && selectedApp.id === id) {
                setSelectedApp(null);
                setIsDetailOpen(false);
            }
            toast.success("Application deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete application");
        }
    };

    const filteredApps = applications.filter(app => {
        const matchesSearch =
            app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.job_title.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === "All" || app.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const openDetails = (app) => {
        setSelectedApp(app);
        setIsDetailOpen(true);
    };

    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedApps = [...filteredApps].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-slate-400" />;
        if (sortConfig.direction === 'asc') return <ArrowUp className="ml-2 h-4 w-4 text-slate-900" />;
        return <ArrowDown className="ml-2 h-4 w-4 text-slate-900" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Applications</h1>
                    <p className="text-slate-500 text-sm mt-1">Review candidates and manage hiring pipeline.</p>
                </div>
                <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px] bg-white border-slate-300 text-slate-700"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-md">
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Reviewed">Reviewed</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Hired">Hired</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search applicants..."
                    className="pl-10 bg-white border-slate-300 text-slate-900 focus:ring-slate-900 max-w-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-slate-200 hover:bg-slate-50">
                                <TableHead onClick={() => handleSort('full_name')} className="cursor-pointer text-slate-500 font-medium hover:text-slate-900">
                                    <div className="flex items-center">Candidate <SortIcon column="full_name" /></div>
                                </TableHead>
                                <TableHead onClick={() => handleSort('job_title')} className="cursor-pointer text-slate-500 font-medium hover:text-slate-900">
                                    <div className="flex items-center">Role Applied <SortIcon column="job_title" /></div>
                                </TableHead>
                                <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer text-slate-500 font-medium hover:text-slate-900">
                                    <div className="flex items-center">Applied Date <SortIcon column="created_at" /></div>
                                </TableHead>
                                <TableHead onClick={() => handleSort('status')} className="cursor-pointer text-slate-500 font-medium hover:text-slate-900">
                                    <div className="flex items-center">Status <SortIcon column="status" /></div>
                                </TableHead>
                                <TableHead className="text-slate-500 font-medium text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedApps.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                                        No applications found matching your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedApps.map((app) => (
                                    <TableRow key={app.id} className="border-slate-100 hover:bg-slate-50/50">
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{app.full_name}</div>
                                            <div className="text-xs text-slate-500">{app.email}</div>
                                        </TableCell>
                                        <TableCell className="text-slate-700">{app.job_title}</TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {format(new Date(app.created_at), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`font-normal border-0
                                            ${app.status === 'New' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}
                                            ${app.status === 'Reviewed' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''}
                                            ${app.status === 'Interview' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : ''}
                                            ${app.status === 'Hired' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                                            ${app.status === 'Rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''}
                                         `}>
                                                {app.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => openDetails(app)} className="hover:bg-slate-100 text-slate-500 hover:text-slate-900">
                                                View Details
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)} className="hover:bg-red-50 text-slate-400 hover:text-red-600">
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

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Application Details</DialogTitle>
                    </DialogHeader>
                    {selectedApp && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                                    <div className="font-medium text-lg text-slate-900">{selectedApp.full_name}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
                                    <div className="font-medium text-lg text-blue-600">{selectedApp.job_title}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                                    <div className="text-slate-700">{selectedApp.email}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
                                    <div className="text-slate-700">{selectedApp.phone}</div>
                                </div>
                            </div>

                            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
                                <label className="text-sm font-semibold text-slate-900 block">Update Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {['New', 'Reviewed', 'Interview', 'Hired', 'Rejected'].map(status => (
                                        <Button
                                            key={status}
                                            size="sm"
                                            variant={selectedApp.status === status ? "default" : "outline"}
                                            onClick={() => updateStatus(selectedApp.id, status)}
                                            className={selectedApp.status === status
                                                ? "bg-slate-900 text-white hover:bg-slate-800"
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }
                                        >
                                            {status}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900 block">Documents</label>
                                <div className="space-y-2">
                                    <a href={selectedApp.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors text-blue-600 font-medium text-sm">
                                        <FileText className="h-4 w-4" /> View Resume
                                    </a>
                                    {selectedApp.portfolio_url && (
                                        <a href={selectedApp.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors text-blue-600 font-medium text-sm">
                                            <ExternalLink className="h-4 w-4" /> View Portfolio / Link
                                        </a>
                                    )}
                                </div>
                            </div>

                            {selectedApp.cover_letter && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Cover Letter</label>
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {selectedApp.cover_letter}
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-slate-400 pt-4 border-t border-slate-100 text-right">
                                Applied on {format(new Date(selectedApp.created_at), 'PPP pp')} • ID: {selectedApp.id}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ExternalLink({ className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    )
}
