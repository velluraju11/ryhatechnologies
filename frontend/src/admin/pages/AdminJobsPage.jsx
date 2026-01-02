import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        short_description: "",
        full_description: "",
        requirements: "",
        mode: "Remote",
        location: "",
        status: "Open",
        is_active: true
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data, error } = await supabase
                .from('job_postings')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            toast.error("Failed to fetch jobs");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openCreateDialog = () => {
        setEditingJob(null);
        setFormData({
            title: "",
            short_description: "",
            full_description: "",
            requirements: "",
            mode: "Remote",
            location: "",
            status: "Open",
            is_active: true
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (job) => {
        setEditingJob(job);
        setFormData({
            title: job.title,
            short_description: job.short_description,
            full_description: job.full_description,
            requirements: job.requirements || "",
            mode: job.mode,
            location: job.location || "",
            status: job.status,
            is_active: job.is_active
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingJob) {
                const { error } = await supabase
                    .from('job_postings')
                    .update(formData)
                    .eq('id', editingJob.id);
                if (error) throw error;
                toast.success("Job updated successfully");
            } else {
                const { error } = await supabase
                    .from('job_postings')
                    .insert([formData]);
                if (error) throw error;
                toast.success("Job created successfully");
            }
            setIsDialogOpen(false);
            fetchJobs();
        } catch (error) {
            toast.error("Operation failed");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this job posting?")) return;
        try {
            const { error } = await supabase.from('job_postings').delete().eq('id', id);
            if (error) throw error;
            toast.success("Job deleted");
            fetchJobs();
        } catch (error) {
            toast.error("Delete failed");
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-slate-500 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Postings</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage open roles and descriptions.</p>
                </div>
                <Button onClick={openCreateDialog} className="bg-slate-900 text-white hover:bg-slate-800">
                    <Plus className="mr-2 h-4 w-4" /> Create New Job
                </Button>
            </div>

            <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 border-slate-200 hover:bg-slate-50">
                            <TableHead className="text-slate-500 font-medium">Title</TableHead>
                            <TableHead className="text-slate-500 font-medium">Mode</TableHead>
                            <TableHead className="text-slate-500 font-medium">Status</TableHead>
                            <TableHead className="text-slate-500 font-medium text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                                    No job postings found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => (
                                <TableRow key={job.id} className="border-slate-100 hover:bg-slate-50/50">
                                    <TableCell className="font-medium text-slate-900">{job.title}</TableCell>
                                    <TableCell className="text-slate-600">
                                        <Badge variant="outline" className="border-slate-200 text-slate-600 font-normal">
                                            {job.mode}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`font-normal ${job.status === 'Open'
                                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                : "bg-red-100 text-red-700 hover:bg-red-100"
                                            }`}>
                                            {job.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(job)} className="hover:bg-slate-100 text-slate-500 hover:text-slate-900">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)} className="hover:bg-red-50 text-slate-400 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-lg shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-slate-900">
                            {editingJob ? "Edit Job Posting" : "Create New Job Posting"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5 py-4">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Job Title</Label>
                                <Input name="title" value={formData.title} onChange={handleInputChange} required className="bg-white border-slate-300 text-slate-900 focus:ring-slate-900" placeholder="e.g. Senior Frontend Engineer" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Mode</Label>
                                <Select value={formData.mode} onValueChange={(val) => handleSelectChange('mode', val)}>
                                    <SelectTrigger className="bg-white border-slate-300 text-slate-900"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 shadow-md">
                                        <SelectItem value="Remote">Remote</SelectItem>
                                        <SelectItem value="On-site">On-site</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Location</Label>
                                <Input name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. New York or Global" className="bg-white border-slate-300 text-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Status</Label>
                                <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                                    <SelectTrigger className="bg-white border-slate-300 text-slate-900"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 shadow-md">
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">Short Description (Card View)</Label>
                            <Textarea name="short_description" value={formData.short_description} onChange={handleInputChange} required className="bg-white border-slate-300 text-slate-900 h-20 resize-none" placeholder="Brief summary shown on the main careers page." />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">Full Description (Markdown supported)</Label>
                            <Textarea name="full_description" value={formData.full_description} onChange={handleInputChange} required className="bg-white border-slate-300 text-slate-900 h-40 font-mono text-sm" placeholder="Detailed role description..." />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">Requirements</Label>
                            <Textarea name="requirements" value={formData.requirements} onChange={handleInputChange} placeholder="- 3+ years React experience..." className="bg-white border-slate-300 text-slate-900 h-32 font-mono text-sm" />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</Button>
                            <Button type="submit" disabled={submitting} className="bg-slate-900 text-white hover:bg-slate-800">
                                {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : (editingJob ? "Update Job" : "Create Job")}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
