import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash, GripVertical, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Item Component
function SortableItem({ id, faq, editingId, setEditingId, handleUpdate, saveItem, handleDelete, fetchFaqs }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: faq.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        position: "relative",
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex gap-4 items-start p-4 border rounded-lg transition-colors group ${isDragging ? 'bg-blue-50 border-blue-200 shadow-lg' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
        >
            <div
                {...attributes}
                {...listeners}
                className="mt-1 text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            <div className="flex-1 space-y-2">
                {editingId === faq.id ? (
                    <div className="space-y-3">
                        <Input
                            value={faq.question}
                            onChange={e => handleUpdate(faq.id, 'question', e.target.value)}
                            className="font-bold text-slate-900 bg-white border-slate-300"
                            placeholder="Question"
                        />
                        <Textarea
                            value={faq.answer}
                            onChange={e => handleUpdate(faq.id, 'answer', e.target.value)}
                            rows={3}
                            className="text-slate-700 bg-white border-slate-300"
                            placeholder="Answer"
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveItem(faq)} className="bg-slate-900 text-white hover:bg-slate-800">
                                <Save className="h-4 w-4 mr-1" /> Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { fetchFaqs(); setEditingId(null); }}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div onClick={() => setEditingId(faq.id)} className="cursor-pointer group-hover:bg-slate-100/50 p-1 -m-1 rounded transition-colors">
                        <div className="font-bold text-slate-900 text-base">{faq.question}</div>
                        <div className="text-sm font-medium text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">{faq.answer}</div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1 items-end pl-2 border-l border-slate-200">
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(faq.id)}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export default function FAQPage() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    // New Item State
    const [newQuestion, setNewQuestion] = useState("");
    const [newAnswer, setNewAnswer] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

    const handleUpdate = (id, field, value) => {
        setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    const saveItem = async (faq) => {
        const { error } = await supabase
            .from('faq_items')
            .update({ question: faq.question, answer: faq.answer })
            .eq('id', faq.id);

        if (error) {
            toast.error("Failed to save changes");
        } else {
            toast.success("Changes saved");
            setEditingId(null);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setFaqs((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Update display_order for all affected items in local state
                const updatedItems = newOrder.map((item, index) => ({
                    ...item,
                    display_order: index + 1
                }));

                // Persist to Supabase
                // We'll update all items to ensure consistency
                const updates = updatedItems.map(({ id, display_order }) => ({
                    id,
                    display_order,
                    question: newOrder.find(i => i.id === id).question, // Supabase upsert needs all non-nulls if we just blindly upsert, but here we can just update specific fields if we do rpc, but let's do loop for simplicity or UPSERT if schema allows.
                    // Actually, simpler is just to loop update for now as list is small (FAQ usually < 20).
                }));

                // Fire and forget update (optimistic UI)
                updateOrderInDb(updates);

                return updatedItems;
            });
        }
    };

    const updateOrderInDb = async (items) => {
        try {
            // Using upsert would be better but we need all required fields. 
            // Let's just loop update the ones that changed index?
            // Or simpler: Upset with just ID and display_order? No, upsert replaces row or updates.
            // Let's iterate. It's safe for < 50 items.
            for (const item of items) {
                await supabase
                    .from('faq_items')
                    .update({ display_order: item.display_order })
                    .eq('id', item.id);
            }
            toast.success("Order updated");
        } catch (error) {
            console.error("Error updating order:", error);
            toast.error("Failed to save order");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">FAQ Management</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage public facing Frequently Asked Questions.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* ADD NEW FORM */}
                <Card className="md:col-span-4 h-fit border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900">Add New FAQ</CardTitle>
                        <CardDescription className="text-slate-500">Create a new question for the public site.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Question</label>
                            <Input
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder="e.g. Is Ryha secure?"
                                className="bg-white border-slate-300 text-slate-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Answer</label>
                            <Textarea
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                placeholder="Detailed answer..."
                                rows={4}
                                className="bg-white border-slate-300 text-slate-700"
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={isAdding} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                            {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Add FAQ
                        </Button>
                    </CardContent>
                </Card>

                {/* LIST */}
                <Card className="md:col-span-8 border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900">Existing FAQs</CardTitle>
                        <CardDescription>Drag handles to reorder items.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : faqs.length === 0 ? (
                            <div className="text-center p-8 text-slate-400">No FAQs found.</div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={faqs.map(f => f.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-4">
                                        {faqs.map((faq) => (
                                            <SortableItem
                                                key={faq.id}
                                                id={faq.id}
                                                faq={faq}
                                                editingId={editingId}
                                                setEditingId={setEditingId}
                                                handleUpdate={handleUpdate}
                                                saveItem={saveItem}
                                                handleDelete={handleDelete}
                                                fetchFaqs={fetchFaqs}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
