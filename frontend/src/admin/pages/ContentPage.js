import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const SECTIONS = [
    { id: "privacy_policy", label: "Privacy Policy", type: "rich_text" },
    { id: "terms", label: "Terms & Conditions", type: "rich_text" },
    { id: "legal", label: "Legal Disclosure", type: "rich_text" },
    { id: "contact_info", label: "Contact Info (Structured)", type: "json" },
];

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
    ],
    clipboard: {
        matchVisual: false,
    }
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
];

export default function ContentPage() {
    const [selectedSection, setSelectedSection] = useState(SECTIONS[0]);
    const [content, setContent] = useState(""); // For rich text
    const [jsonContent, setJsonContent] = useState({}); // For structured content
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContent(selectedSection.id);
    }, [selectedSection]);

    const fetchContent = async (key) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("site_content")
            .select("content")
            .eq("key", key)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Error fetching content:", error);
        }

        if (key === "contact_info") {
            try {
                const parsed = data?.content ? JSON.parse(data.content) : {};
                setJsonContent(parsed);
            } catch (e) {
                setJsonContent({});
            }
        } else {
            setContent(data?.content || "");
        }
        setLoading(false);
    };

    const saveContent = async () => {
        setSaving(true);
        let finalContent = content;

        if (selectedSection.type === "json") {
            finalContent = JSON.stringify(jsonContent);
        }

        const { error } = await supabase
            .from("site_content")
            .upsert({ key: selectedSection.id, content: finalContent, updated_at: new Date() });

        setSaving(false);

        if (error) {
            toast.error("Failed to save changes.");
            console.error(error);
        } else {
            toast.success("Content updated successfully.");
        }
    };

    const handleJsonChange = (field, value) => {
        setJsonContent((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-black">Site Content</h1>
                <button
                    onClick={saveContent}
                    disabled={saving || loading}
                    className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-black/90 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-1">
                    {SECTIONS.map((sec) => (
                        <button
                            key={sec.id}
                            onClick={() => setSelectedSection(sec)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedSection.id === sec.id
                                ? "bg-black/10 text-black font-semibold"
                                : "text-black/60 hover:bg-black/5 hover:text-black"
                                }`}
                        >
                            {sec.label}
                        </button>
                    ))}
                </div>

                {/* Editor Area */}
                <div className="md:col-span-3">
                    {loading ? (
                        <div className="text-black/50">Loading content...</div>
                    ) : selectedSection.type === "rich_text" ? (
                        <div className="bg-white text-black rounded-lg border border-gray-200">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                formats={formats}
                                className="h-96 text-black"
                                style={{ minHeight: '400px' }}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-xl">
                            <div className="p-4 rounded-lg border border-gray-200 bg-white space-y-4">
                                <h3 className="text-black font-medium">Header Info</h3>
                                <div>
                                    <label className="block text-xs text-black/60 mb-1">Email Display</label>
                                    <input
                                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black text-sm"
                                        value={jsonContent.email || ""}
                                        onChange={(e) => handleJsonChange("email", e.target.value)}
                                        placeholder="contact@ryha.in"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-black/60 mb-1">Top Location Display</label>
                                    <input
                                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black text-sm"
                                        value={jsonContent.location_header || ""}
                                        onChange={(e) => handleJsonChange("location_header", e.target.value)}
                                        placeholder="City, State, Zip"
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border border-gray-200 bg-white space-y-4">
                                <h3 className="text-black font-medium">Notes Card</h3>
                                <div>
                                    <label className="block text-xs text-black/60 mb-1">Title</label>
                                    <input
                                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black text-sm"
                                        value={jsonContent.notes_title || ""}
                                        onChange={(e) => handleJsonChange("notes_title", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-black/60 mb-1">Description</label>
                                    <input
                                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black text-sm"
                                        value={jsonContent.notes_description || ""}
                                        onChange={(e) => handleJsonChange("notes_description", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-black/60 mb-1">Body Content</label>
                                    <textarea
                                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black text-sm min-h-[80px]"
                                        value={jsonContent.notes_content || ""}
                                        onChange={(e) => handleJsonChange("notes_content", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border border-gray-200 bg-white space-y-4">
                                <h3 className="text-black font-medium">Location Card</h3>
                                <div>
                                    <label className="block text-xs text-black/60 mb-1">Title</label>
                                    <input
                                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black text-sm"
                                        value={jsonContent.location_card_title || ""}
                                        onChange={(e) => handleJsonChange("location_card_title", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-black/60 mb-1">Address/Description</label>
                                    <textarea
                                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black text-sm min-h-[60px]"
                                        value={jsonContent.location_card_description || ""}
                                        onChange={(e) => handleJsonChange("location_card_description", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border border-gray-200 bg-white space-y-4">
                                <h3 className="text-black font-medium">Social Links</h3>
                                <div>
                                    <label className="block text-xs text-black/60 mb-1">LinkedIn URL</label>
                                    <input
                                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black text-sm"
                                        value={jsonContent.linkedin || ""}
                                        onChange={(e) => handleJsonChange("linkedin", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-black/60 mb-1">Instagram URL</label>
                                    <input
                                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black text-sm"
                                        value={jsonContent.instagram || ""}
                                        onChange={(e) => handleJsonChange("instagram", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-black/60 mb-1">X (Twitter) URL</label>
                                    <input
                                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-black text-sm"
                                        value={jsonContent.twitter || ""}
                                        onChange={(e) => handleJsonChange("twitter", e.target.value)}
                                    />
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
