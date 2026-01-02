import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const InternshipPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All"); // All, Layer 1, Layer 2, Layer 3
    const [statusFilter, setStatusFilter] = useState("All"); // All, New, Reviewed, etc.

    // New State
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Details Modal State
    const [selectedApplication, setSelectedApplication] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("internship_applications")
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
            .from("internship_applications")
            .update({ status: newStatus })
            .eq("id", id);
    };

    // Filter Logic
    const filteredData = data.filter((item) => {
        const matchesLayer = filter === "All" || item.layer === filter;
        const matchesStatus = statusFilter === "All" || item.status === statusFilter;

        const matchesSearch =
            searchTerm === "" ||
            (item.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.domain || "").toLowerCase().includes(searchTerm.toLowerCase());

        const itemDate = new Date(item.created_at).toISOString().split('T')[0];
        let matchesDate = true;
        if (dateFrom && dateTo) {
            matchesDate = itemDate >= dateFrom && itemDate <= dateTo;
        } else if (dateFrom) {
            matchesDate = itemDate >= dateFrom;
        } else if (dateTo) {
            matchesDate = itemDate <= dateTo;
        }

        return matchesLayer && matchesStatus && matchesSearch && matchesDate;
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
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} applications?`)) return;

        const idsToDelete = Array.from(selectedIds);
        const { error } = await supabase
            .from("internship_applications")
            .delete()
            .in("id", idsToDelete);

        if (!error) {
            setData(prev => prev.filter(item => !selectedIds.has(item.id)));
            setSelectedIds(new Set());
        } else {
            alert("Error deleting applications");
            console.error(error);
        }
    };

    const exportCSV = () => {
        // Simple export of core fields
        const rowsToExport = selectedIds.size > 0
            ? data.filter(d => selectedIds.has(d.id))
            : filteredData;

        const csvContent =
            "data:text/csv;charset=utf-8," +
            ["Name,Email,Phone,Layer,Domain,Status,Date"]
                .concat(
                    rowsToExport.map(
                        (row) =>
                            `"${row.full_name}","${row.email}","${row.phone}","${row.layer}","${row.domain}","${row.status}","${new Date(row.created_at).toLocaleDateString()}"`
                    )
                )
                .join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `internship_applications.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Internship Applications</h1>
                    <p className="mt-2 text-sm text-slate-700">
                        Review and manage internship applicants.
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
            <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 items-end flex-wrap">
                <div className="w-full sm:flex-grow min-w-[200px]">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Search (Name, Email, Domain)</label>
                    <input
                        type="text"
                        placeholder="🔍 Search..."
                        className="block w-full rounded-md border-0 py-1.5 pl-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="w-full sm:w-auto">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Layer</label>
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                        <option value="All">All Layers</option>
                        <option value="Layer 1">Layer 1</option>
                        <option value="Layer 2">Layer 2</option>
                        <option value="Layer 3">Layer 3</option>
                    </select>
                </div>

                <div className="w-full sm:w-auto">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                        <option value="All">All Status</option>
                        <option value="New">New</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Selected">Selected</option>
                    </select>
                </div>


                <div className="flex gap-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
                        <input type="date" className="block w-32 rounded-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 sm:text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                        <input type="date" className="block w-32 rounded-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 sm:text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-slate-300">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-3 py-3.5 w-10"><input type="checkbox" className="rounded border-slate-300 text-indigo-600" onChange={handleSelectAll} checked={filteredData.length > 0 && selectedIds.size === filteredData.length} /></th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Name / Email</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Layer / Domain</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Details</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Date</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {loading ? (
                            <tr><td colSpan="7" className="px-3 py-4 text-center text-sm text-slate-500">Loading...</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan="7" className="px-3 py-4 text-center text-sm text-slate-500">No applications found.</td></tr>
                        ) : (
                            filteredData.map((app) => (
                                <tr key={app.id} className={selectedIds.has(app.id) ? "bg-slate-50" : ""}>
                                    <td className="px-3 py-4 text-sm"><input type="checkbox" className="rounded border-slate-300 text-indigo-600" checked={selectedIds.has(app.id)} onChange={() => handleSelectOne(app.id)} /></td>
                                    <td className="px-3 py-4 text-sm text-slate-900 font-medium">
                                        <div>{app.full_name}</div>
                                        <div className="text-slate-500 text-xs font-normal">{app.email}</div>
                                        <div className="text-slate-500 text-xs font-normal">{app.phone}</div>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-slate-500">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${app.layer === 'Layer 1' ? 'text-blue-700 bg-blue-50 ring-blue-600/20' : app.layer === 'Layer 2' ? 'text-purple-700 bg-purple-50 ring-purple-600/20' : 'text-amber-700 bg-amber-50 ring-amber-600/20'}`}>{app.layer}</span>
                                        <div className="my-1 text-slate-900">{app.domain}</div>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-slate-500 max-w-xs">
                                        <a href={app.resume_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline block text-xs">View Resume (Drive)</a>
                                        {app.docs_url && <a href={app.docs_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline block text-xs mt-1">View Docs (Drive)</a>}
                                    </td>
                                    <td className="px-3 py-4 text-sm">
                                        <select
                                            value={app.status}
                                            onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                                            className="rounded-md border-0 py-1 pl-2 pr-8 text-xs font-medium ring-1 ring-inset ring-gray-300"
                                        >
                                            <option value="New">New</option>
                                            <option value="Reviewed">Reviewed</option>
                                            <option value="Interviewing">Interviewing</option>
                                            <option value="Shortlisted">Shortlisted</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="Selected">Selected</option>
                                        </select>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-slate-500 whitespace-nowrap">{new Date(app.created_at).toLocaleDateString()}</td>
                                    <td className="px-3 py-4 text-sm">
                                        <button onClick={() => setSelectedApplication(app)} className="text-indigo-600 hover:text-indigo-900">View Full</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Full Details Modal */}
            {selectedApplication && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{selectedApplication.full_name} - {selectedApplication.layer}</h2>
                            <button onClick={() => setSelectedApplication(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500">Email</label>
                                    <div className="text-sm">{selectedApplication.email}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500">Phone</label>
                                    <div className="text-sm">{selectedApplication.phone}</div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-500">Resume URL</label>
                                    <a href={selectedApplication.resume_url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline break-all">{selectedApplication.resume_url}</a>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <h3 className="font-semibold mb-2 text-sm">{selectedApplication.layer} Specifics</h3>
                                {selectedApplication.layer === 'Layer 1' && (
                                    <div className="space-y-3">
                                        <div><label className="block text-xs font-medium text-slate-500">Current Role</label> <div className="text-sm">{selectedApplication.candidate_status}</div></div>
                                        <div><label className="block text-xs font-medium text-slate-500">Motivation</label> <div className="text-sm bg-slate-50 p-3 rounded">{selectedApplication.motivation}</div></div>
                                    </div>
                                )}
                                {['Layer 2', 'Layer 3'].includes(selectedApplication.layer) && (
                                    <div className="space-y-3">
                                        {selectedApplication.experience_summary && (
                                            <div><label className="block text-xs font-medium text-slate-500">Experience Summary</label> <div className="text-sm bg-slate-50 p-3 rounded">{selectedApplication.experience_summary}</div></div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500">Project URLs</label>
                                            <div className="space-y-1">
                                                {selectedApplication.project_urls?.map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block text-sm text-indigo-600 hover:underline break-all">{url}</a>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedApplication.docs_url && (
                                            <div><label className="block text-xs font-medium text-slate-500">Experience/Cert Docs</label> <a href={selectedApplication.docs_url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline break-all">{selectedApplication.docs_url}</a></div>
                                        )}
                                    </div>
                                )}
                                {selectedApplication.layer === 'Layer 3' && (
                                    <div className="space-y-3 mt-3">
                                        <div><label className="block text-xs font-medium text-slate-500">Self Assessment</label> <div className="text-sm bg-slate-50 p-3 rounded whitespace-pre-wrap">{selectedApplication.self_assessment}</div></div>
                                        <div><label className="block text-xs font-medium text-slate-500">Skill Level</label> <div className="text-sm">{selectedApplication.skill_level}</div></div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800" onClick={() => setSelectedApplication(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InternshipPage;
