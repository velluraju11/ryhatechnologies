import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye, EyeOff, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };



    const downloadTemplate = () => {
        const headers = ['title', 'slug', 'excerpt', 'content', 'author', 'category', 'cover_image'];
        const example = ['"Example Title"', '"example-slug"', '"Short summary..."', '"<p>HTML Content</p>"', '"Author Name"', '"AI;Security"', '"https://..."'];
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), example.join(',')].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "blog_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const parseCSV = (text) => {
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let insideQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"') {
                if (insideQuotes && nextChar === '"') {
                    currentCell += '"';
                    i++;
                } else {
                    insideQuotes = !insideQuotes;
                }
            } else if (char === ',' && !insideQuotes) {
                currentRow.push(currentCell.trim());
                currentCell = '';
            } else if ((char === '\r' || char === '\n') && !insideQuotes) {
                if (char === '\r' && nextChar === '\n') i++;
                if (currentCell || currentRow.length > 0) {
                    currentRow.push(currentCell.trim());
                    rows.push(currentRow);
                }
                currentRow = [];
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        // Push last row if exists
        if (currentCell || currentRow.length > 0) {
            currentRow.push(currentCell.trim());
            rows.push(currentRow);
        }
        return rows;
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const rows = parseCSV(text);


            if (rows.length === 0) {
                toast.error("CSV is empty");
                return;
            }

            // Check if first row looks like a header (contains 'title' and 'slug')
            const firstRowOriginal = rows[0];
            const isHeader = firstRowOriginal.length > 1 &&
                (firstRowOriginal[0].toLowerCase().includes('title') ||
                    firstRowOriginal[1].toLowerCase().includes('slug'));

            if (isHeader) {
                rows.shift();
            }

            if (rows.length === 0) {
                toast.error("CSV contains no data rows");
                return;
            }

            let successCount = 0;
            const toastId = toast.loading("Importing posts...");

            for (const row of rows) {
                // Expected: title, slug, excerpt, content, author, category, cover_image
                if (row.length < 4) continue; // Basic validation

                const [title, slug, excerpt, content, author, categoryStr, cover_image] = row;

                // transform 'AI;Security' -> ['AI', 'Security']
                const category = categoryStr ? categoryStr.split(';').map(c => c.trim()).filter(Boolean) : [];

                // Generate slug if missing
                const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                try {
                    const { error } = await supabase.from('posts').insert([{
                        title: title.replace(/^"|"$/g, ''), // remove wrapping quotes if any
                        slug: finalSlug + '-' + Date.now().toString().slice(-4), // ensure unique
                        excerpt: excerpt,
                        content: content,
                        author: author,
                        category: category,
                        cover_image: cover_image,
                        published: false // Draft by default
                    }]);

                    if (!error) successCount++;
                } catch (err) {
                    console.error("Import error row:", row, err);
                }
            }

            toast.dismiss(toastId);
            toast.success(`Imported ${successCount} posts as Drafts`);
            fetchPosts(); // Refresh list
            event.target.value = ''; // Reset input
        };
        reader.readAsText(file);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Post deleted successfully');
            setPosts(posts.filter(post => post.id !== id));
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Failed to delete post');
        }
    };

    if (loading) return <div className="p-8 text-slate-500">Loading posts...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Blog Posts</h1>
                    <p className="text-slate-500">Manage your blog content</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={downloadTemplate} className="border-slate-200 text-slate-600 hover:bg-slate-50">
                        <Download className="w-4 h-4 mr-2" />
                        Template
                    </Button>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                            <Upload className="w-4 h-4 mr-2" />
                            Import CSV
                        </Button>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white">
                        <Link to="/admin/blog/new">
                            <Plus className="w-4 h-4 mr-2" />
                            New Post
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <p className="text-slate-500">No posts found. Create your first one!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between group hover:border-slate-300 transition-all shadow-sm">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${post.published
                                        ? 'bg-green-100 border-green-200 text-green-700'
                                        : 'bg-yellow-100 border-yellow-200 text-yellow-700'
                                        }`}>
                                        {post.published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-1">
                                    {post.excerpt || 'No excerpt'}
                                </p>
                                <div className="text-xs text-slate-400 mt-2 flex gap-4">
                                    <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                                    <span>Slug: /{post.slug}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button asChild variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                                    <Link to={`/admin/blog/edit/${post.id}`}>
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(post.id)}
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
