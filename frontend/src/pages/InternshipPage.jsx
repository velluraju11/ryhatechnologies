import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import SEO from "../components/SEO";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Local Container (reused pattern)
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

function Section({ children, className = "" }) {
    return <section className={`py-16 md:py-24 ${className}`}>{children}</section>;
}

export default function InternshipPage() {
    const [step, setStep] = useState(1); // 1: Intro, 2: Selection, 3: Form
    const [selectedLayer, setSelectedLayer] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        domain: "",
        resume_url: "",
        // Layer 1
        current_role: "",
        motivation: "",
        // Layer 2
        experience_summary: "",
        project_urls: [""],
        docs_url: "",
        // Layer 3
        skill_level: "",
        self_assessment: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProjectUrlChange = (index, value) => {
        const newUrls = [...formData.project_urls];
        newUrls[index] = value;
        setFormData((prev) => ({ ...prev, project_urls: newUrls }));
    };

    const addProjectUrl = () => {
        setFormData((prev) => ({ ...prev, project_urls: [...prev.project_urls, ""] }));
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { error } = await supabase.from("internship_applications").insert([
                {
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    layer: selectedLayer,
                    domain: formData.domain,
                    resume_url: formData.resume_url,
                    // Layer Specifics
                    candidate_status: selectedLayer === "Layer 1" ? formData.current_role : null,
                    motivation: selectedLayer === "Layer 1" ? formData.motivation : null,
                    experience_summary:
                        selectedLayer === "Layer 2" ? formData.experience_summary : null,
                    skill_level: selectedLayer === "Layer 3" ? formData.skill_level : null,
                    self_assessment:
                        selectedLayer === "Layer 3" ? formData.self_assessment : null,
                    project_urls:
                        selectedLayer !== "Layer 1" ? formData.project_urls.filter((u) => u) : null,
                    docs_url: selectedLayer !== "Layer 1" ? formData.docs_url : null,
                    status: "New",
                },
            ]);

            if (error) throw error;
            setSuccess(true);
            toast.success("Application Submitted Successfully!");
        } catch (error) {
            console.error("Error submitting application:", error);
            toast.error("Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen pt-32 pb-20 bg-black text-white">
                <Container>
                    <div className="max-w-xl mx-auto text-center space-y-6">
                        <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
                        <h1 className="text-4xl font-bold">Applied Successfully</h1>
                        <p className="text-xl text-white/60">
                            Our team will email you soon regarding the next steps.
                        </p>
                        <Link to="/">
                            <Button variant="outline" className="mt-8 border-white/20 text-white hover:bg-white/10">
                                Return Home
                            </Button>
                        </Link>
                    </div>
                </Container>
            </div>
        );
    }

    // STEP 1: INTRO CONTENT
    if (step === 1) {
        return (
            <>
                <SEO
                    title="Internship Program | Ryha Technologies"
                    description="Join the Ryha Technologies Internship Program. A structured, three-layered pathway into real-world AI and engineering. Apply for Layer 1, 2, or 3."
                    keywords="Ryha Internship, AI Internship, Engineering Internship, Remote Internship, Layer 1 2 3 Internship, Tech Careers"
                />
                <div className="min-h-screen pt-32 pb-20 bg-black text-white">
                    <Container>
                        <div className="max-w-4xl mx-auto space-y-12">
                            <div className="space-y-6">
                                <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                                    Ryha Technologies Internship Program
                                </h1>
                                <p className="text-2xl text-white/80">
                                    A structured, three-layered pathway into real-world engineering
                                </p>
                                <div className="h-1 w-20 bg-blue-500/50 rounded-full" />
                            </div>

                            <div className="space-y-6 text-lg text-white/70 leading-relaxed">
                                <p>
                                    The Ryha Technologies Internship Program is designed for individuals who want
                                    to learn deeply, build independently, and earn progression through performance.
                                </p>
                                <ul className="space-y-2 border-l-2 border-white/10 pl-6 my-6">
                                    <li className="text-white/90 font-medium">This is not a time-pass internship.</li>
                                    <li className="text-white/90 font-medium">This is not certificate-first.</li>
                                    <li className="text-white/90 font-medium">
                                        This is a performance-driven engineering evaluation system.
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-8">
                                <h2 className="text-3xl font-bold text-white">Program Structure — Three Layers</h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {[
                                        { title: "Foundation Internship", desc: "Learning & Evaluation" },
                                        { title: "Advanced Internship", desc: "Merit-Based, No Cost" },
                                        { title: "Core Project Internship", desc: "Stipend-Based" },
                                    ].map((layer, i) => (
                                        <div
                                            key={i}
                                            className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
                                        >
                                            <h3 className="text-xl font-bold mb-2">{layer.title}</h3>
                                            <p className="text-white/60">{layer.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-white/60 italic">
                                    Every applicant begins at Layer 1, unless eligible for direct evaluation.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-white">
                                    Field-Based Learning Model (Applies to All Interns)
                                </h2>
                                <p className="text-white/70">
                                    Each intern selects one primary field of internship, such as:
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        "Cybersecurity",
                                        "AI / Machine Learning",
                                        "Backend / Systems Engineering",
                                        "Automation",
                                        "Research & Development",
                                        "Other approved technical domains",
                                    ].map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-white/60 text-sm">
                                    All learning, tasks, and projects are aligned to the selected field.
                                </p>
                            </div>

                            {/* Layer 1 Details */}
                            <div className="space-y-6 p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors">
                                <h2 className="text-3xl font-bold text-white">Layer 1 — Foundation Internship</h2>
                                <p className="text-xl text-white/80">Entry-Level | Learning + Evaluation</p>
                                <ul className="space-y-2 text-white/70">
                                    <li><strong>Mode:</strong> Remote</li>
                                    <li>Fee: ₹2,499 (one-time)</li>
                                    <li>Duration: Flexible, milestone-based</li>
                                    <li>
                                        Purpose: To assess learning discipline, fundamentals, and project execution ability
                                    </li>
                                    <li className="text-white/90 font-medium pt-2">
                                        Note: An interview will be conducted to assess your knowledge and skills. If you are selected, a payment link will be sent to your registered email address to complete the fee payment. All further details will be shared via email.
                                    </li>
                                </ul>

                                <h3 className="text-xl font-semibold mt-6 text-white">Learning Phases</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-white">🔹 Weeks 1–2 — Foundational Learning</h4>
                                        <p className="text-sm text-white/60 mt-1">Core concepts, Fundamental tools, workflows. This phase builds strong foundations required for real project work.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">🔹 Weeks 3–4 — Advanced Fundamentals</h4>
                                        <p className="text-sm text-white/60 mt-1">Advanced fundamentals, Practical application, Structured thinking. Prepares for intermediate-level project execution.</p>
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold mt-6 text-white">Project Milestones (Mandatory)</h3>
                                <div className="grid md:grid-cols-3 gap-4 text-sm">
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="h-3 w-3 rounded-full bg-white mb-2"></div>
                                        <strong className="block text-white mb-1">Basic Project</strong>
                                        <span className="text-white/50">End of Week 2. Simple, functional, original.</span>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="h-3 w-3 rounded-full bg-white/80 mb-2"></div>
                                        <strong className="block text-white mb-1">Intermediate Project</strong>
                                        <span className="text-white/50">End of Week 4. Deeper logic, structure.</span>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="h-3 w-3 rounded-full bg-white/60 mb-2"></div>
                                        <strong className="block text-white mb-1">Advanced Project</strong>
                                        <span className="text-white/50">Post Internship. High-level, original.</span>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-4 rounded-lg mt-4 border border-white/10">
                                    <h4 className="font-semibold text-white mb-2">Completion Outcome</h4>
                                    <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                                        <li>Foundation Internship Certificate is issued</li>
                                        <li>Performance is internally evaluated</li>
                                        <li>Candidate becomes eligible for Layer 2 selection</li>
                                    </ul>
                                    <p className="text-xs text-white/40 mt-2">* Completion does not guarantee advancement. Selection is merit-based.</p>
                                </div>
                            </div>


                            {/* Layer 2 Details */}
                            <div className="space-y-6 p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors">
                                <h2 className="text-3xl font-bold text-white">Layer 2 — Advanced Internship (Merit-Based)</h2>
                                <p className="text-xl text-white/80">Fee: No payment required</p>
                                <ul className="space-y-2 text-white/70">
                                    <li><strong>Mode:</strong> Remote</li>
                                    <li>Selection: Based on Layer 1 performance or verified prior experience.</li>
                                    <li className="text-white/90 font-medium pt-2">
                                        Note: A technical interview and project review will be conducted to assess your prior knowledge and experience before selection.
                                    </li>
                                </ul>

                                <h3 className="text-xl font-semibold mt-4 text-white">Learning & Work Model</h3>
                                <ul className="list-disc list-inside text-white/70 space-y-1">
                                    <li>Work on advanced-level technical tasks</li>
                                    <li>Apply deeper concepts of chosen field</li>
                                    <li>Participate in partial internal systems/research</li>
                                    <li>Continuously evaluated for quality</li>
                                </ul>

                                <h3 className="text-xl font-semibold mt-6 text-white">Direct Entry for Experienced Candidates</h3>
                                <p className="text-white/70 text-sm">Candidates with previous internships, proven project work, or relevant certifications may apply for direct evaluation.</p>
                            </div>

                            {/* Layer 3 Details */}
                            <div className="space-y-6 p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors">
                                <h2 className="text-3xl font-bold text-white">Layer 3 — Core Project Internship</h2>
                                <p className="text-xl text-white/80">Real Systems | Real Responsibility</p>
                                <ul className="space-y-1 text-white/70">
                                    <li><strong>Mode:</strong> Hybrid (On-site / Remote) — Decided based on location & availability.</li>
                                    <li>Selection: Only from top Layer 2 performers</li>
                                    <li>Compensation: Stipend evaluated based on experience and knowledge</li>
                                    <li className="text-white/90 font-medium pt-2">
                                        Note: A rigorous technical interview and code walkthrough will be conducted to evaluate core system readiness.
                                    </li>
                                </ul>

                                <div className="mt-6">
                                    <h3 className="text-xl font-semibold mb-2 text-white">Long-Term Opportunity</h3>
                                    <p className="text-white/70">Exceptional candidates may be considered for full-time roles or positions with competitive salary. Depends entirely on performance, integrity, and alignment.</p>
                                </div>
                            </div>

                            <div className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl">
                                <h3 className="text-xl font-bold text-white mb-4">Important Notes</h3>
                                <ul className="space-y-2 text-white/70 list-disc list-inside">
                                    <li>This is not a guaranteed job program</li>
                                    <li>Certificates are issued only after verification</li>
                                    <li>Advancement is earned, not purchased</li>
                                    <li>Every decision is made manually</li>
                                    <li>Ryha Technologies reserves final evaluation authority</li>
                                </ul>
                            </div>

                            <div className="pt-8 flex flex-col md:flex-row items-center gap-6 justify-between border-t border-white/10">
                                <div className="text-white/60 text-sm max-w-lg">
                                    If you understand the structure, expectations, and evaluation process, you may proceed.
                                </div>
                                <Button size="lg" onClick={() => setStep(2)} className="bg-white text-black hover:bg-white/90 text-lg px-8 h-12 w-full md:w-auto">
                                    Next <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>

                        </div>
                    </Container>
                </div>
            </>
        );
    }

    // STEP 2: Selection
    const layers = [
        {
            id: "Layer 1",
            title: "Layer 1 — Foundation Internship",
            desc: "For beginners and learners starting their journey. Paid (₹2,499).",
            color: "border-white/10 hover:border-white/40",
        },
        {
            id: "Layer 2",
            title: "Layer 2 — Advanced Internship",
            desc: "For candidates with prior internship and project experience. Merit-Based.",
            color: "border-white/10 hover:border-white/40",
        },
        {
            id: "Layer 3",
            title: "Layer 3 — Core Internship",
            desc: "Direct contribution to Ryha Technologies’ core systems. Stipend-Based.",
            color: "border-white/10 hover:border-white/40",
        },
    ];

    if (step === 2) {
        return (
            <div className="min-h-screen pt-32 pb-20 bg-black text-white">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <Button variant="ghost" onClick={() => { setStep(1); setSelectedLayer(null) }} className="mb-8 pl-0 text-white/50 hover:text-white">
                            ← Back
                        </Button>

                        <h1 className="text-4xl font-bold mb-4">Choose Internship Entry Level</h1>
                        <p className="text-white/60 mb-12">Select the internship layer you are applying for. Each option has different eligibility and submission requirements.</p>

                        <div className="space-y-6">
                            {layers.map((layer) => (
                                <div
                                    key={layer.id}
                                    onClick={() => { setSelectedLayer(layer.id); setStep(3); }}
                                    className={`p-8 rounded-2xl border bg-white/[0.02] cursor-pointer transition-all ${layer.color} group hover:bg-white/[0.04]`}
                                >
                                    <h3 className="text-2xl font-bold mb-2 text-white transition-colors">{layer.title}</h3>
                                    <p className="text-white/60">{layer.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    // STEP 3: Form
    const renderFormContent = () => {
        switch (selectedLayer) {
            case "Layer 1":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-2">Apply for Layer 1 — Foundation Internship</h3>
                            <p className="text-white/60 text-sm">For candidates who want to begin with structured learning and evaluation. Paid: ₹2,499.</p>
                            <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded text-sm text-white/80">
                                <strong>Important:</strong> You will be asked to pay the fees via a link sent to your email <u>only if you get selected</u> after the interview/evaluation.
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input name="full_name" required value={formData.full_name} onChange={handleInputChange} placeholder="John Doe" className="bg-white/5 border-white/10 focus:border-white/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="john@example.com" className="bg-white/5 border-white/10 focus:border-white/30" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Mobile Number</Label>
                                <Input name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} placeholder="+91 99999 99999" className="bg-white/5 border-white/10 focus:border-white/30" />
                            </div>
                            <div className="space-y-2">
                                <Label>Selected Field of Internship</Label>
                                <Select onValueChange={(val) => setFormData(prev => ({ ...prev, domain: val }))}>
                                    <SelectTrigger className="bg-white/5 border-white/10 focus:border-white/30"><SelectValue placeholder="Select Field" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                                        <SelectItem value="AI / Machine Learning">AI / Machine Learning</SelectItem>
                                        <SelectItem value="Backend / Systems">Backend / Systems Engineering</SelectItem>
                                        <SelectItem value="Automation">Automation</SelectItem>
                                        <SelectItem value="R&D">Research & Development</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Current Status</Label>
                                <Select onValueChange={(val) => setFormData(prev => ({ ...prev, current_role: val }))}>
                                    <SelectTrigger className="bg-white/5 border-white/10 focus:border-white/30"><SelectValue placeholder="Select Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Student">Student</SelectItem>
                                        <SelectItem value="Graduate">Graduate</SelectItem>
                                        <SelectItem value="Learner">Learner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Resume (Google Drive Link Only)</Label>
                                <Input name="resume_url" required value={formData.resume_url} onChange={handleInputChange} placeholder="https://drive.google.com/..." className="bg-white/5 border-white/10 focus:border-white/30" />
                                <p className="text-xs text-white/40">Ensure link is accessible to anyone.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Why do you want to apply for this internship?</Label>
                                <Textarea name="motivation" required value={formData.motivation} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30 min-h-[100px]" placeholder="Short answer..." />
                            </div>
                        </div>
                    </div>
                );

            case "Layer 2":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-2">Apply for Layer 2 — Advanced Internship</h3>
                            <p className="text-white/60 text-sm">Merit-Based. For candidates with prior internship and project experience.</p>
                        </div>

                        <div className="p-6 border border-white/10 rounded-lg bg-white/5">
                            <h4 className="font-semibold mb-4 text-white">Required Submissions (Google Drive Only)</h4>
                            <ul className="list-disc list-inside text-sm text-white/60 space-y-1">
                                <li>Project URLs (GitHub, Live Demos)</li>
                                <li>Internship & Certification Documents (Single PDF)</li>
                                <li>Resume (PDF)</li>
                            </ul>
                            <p className="mt-4 text-xs text-white/40">All documents must be uploaded to Google Drive. No direct uploads.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input name="full_name" required value={formData.full_name} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input name="email" type="email" required value={formData.email} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Mobile Number</Label>
                                <Input name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                            </div>
                            <div className="space-y-2">
                                <Label>Selected Field of Internship</Label>
                                <Select onValueChange={(val) => setFormData(prev => ({ ...prev, domain: val }))}>
                                    <SelectTrigger className="bg-white/5 border-white/10 focus:border-white/30"><SelectValue placeholder="Select Field" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                                        <SelectItem value="AI / Machine Learning">AI / Machine Learning</SelectItem>
                                        <SelectItem value="Backend / Systems">Backend / Systems Engineering</SelectItem>
                                        <SelectItem value="Automation">Automation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Short Summary of Prior Experience</Label>
                                <Textarea name="experience_summary" required value={formData.experience_summary} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                            </div>

                            <div className="space-y-3">
                                <Label>Project URL(s)</Label>
                                {formData.project_urls.map((url, idx) => (
                                    <Input key={idx} value={url} onChange={(e) => handleProjectUrlChange(idx, e.target.value)} placeholder="GitHub / Live URL" className="bg-white/5 border-white/10 focus:border-white/30" />
                                ))}
                                <Button type="button" variant="ghost" size="sm" onClick={addProjectUrl} className="text-white/60 hover:text-white px-0">+ Add More Project URL</Button>
                            </div>

                            <div className="space-y-2">
                                <Label>Google Drive Link — Internship & Certification PDF</Label>
                                <Input name="docs_url" required value={formData.docs_url} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                            </div>

                            <div className="space-y-2">
                                <Label>Google Drive Link — Resume</Label>
                                <Input name="resume_url" required value={formData.resume_url} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                            </div>
                        </div>
                    </div>
                );

            case "Layer 3":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-2">Apply for Layer 3 — Core Internship</h3>
                            <p className="text-white/60 text-sm">Stipend-Based. Direct contribution to Ryha Technologies’ core systems.</p>
                            <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded text-sm text-white/80">
                                Stipend is evaluated and decided based on your <strong>experience and knowledge level</strong>.
                            </div>
                        </div>

                        <div className="p-6 border border-white/10 rounded-lg bg-white/5">
                            <h4 className="font-semibold mb-4 text-white">Required Submissions (Google Drive Only)</h4>
                            <ul className="list-disc list-inside text-sm text-white/60 space-y-1">
                                <li>Advanced Project Portfolio (Min 2 URLs)</li>
                                <li>Experience & Certification Documents (Single PDF)</li>
                                <li>Resume (PDF)</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input name="full_name" required value={formData.full_name} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input name="email" type="email" required value={formData.email} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Mobile Number</Label>
                                <Input name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                            </div>
                            <div className="space-y-2">
                                <Label>Selected Technical Domain</Label>
                                <Input name="domain" required value={formData.domain} onChange={handleInputChange} placeholder="e.g. Distributed Systems" className="bg-white/5 border-white/10 focus:border-white/30" />
                            </div>
                            <div className="space-y-2">
                                <Label>Current Skill Level (Self-assessed)</Label>
                                <Input name="skill_level" required value={formData.skill_level} onChange={handleInputChange} placeholder="e.g. Advanced / L3 Ready" className="bg-white/5 border-white/10 focus:border-white/30" />
                            </div>

                            <div className="space-y-3">
                                <Label>Project URL(s) (Advanced Systems)</Label>
                                {formData.project_urls.map((url, idx) => (
                                    <Input key={idx} value={url} onChange={(e) => handleProjectUrlChange(idx, e.target.value)} placeholder="GitHub / Live Project" className="bg-white/5 border-white/10 focus:border-white/30" />
                                ))}
                                <Button type="button" variant="ghost" size="sm" onClick={addProjectUrl} className="text-white/60 hover:text-white px-0">+ Add More Project URL</Button>
                            </div>

                            <div className="space-y-2">
                                <Label>Google Drive Link — Experience & Certificates PDF</Label>
                                <Input name="docs_url" required value={formData.docs_url} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                            </div>

                            <div className="space-y-2">
                                <Label>Google Drive Link — Resume</Label>
                                <Input name="resume_url" required value={formData.resume_url} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30" />
                            </div>

                            <div className="space-y-2">
                                <Label>Technical Self-Assessment</Label>
                                <p className="text-xs text-white/50 mb-1">Explain how you can contribute to Ryha’s core projects. Mention strongest technical areas.</p>
                                <Textarea name="self_assessment" required value={formData.self_assessment} onChange={handleInputChange} className="bg-white/5 border-white/10 focus:border-white/30 min-h-[120px]" />
                            </div>
                        </div>
                    </div>
                );

            default: return null;
        }
    }


    return (
        <div className="min-h-screen pt-32 pb-20 bg-black text-white">
            <Container>
                <div className="max-w-2xl mx-auto">
                    <Button variant="ghost" onClick={() => { setStep(2); setFormData(prev => ({ ...prev, project_urls: [""] })) }} className="mb-8 pl-0 text-white/50 hover:text-white">
                        ← Back to Selection
                    </Button>

                    <form onSubmit={handleApply}>
                        {renderFormContent()}

                        <div className="mt-12">
                            <Button type="submit" disabled={submitting} size="lg" className="w-full text-lg h-12 bg-white text-black hover:bg-white/90">
                                {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : "Apply Now"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Container>
        </div>
    );
}
