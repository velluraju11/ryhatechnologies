import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Check, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCommentsPage() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select(`
                    *,
                    posts (title, slug)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (commentId, postId) => {
        const replyContent = window.prompt("Enter reply content:");
        if (!replyContent) return;

        try {
            const { data, error } = await supabase
                .from('comments')
                .insert([{
                    post_id: postId,
                    parent_id: commentId,
                    name: 'Ryha Technologies',
                    content: replyContent,
                    approved: true
                }])
                .select()
                .single();

            if (error) throw error;
            toast.success('Reply sent!');
            setComments([data, ...comments]); // Prepend logic might need refresh
            fetchComments(); // safer
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Failed to send reply');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Comment deleted');
            setComments(comments.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Failed to delete comment');
        }
    };

    if (loading) return <div className="p-8 text-slate-500">Loading comments...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Comments Management</h1>

            <div className="grid gap-4">
                {comments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <p className="text-slate-500">No comments found.</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start justify-between shadow-sm hover:border-slate-300 transition-all">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-slate-900">
                                        {comment.name}
                                        {comment.name === 'Ryha Technologies' && (
                                            <span className="ml-2 text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Official</span>
                                        )}
                                    </h3>
                                    <span className="text-xs text-slate-400">
                                        on {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                    {comment.parent_id && (
                                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                            Reply
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-700 text-sm whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                                <div className="text-xs text-slate-400 flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" />
                                    Post: {comment.posts?.title || 'Unknown Post'}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    onClick={() => handleReply(comment.id, comment.post_id)}
                                >
                                    <Reply className="w-4 h-4 mr-1" /> Reply
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => handleDelete(comment.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
