import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Trash, GripVertical, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FAQPage() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    // New Item State
    const [newQuestion, setNewQuestion] = useState("");
    const [newAnswer, setNewAnswer] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("faq_items")
            .select("*")
            .order("display_order", { ascending: true });

        if (error) {
            toast.error("Failed to load FAQs");
            console.error(error);
        } else {
            setFaqs(data || []);
        }
        setLoading(false);
    };

    const handleAdd = async () => {
        if (!newQuestion.trim() || !newAnswer.trim()) {
            toast.error("Question and Answer are required");
            return;
        }

        setIsAdding(true);
        const { data, error } = await supabase
            .from("faq_items")
            .insert([
                {
                    question: newQuestion,
                    answer: newAnswer,
                    display_order: faqs.length + 1, // Append to end
                },
            ])
            .select()
            .single();

        setIsAdding(false);

        if (error) {
            toast.error("Failed to add FAQ");
            console.error(error);
        } else {
            toast.success("FAQ Added");
            setFaqs([...faqs, data]);
            setNewQuestion("");
            setNewAnswer("");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this FAQ?")) return;

        const { error } = await supabase.from("faq_items").delete().eq("id", id);
        if (error) {
            toast.error("Failed to delete");
        } else {
            toast.success("FAQ Deleted");
            setFaqs(faqs.filter((f) => f.id !== id));
        }
    };

    const handleUpdate = async (id, field, value) => {
        // Optimistic update
        setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f));

        // Debounce or save on blur could be better, but simple save on change for internal tools is okay'ish.
        // Better pattern: Local state for edit, then save button.
    };

    const saveItem = async (faq) => {
        const { error } = await supabase
            .from('faq_items')
            .update({ question: faq.question, answer: faq.answer, display_order: faq.display_order })
            .eq('id', faq.id);

        if (error) {
            toast.error("Failed to save changes");
        } else {
            toast.success("Changes saved");
            setEditingId(null);
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">FAQ Management</h2>
                    <p className="text-muted-foreground">Manage public facing Frequently Asked Questions.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* ADD NEW FORM */}
                <Card className="md:col-span-4 h-fit">
                    <CardHeader>
                        <CardTitle>Add New FAQ</CardTitle>
                        <CardDescription>Create a new question for the public site.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Question</label>
                            <Input
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder="e.g. Is Ryha secure?"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Answer</label>
                            <Textarea
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                placeholder="Detailed answer..."
                                rows={4}
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={isAdding} className="w-full">
                            {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Add FAQ
                        </Button>
                    </CardContent>
                </Card>

                {/* LIST */}
                <Card className="md:col-span-8">
                    <CardHeader>
                        <CardTitle>Existing FAQs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                        ) : faqs.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground">No FAQs found.</div>
                        ) : (
                            <div className="space-y-4">
                                {faqs.map((faq) => (
                                    <div key={faq.id} className="flex gap-4 items-start p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors group">
                                        <div className="mt-1 text-muted-foreground cursor-grab active:cursor-grabbing">
                                            <GripVertical className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            {editingId === faq.id ? (
                                                <>
                                                    <Input value={faq.question} onChange={e => handleUpdate(faq.id, 'question', e.target.value)} className="font-semibold" />
                                                    <Textarea value={faq.answer} onChange={e => handleUpdate(faq.id, 'answer', e.target.value)} rows={3} />
                                                    <div className="flex gap-2 mt-2">
                                                        <Button size="sm" onClick={() => saveItem(faq)}><Save className="h-4 w-4 mr-1" /> Save</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => { fetchFaqs(); setEditingId(null); }}>Cancel</Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div onClick={() => setEditingId(faq.id)} className="cursor-pointer">
                                                    <div className="font-semibold text-foreground">{faq.question}</div>
                                                    <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{faq.answer}</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            <div className="text-xs text-muted-foreground">Order: {faq.display_order}</div>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(faq.id)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
