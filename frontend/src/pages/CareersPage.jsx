import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Briefcase, MapPin, Globe, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

// Local Container
function Container({ children, className = "", full = false }) {
    return (
        <div
            className={
                full
                    ? `w-full pl-6 pr-4 md:pl-16 md:pr-8 lg:pl-24 lg:pr-12 ${className}`
                    : `mx-auto w-full max-w-6xl px-4 md:px-6 ${className}`
            }
        >
            {children}
        </div>
    );
}

export default function CareersPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [alertStatus, setAlertStatus] = useState("idle"); // idle, submitting, success, error

    // Application Modal State
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicationForm, setApplicationForm] = useState({
        full_name: "",
        email: "",
        phone: "",
        resume_url: "",
        portfolio_url: "",
        cover_letter: "",
        agreed_to_terms: false
    });
    const [submittingApp, setSubmittingApp] = useState(false);
    const [appStatus, setAppStatus] = useState("idle");

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data, error } = await supabase
                .from('job_postings')
                .select('*')
                .eq('status', 'Open')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setAlertStatus("submitting");
        try {
            const { error } = await supabase
                .from('job_alerts')
                .insert([{ email }]);

            if (error) {
                if (error.code === '23505') { // Unique violation
                    setAlertStatus("already_subscribed");
                } else {
                    throw error;
                }
            } else {
                setAlertStatus("success");
                setEmail("");
            }
        } catch (err) {
            console.error(err);
            setAlertStatus("error");
        }
    };

    const handleAppChange = (e) => {
        const { name, value, type, checked } = e.target;
        setApplicationForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        if (!applicationForm.agreed_to_terms) {
            alert("You must agree to the terms before applying.");
            return;
        }

        setSubmittingApp(true);
        try {
            const { error } = await supabase
                .from('job_applications')
                .insert([{
                    job_id: selectedJob.id,
                    job_title: selectedJob.title,
                    ...applicationForm
                }]);

            if (error) throw error;
            setAppStatus("success");
            setTimeout(() => {
                setSelectedJob(null);
                setAppStatus("idle");
                setApplicationForm({
                    full_name: "",
                    email: "",
                    phone: "",
                    resume_url: "",
                    portfolio_url: "",
                    cover_letter: "",
                    agreed_to_terms: false
                });
            }, 3000);

        } catch (err) {
            console.error(err);
            setAppStatus("error");
        } finally {
            setSubmittingApp(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20">
            <SEO
                title="Careers | Ryha Technologies"
                description="Explore career opportunities at Ryha Technologies. Join us in building the future of AI and autonomous cybersecurity systems."
                keywords="Ryha Careers, AI Jobs, Tech Jobs, Cybersecurity Careers, Remote Jobs, Engineering Roles"
            />
            <Container>
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl font-bold tracking-tight">Careers at Ryha</h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Join us in building the future of technology. We are looking for passionate individuals to solve complex problems.
                    </p>
                </div>

                {jobs.length === 0 ? (
                    // NO JOBS VIEW
                    <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/10">
                            <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Briefcase className="h-8 w-8 text-white/40" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-3">No roles currently open</h2>
                            <p className="text-white/60 mb-8">
                                We don't have any open positions right now, but we are always growing.
                                Check back soon or leave your email to get notified immediately when a new role opens.
                            </p>

                            <form onSubmit={handleSubscribe} className="max-w-md mx-auto space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email address"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white/5 border-white/10 focus:border-white/30 text-white placeholder:text-white/30"
                                    />
                                    <Button type="submit" disabled={alertStatus === "submitting" || alertStatus === "success"} className="bg-white text-black hover:bg-white/90">
                                        {alertStatus === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Notify Me"}
                                    </Button>
                                </div>
                                {alertStatus === "success" && (
                                    <p className="text-green-400 text-sm flex items-center justify-center gap-2">
                                        <CheckCircle className="h-4 w-4" /> You're on the list! We'll verify and email you when positions open.
                                    </p>
                                )}
                                {alertStatus === "already_subscribed" && (
                                    <p className="text-yellow-400 text-sm flex items-center justify-center gap-2">
                                        <AlertCircle className="h-4 w-4" /> You are already subscribed.
                                    </p>
                                )}
                                {alertStatus === "error" && (
                                    <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
                                )}
                            </form>
                        </div>
                    </div>
                ) : (
                    // JOBS GRID VIEW
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {jobs.map((job) => (
                            <div key={job.id} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 transition-all flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{job.title}</h3>
                                    <div className="flex flex-wrap gap-3 text-xs text-white/50 mb-4">
                                        <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                                            {job.mode === 'Remote' ? <Globe className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                            {job.mode}
                                        </span>
                                        {job.location && <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">{job.location}</span>}
                                    </div>
                                    <p className="text-white/70 text-sm line-clamp-3">{job.short_description}</p>
                                </div>
                                <div className="mt-auto pt-6 border-t border-white/5">
                                    <Button onClick={() => setSelectedJob(job)} className="w-full bg-white text-black hover:bg-white/90 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
                                        View & Apply <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Container>

            {/* Application Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/10 p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white">Apply for {selectedJob.title}</h2>
                                <p className="text-sm text-white/50">{selectedJob.mode} • {selectedJob.location || "Global"}</p>
                            </div>
                            <button onClick={() => setSelectedJob(null)} className="text-white/50 hover:text-white transition-colors">✕</button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Job Details */}
                            <div className="prose prose-invert prose-sm max-w-none text-white/80">
                                <h3 className="text-white font-semibold mb-2">About the Role</h3>
                                <div className="whitespace-pre-wrap font-sans">{selectedJob.full_description}</div>

                                {selectedJob.requirements && (
                                    <>
                                        <h3 className="text-white font-semibold mt-6 mb-2">Requirements</h3>
                                        <div className="whitespace-pre-wrap font-sans">{selectedJob.requirements}</div>
                                    </>
                                )}
                            </div>

                            <hr className="border-white/10" />

                            {/* Application Form */}
                            {appStatus === "success" ? (
                                <div className="text-center py-12">
                                    <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Application Submitted!</h3>
                                    <p className="text-white/60">Thank you for applying. We will review your profile and get back to you shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={submitApplication} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input name="full_name" required value={applicationForm.full_name} onChange={handleAppChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input name="email" type="email" required value={applicationForm.email} onChange={handleAppChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <Input name="phone" type="tel" required value={applicationForm.phone} onChange={handleAppChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Resume (URL)</Label>
                                        <Input name="resume_url" required value={applicationForm.resume_url} onChange={handleAppChange} placeholder="Google Drive / LinkedIn / PDF Link" className="bg-white/5 border-white/10 focus:border-white/30" />
                                        <p className="text-xs text-white/40">Ensure link is publicly accessible.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Portfolio / GitHub URL (Optional)</Label>
                                        <Input name="portfolio_url" value={applicationForm.portfolio_url} onChange={handleAppChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Cover Letter / Note</Label>
                                        <Textarea name="cover_letter" value={applicationForm.cover_letter} onChange={handleAppChange} className="bg-white/5 border-white/10 focus:border-white/30 min-h-[100px]" placeholder="Why are you a good fit?" />
                                    </div>

                                    <div className="flex items-start gap-3 pt-2">
                                        <input
                                            type="checkbox"
                                            name="agreed_to_terms"
                                            checked={applicationForm.agreed_to_terms}
                                            onChange={handleAppChange}
                                            required
                                            id="terms"
                                            className="mt-1 h-4 w-4 bg-white/5 border-white/10 rounded"
                                        />
                                        <label htmlFor="terms" className="text-sm text-white/60">
                                            I verify that the information provided is accurate and I agree to Ryha Technologies' data privacy policy for potential employment.
                                        </label>
                                    </div>

                                    <div className="pt-4">
                                        <Button type="submit" disabled={submittingApp} className="w-full bg-white text-black hover:bg-white/90 h-10">
                                            {submittingApp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
