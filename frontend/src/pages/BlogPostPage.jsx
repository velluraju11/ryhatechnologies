import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Section } from './RyhaPages';
import { Calendar, User, ArrowLeft, Send } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function BlogPostPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Comment Form State
    const [commentData, setCommentData] = useState({ name: '', content: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [slug]);

    const fetchPost = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('slug', slug)
                .eq('published', true)
                .single();

            if (error) throw error;
            setPost(data);

            if (data) {
                fetchComments(data.id);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (postId) => {
        const { data } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .eq('approved', true)
            .order('created_at', { ascending: true });
        setComments(data || []);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentData.name.trim() || !commentData.content.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .insert([{
                    post_id: post.id,
                    name: commentData.name,
                    content: commentData.content,
                    approved: true // Auto-approve
                }])
                .select()
                .single();

            if (error) throw error;
            toast.success("Comment posted!");
            setComments([...comments, data]);
            setCommentData({ name: '', content: '' });
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    // Recursive component to render comments tree
    const CommentItem = ({ comment, depth = 0 }) => {
        const [showReplyForm, setShowReplyForm] = useState(false);
        const [replyContent, setReplyContent] = useState('');
        const [replyName, setReplyName] = useState('');
        const [isReplying, setIsReplying] = useState(false);

        const handleReplySubmit = async (e) => {
            e.preventDefault();
            if (!replyName.trim() || !replyContent.trim()) return;

            setIsReplying(true);
            try {
                const { data, error } = await supabase
                    .from('comments')
                    .insert([{
                        post_id: post.id,
                        parent_id: comment.id,
                        name: replyName,
                        content: replyContent,
                        approved: true
                    }])
                    .select()
                    .single();

                if (error) throw error;
                toast.success('Reply posted!');
                setComments([...comments, data]);
                setShowReplyForm(false);
                setReplyContent('');
                setReplyName('');
            } catch (error) {
                console.error('Error replying:', error);
                toast.error('Failed to post reply');
            } finally {
                setIsReplying(false);
            }
        };

        const replies = comments.filter(c => c.parent_id === comment.id);

        return (
            <div className={`mt-6 ${depth > 0 ? 'ml-6 md:ml-12 border-l border-white/10 pl-6' : ''}`}>
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                            {comment.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">
                            {comment.name}
                            {comment.name === 'Ryha Technologies' && (
                                <span className="ml-2 text-[10px] bg-blue-600 px-1.5 py-0.5 rounded text-white uppercase tracking-wider">
                                    Official
                                </span>
                            )}
                        </span>
                        <span className="text-xs text-white/40 ml-auto">
                            {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-white/80 text-sm pl-10 mb-4">{comment.content}</p>

                    <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="text-xs text-blue-400 hover:text-blue-300 ml-10 font-medium transition-colors"
                    >
                        Reply
                    </button>

                    {showReplyForm && (
                        <form onSubmit={handleReplySubmit} className="mt-4 ml-10 space-y-3">
                            <Input
                                placeholder="Your Name"
                                value={replyName}
                                onChange={(e) => setReplyName(e.target.value)}
                                className="bg-white/5 border-white/10 text-white h-9 text-sm"
                            />
                            <Textarea
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="bg-white/5 border-white/10 text-white min-h-[80px] text-sm"
                            />
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isReplying} size="sm" className="bg-blue-600 h-8 text-xs">
                                    {isReplying ? 'Posting...' : 'Post Reply'}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowReplyForm(false)} className="h-8 text-xs text-white/50 hover:text-white">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
                {/* Render Replies Recursively */}
                {replies.map(reply => (
                    <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                ))}
            </div>
        );
    };

    if (loading) return <div className="min-h-screen pt-32 text-center text-white/50">Loading article...</div>;
    if (!post) return <div className="min-h-screen pt-32 text-center text-white/50">Article not found.</div>;

    return (
        <>
            <SEO
                title={post.title}
                description={post.excerpt}
                image={post.cover_image}
                type="article"
                url={`/blog/${post.slug}`}
                schemas={[
                    {
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": post.title,
                        "image": post.cover_image,
                        "author": {
                            "@type": "Person",
                            "name": post.author || "Ryha Team"
                        },
                        "datePublished": post.created_at,
                        "description": post.excerpt
                    }
                ]}
            />

            <div className="min-h-screen bg-black w-full overflow-x-hidden" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 50%)' }}>
                <article className="pt-8 pb-12">
                    {/* Header */}
                    <Section maxWidth="max-w-3xl" className="!pt-0">
                        <Link to="/blog" className="inline-flex items-center text-sm text-white/50 hover:text-white mb-8 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Intelligence
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-blue-400 mb-6 font-mono uppercase tracking-wide">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            {post.author && (
                                <>
                                    <span className="text-white/20">•</span>
                                    <span className="flex items-center gap-2 text-white/80">
                                        <User className="w-4 h-4" />
                                        {post.author}
                                    </span>
                                </>
                            )}
                            {(Array.isArray(post.category) ? post.category : (post.category ? [post.category] : [])).map((cat, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                                    {cat}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
                            {post.title}
                        </h1>

                        {post.cover_image && (
                            <div className="rounded-2xl overflow-hidden border border-white/10 mb-12 shadow-2xl shadow-blue-900/10">
                                <img src={post.cover_image} alt={post.title} className="w-full h-auto" />
                            </div>
                        )}
                    </Section>

                    {/* Content */}
                    <Section maxWidth="max-w-3xl" className="!pt-0 !pb-0">
                        <div
                            className="prose prose-invert prose-lg max-w-none w-full break-words
                                [&>p:empty]:hidden
                                prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                                prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
                                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
                                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
                                prose-p:text-slate-300 prose-p:leading-7 prose-p:my-3 prose-p:text-lg prose-p:tracking-normal
                                prose-strong:text-white prose-strong:font-semibold
                                prose-li:text-slate-300 prose-li:marker:text-blue-500 prose-li:my-1
                                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-white/5 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-slate-200 prose-blockquote:rounded-r-lg prose-blockquote:my-6
                                prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                                prose-img:rounded-2xl prose-img:shadow-2xl prose-img:border prose-img:border-white/10 prose-img:w-full prose-img:my-8
                                prose-code:text-blue-300 prose-code:bg-blue-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                                hr:border-white/10 hr:my-8"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </Section>

                    {/* Separator */}
                    <div className="max-w-3xl mx-auto my-8 px-6">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    {/* Comments Section */}
                    <Section maxWidth="max-w-3xl" className="!pt-0">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            Discussion <span className="text-base font-normal text-white/40">({comments.length})</span>
                        </h3>

                        {/* Comment List */}
                        <div className="space-y-6 mb-12">
                            {comments.length === 0 ? (
                                <p className="text-white/40 italic">No comments yet. Be the first to share your thoughts.</p>
                            ) : (
                                comments
                                    .filter(c => !c.parent_id) // Only top-level comments first
                                    .map((comment) => (
                                        <CommentItem key={comment.id} comment={comment} />
                                    ))
                            )}
                        </div>

                        {/* Main Comment Form */}
                        <div className="bg-[#0A0C10] border border-white/10 p-6 rounded-xl">
                            <h4 className="text-lg font-semibold text-white mb-4">Leave a Reply</h4>
                            <form onSubmit={handleCommentSubmit} className="space-y-4">
                                <div>
                                    <Input
                                        placeholder="Your Name"
                                        value={commentData.name}
                                        onChange={(e) => setCommentData({ ...commentData, name: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div>
                                    <Textarea
                                        placeholder="Share your thoughts..."
                                        value={commentData.content}
                                        onChange={(e) => setCommentData({ ...commentData, content: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white min-h-[100px]"
                                    />
                                </div>
                                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 w-full md:w-auto">
                                    <Send className="w-4 h-4 mr-2" />
                                    {submitting ? 'Submitting...' : 'Post Comment'}
                                </Button>
                            </form>
                        </div>
                    </Section>

                </article>
            </div>
        </>
    );
}
