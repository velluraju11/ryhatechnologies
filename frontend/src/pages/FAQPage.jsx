import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
// Local Container Component
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import SEO from "../components/SEO";
import { Loader2, ArrowLeft } from "lucide-react";

// Reusing Section component style if available, or manual implementation
function Section({ eyebrow, title, subtitle, children }) {
    return (
        <section className="py-16 md:py-24">
            <Container>
                <div className="max-w-3xl">
                    {eyebrow && (
                        <div className="mb-3 inline-flex items-center gap-2">
                            <span className="h-[1px] w-8 bg-white/15" />
                            <span className="text-xs tracking-[0.18em] text-white/60 uppercase">{eyebrow}</span>
                        </div>
                    )}
                    {title && <h1 className="ryha-h1">{title}</h1>}
                    {subtitle && (
                        <p className="mt-4 ryha-p">
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className="mt-12">{children}</div>
            </Container>
        </section>
    )
}


export default function FAQPage() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            const { data, error } = await supabase
                .from("faq_items")
                .select("*")
                .order("display_order", { ascending: true });

            if (!error && data) {
                setFaqs(data);
            }
            setLoading(false);
        };
        fetchFaqs();
    }, []);

    // Generate FAQ Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <>
            <SEO
                title="Frequently Asked Questions"
                description="Find answers to common questions about Ryha Technologies, our autonomous security systems, and early access program."
                schemas={[faqSchema]} // Injecting specific schema
            />

            <Section
                eyebrow="Support"
                title="Frequently Asked Questions"
                subtitle="Everything you need to know about Ryha Technologies and our mission."
            >
                <div className="max-w-3xl mx-auto md:mx-0">
                    {loading ? (
                        <div className="flex items-center gap-2 text-white/50">
                            <Loader2 className="animate-spin h-5 w-5" /> Loading...
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {faqs.map((faq) => (
                                <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border-white/10 px-4 rounded-lg bg-white/[0.02]">
                                    <AccordionTrigger className="text-left text-white/90 hover:text-white hover:no-underline py-4 text-base md:text-lg">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-white/60 text-base leading-relaxed pb-6 whitespace-pre-wrap">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}

                    <div className="mt-16 pt-8 border-t border-white/10">
                        <p className="text-white/50 mb-4">Can't find what you're looking for?</p>
                        <Link to="/contact" className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors border-b border-white/20 pb-0.5 hover:border-white">
                            Contact our team <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Link>
                    </div>
                </div>
            </Section>
        </>
    );
}
