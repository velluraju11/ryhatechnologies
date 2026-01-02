import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Section } from './RyhaPages';
import { Calendar, ArrowRight, User, Sparkles, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('published', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching blog posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', 'Cybersecurity', 'AI', 'Stealth', 'Engineering', 'Others'];

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesCategory = true;
        if (selectedCategory !== 'All') {
            const cats = Array.isArray(post.category) ? post.category : (post.category ? [post.category] : []);
            matchesCategory = cats.includes(selectedCategory);
        }

        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <SEO
                title="Intelligence & Insights"
                description="Deep dives into autonomous security, AI architecture, and the future of digital defense."
                url="/blog"
            />

            <div className="min-h-screen bg-black w-full overflow-x-hidden" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 50%)' }}>
                <div className="pt-4 pb-8">
                    <Section className="!pt-0 pb-0 text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 backdrop-blur-sm">
                            <Sparkles className="h-3 w-3 text-blue-400" />
                            <span>Research & Updates</span>
                        </div>
                        <h1 className="ryha-h1 mb-4 max-w-4xl mx-auto tracking-tight">
                            Signals from the <span className="text-white/40">Lab</span>
                        </h1>
                        <p className="text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
                            Engineering notes, architectural decisions, and thoughts on building resilient intelligent systems.
                        </p>
                    </Section>

                    {/* Filter & Search Bar */}
                    <div className="max-w-5xl mx-auto px-4 md:px-6 pb-12 mt-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-6">
                            {/* Categories */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat
                                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                            : 'bg-white/5 text-white/60 border border-white/5 hover:border-white/10 hover:text-white'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-64 group">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search intelligence..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                />
                            </div>
                        </div>
                    </div>

                    <Section maxWidth="max-w-7xl" className="!pt-0">
                        {loading ? (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-96 animate-pulse rounded-3xl bg-white/5 border border-white/5" />
                                ))}
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />
                                <p className="text-lg text-white/40 font-light">Signal silence. No transmissions match your criteria.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredPosts.map((post, idx) => (
                                    <Link
                                        key={post.id}
                                        to={`/blog/${post.slug}`}
                                        className="group relative flex flex-col overflow-hidden rounded-3xl bg-white/[0.02] border border-white/10 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-blue-900/5 h-full"
                                    >
                                        {/* Image Container with subtle zoom effect */}
                                        <div className="aspect-[16/10] overflow-hidden relative bg-white/5">
                                            {post.cover_image ? (
                                                <>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                                                    <img
                                                        src={post.cover_image}
                                                        alt={post.title}
                                                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                    />
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                                                    <span className="text-white/10 text-4xl font-mono">RYHA</span>
                                                </div>
                                            )}

                                            {/* Category Badges overlay */}
                                            <div className="absolute top-4 left-4 z-20 flex gap-2 flex-wrap max-w-[80%]">
                                                {(Array.isArray(post.category) ? post.category : (post.category ? [post.category] : [])).slice(0, 3).map((cat, i) => (
                                                    <span key={i} className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-white/90 shadow-lg tracking-wide uppercase">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-1 flex-col p-6 relative">
                                            {/* Metadata line */}
                                            <div className="mb-4 flex items-center gap-4 text-xs font-medium text-white/40">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="h-1 w-1 rounded-full bg-white/20" />
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>5 min read</span>
                                                </div>
                                            </div>

                                            <h3 className="mb-3 text-xl font-semibold leading-snug text-white/90 transition-colors group-hover:text-white group-hover:text-blue-200">
                                                {post.title}
                                            </h3>

                                            <p className="mb-6 flex-1 text-sm leading-relaxed text-white/50 line-clamp-3">
                                                {post.excerpt}
                                            </p>

                                            <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                                                {post.author ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                            {post.author.charAt(0)}
                                                        </div>
                                                        <span className="text-xs text-white/60 font-medium">{post.author}</span>
                                                    </div>
                                                ) : <div />}

                                                <span className="flex items-center gap-2 text-xs font-semibold text-white/40 transition-colors group-hover:text-blue-400">
                                                    Read Analysis <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Section>
                </div>
            </div>
        </>
    );
}
