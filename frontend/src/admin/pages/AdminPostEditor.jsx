import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminPostEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image: '',
        published: false
    });

    useEffect(() => {
        if (isEditing) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) setFormData(data);
        } catch (error) {
            console.error('Error loading post:', error);
            toast.error('Failed to load post');
            navigate('/admin/blog');
        } finally {
            setFetching(false);
        }
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        // Auto-generate slug from title if not manually edited yet or creating new
        if (!isEditing && !formData.slug) {
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setFormData(prev => ({ ...prev, title, slug }));
        } else {
            setFormData(prev => ({ ...prev, title }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.title || !formData.slug) {
                toast.error('Title and Slug are required');
                return;
            }

            const payload = {
                ...formData,
                updated_at: new Date().toISOString()
            };

            if (isEditing) {
                const { error } = await supabase
                    .from('posts')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
                toast.success('Post updated!');
            } else {
                const { error } = await supabase
                    .from('posts')
                    .insert([payload]);
                if (error) throw error;
                toast.success('Post created!');
                navigate('/admin/blog');
            }
        } catch (error) {
            console.error('Error saving post:', error);
            toast.error('Failed to save post: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-slate-500">Loading editor...</div>;

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'code-block'],
            ['clean']
        ],
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => navigate('/admin/blog')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-slate-900">
                    {isEditing ? 'Edit Post' : 'New Post'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-slate-900">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={handleTitleChange}
                            className="bg-white border-slate-200 text-slate-900 focus:border-blue-500"
                            placeholder="Enter post title"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug" className="text-slate-900">Slug (URL)</Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="bg-white border-slate-200 text-slate-900 focus:border-blue-500"
                            placeholder="url-friendly-slug"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="author" className="text-slate-900">Author</Label>
                        <select
                            id="author"
                            value={formData.author || 'Ryha Technologies'}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
                        >
                            <option value="Ryha Technologies">Ryha Technologies</option>
                            <option value="Vellu Raju">Vellu Raju</option>
                            <option value="Sanjay Rithik">Sanjay Rithik</option>
                        </select>
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="category" className="text-slate-900">Categories</Label>

                        <div className="flex flex-wrap gap-2 mb-2">
                            {['Cybersecurity', 'AI', 'Stealth', 'Engineering', 'Others'].map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => {
                                        const current = Array.isArray(formData.category) ? formData.category : (formData.category ? [formData.category] : []);
                                        if (!current.includes(preset)) {
                                            setFormData({ ...formData, category: [...current, preset] });
                                        }
                                    }}
                                    className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors"
                                >
                                    + {preset}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-md min-h-[3rem]">
                            {(Array.isArray(formData.category) ? formData.category : (formData.category ? [formData.category] : [])).map((cat, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    {cat}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const current = Array.isArray(formData.category) ? formData.category : [formData.category];
                                            setFormData({ ...formData, category: current.filter(c => c !== cat) });
                                        }}
                                        className="ml-1.5 h-3.5 w-3.5 rounded-full inline-flex items-center justify-center hover:bg-blue-200 text-blue-500"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 placeholder:text-slate-400 min-w-[120px]"
                                placeholder="Type & Enter to add..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                            const current = Array.isArray(formData.category) ? formData.category : (formData.category ? [formData.category] : []);
                                            if (!current.includes(val)) {
                                                setFormData({ ...formData, category: [...current, val] });
                                            }
                                            e.currentTarget.value = '';
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="excerpt" className="text-slate-900">Excerpt (Short Summary)</Label>
                    <Input
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 focus:border-blue-500"
                        placeholder="Brief description for SEO and cards"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cover_image" className="text-slate-900">Cover Image URL</Label>
                    <Input
                        id="cover_image"
                        value={formData.cover_image}
                        onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 focus:border-blue-500"
                        placeholder="https://..."
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-900">Content</Label>
                    {/* Quill editor needs manual CSS override for light theme sometimes, but default snow theme is light */}
                    <div className="bg-white text-slate-900 rounded-lg overflow-hidden border border-slate-200">
                        <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={(content) => setFormData({ ...formData, content })}
                            modules={modules}
                            className="h-[400px] mb-12"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="published"
                            checked={formData.published}
                            onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                        />
                        <Label htmlFor="published" className="text-slate-900 cursor-pointer">
                            Publish immediately
                        </Label>
                    </div>

                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Post
                    </Button>
                </div>
            </form>
        </div>
    );
}
