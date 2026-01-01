import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const ContactPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    // New State
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("contact_messages")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error) {
            setData(data || []);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, status: newStatus } : item
            )
        );

        await supabase
            .from("contact_messages")
            .update({ status: newStatus })
            .eq("id", id);
    };

    // Filter Logic
    const filteredData = data.filter((item) => {
        const matchesStatus = filter === "All" || item.status === filter;
        const matchesName =
            searchTerm === "" ||
            (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.message || "").toLowerCase().includes(searchTerm.toLowerCase());

        const itemDate = new Date(item.created_at).toISOString().split('T')[0];
        let matchesDate = true;
        if (dateFrom && dateTo) {
            matchesDate = itemDate >= dateFrom && itemDate <= dateTo;
        } else if (dateFrom) {
            matchesDate = itemDate >= dateFrom;
        } else if (dateTo) {
            matchesDate = itemDate <= dateTo;
        }

        return matchesStatus && matchesName && matchesDate;
    });

    // Selection Logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = new Set(filteredData.map(d => d.id));
            setSelectedIds(allIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleDeleteSelected = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} messages?`)) return;

        const idsToDelete = Array.from(selectedIds);
        const { error } = await supabase
            .from("contact_messages")
            .delete()
            .in("id", idsToDelete);

        if (!error) {
            setData(prev => prev.filter(item => !selectedIds.has(item.id)));
            setSelectedIds(new Set());
        } else {
            alert("Error deleting messages");
            console.error(error);
        }
    };

    const exportCSV = () => {
        const rowsToExport = selectedIds.size > 0
            ? data.filter(d => selectedIds.has(d.id))
            : filteredData;

        const csvContent =
            "data:text/csv;charset=utf-8," +
            ["Name,Email,Phone,Message,Status,Date"]
                .concat(
                    rowsToExport.map(
                        (row) =>
                            `"${row.name || ""}","${row.email}","${row.phone || ""}","${(row.message || "").replace(/"/g, '""')}","${row.status
                            }","${new Date(row.created_at).toLocaleDateString()}"`
                    )
                )
                .join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `contact_messages_${selectedIds.size > 0 ? 'selected' : 'all'}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Contact Messages</h1>
                    <p className="mt-2 text-sm text-slate-700">
                        View and manage contact form submissions.
                    </p>
                </div>
                <div className="flex gap-2 mt-4 sm:mt-0">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                        >
                            Delete ({selectedIds.size})
                        </button>
                    )}
                    <button
                        onClick={exportCSV}
                        className="rounded-md bg-white border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 items-end">
                <div className="w-full sm:flex-grow">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Search</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="🔍 Search name, email, or message..."
                            className="block w-full rounded-md border-0 py-1.5 pl-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="w-32">
                        <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
                        <input
                            type="date"
                            className="block w-full rounded-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                        <input
                            type="date"
                            className="block w-full rounded-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 pb-1">
                    {["All", "New", "Reviewed", "Responded"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === status
                                ? "bg-slate-900 text-white"
                                : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-slate-300">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 w-10">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                    onChange={handleSelectAll}
                                    checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                                />
                            </th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                                Contact Info
                            </th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                                Phone
                            </th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                                Message
                            </th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                                Status
                            </th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-3 py-4 text-center text-sm text-slate-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-3 py-4 text-center text-sm text-slate-500">
                                    No messages found.
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((msg) => (
                                <tr key={msg.id} className={selectedIds.has(msg.id) ? "bg-slate-50" : ""}>
                                    <td className="px-3 py-4 text-sm text-slate-900">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                            checked={selectedIds.has(msg.id)}
                                            onChange={() => handleSelectOne(msg.id)}
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">
                                        <div className="font-medium">{msg.email}</div>
                                        <div className="text-slate-500 text-xs">{msg.name || "-"}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                        {msg.phone || "-"}
                                    </td>
                                    <td className="px-3 py-4 text-sm text-slate-500 max-w-sm truncate" title={msg.message}>
                                        {msg.message}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <select
                                            value={msg.status}
                                            onChange={(e) =>
                                                handleStatusUpdate(msg.id, e.target.value)
                                            }
                                            className={`rounded-md border-0 py-1 pl-2 pr-8 text-xs font-medium ring-1 ring-inset ${msg.status === "New"
                                                ? "text-blue-700 bg-blue-50 ring-blue-600/20"
                                                : msg.status === "Reviewed"
                                                    ? "text-yellow-800 bg-yellow-50 ring-yellow-600/20"
                                                    : "text-green-700 bg-green-50 ring-green-600/20"
                                                }`}
                                        >
                                            <option value="New">New</option>
                                            <option value="Reviewed">Reviewed</option>
                                            <option value="Responded">Responded</option>
                                        </select>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContactPage;
