import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import {
    ShieldCheck,
    Clock,
    UserCheck,
    AlertTriangle,
    CheckCircle,
    XCircle,
    FileText,
    ExternalLink,
    Search,
} from "lucide-react";

const WardenDashboard = () => {
    const [stats, setStats] = useState(null);
    const [outpasses, setOutpasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("PENDING"); // 'PENDING' | 'ALL'
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [reviewModal, setReviewModal] = useState({ open: false, outpass: null, action: "APPROVE", remarks: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, outpassesRes] = await Promise.all([
                api.get("/warden/stats"),
                api.get(`/warden/all?status=${activeTab}&search=${search}`),
            ]);
            setStats(statsRes.data?.stats || null);
            setOutpasses(outpassesRes.data?.outpasses || []);
        } catch (err) {
            console.error("Error fetching warden data:", err);
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [activeTab, search]);

    const handleOpenReview = (outpass, action) => {
        setReviewModal({
            open: true,
            outpass,
            action,
            remarks: action === "APPROVE" ? "Approved by Warden." : "",
        });
    };

    const handleConfirmReview = async (e) => {
        e.preventDefault();
        const { outpass, action, remarks } = reviewModal;
        if (!outpass) return;

        setActionLoading(outpass._id);
        setError("");
        setMessage("");

        try {
            const res = await api.patch(`/warden/${outpass._id}/review`, {
                action,
                remarks,
            });
            setMessage(res.data?.message || "Outpass reviewed successfully.");
            setReviewModal({ open: false, outpass: null, action: "APPROVE", remarks: "" });
            fetchDashboardData(); // Refresh list & counters
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Hostel Warden Portal</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        Authorize student leaves, inspect curfew exceptions, and monitor campus gate logs
                    </p>
                </div>

                {message && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium">
                        {error}
                    </div>
                )}

                {/* Metric Summary Cards */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Pending Review
                            </span>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-2xl font-black text-amber-600">{stats.pendingCount}</span>
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Curfew Extensions
                            </span>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-2xl font-black text-purple-600">{stats.curfewPendingCount}</span>
                                <AlertTriangle className="w-5 h-5 text-purple-500" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Outside Campus
                            </span>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-2xl font-black text-sky-600">{stats.outsideCount}</span>
                                <UserCheck className="w-5 h-5 text-sky-500" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Overdue Returns
                            </span>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-2xl font-black text-rose-600">{stats.overdueCount}</span>
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Tabs & Search */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab("PENDING")}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                                activeTab === "PENDING"
                                    ? "bg-white text-zinc-900 shadow-xs"
                                    : "text-zinc-600 hover:text-zinc-900"
                            }`}
                        >
                            Pending Queue ({stats?.pendingCount || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab("ALL")}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                                activeTab === "ALL"
                                    ? "bg-white text-zinc-900 shadow-xs"
                                    : "text-zinc-600 hover:text-zinc-900"
                            }`}
                        >
                            All Outpasses
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or roll no..."
                            className="w-full pl-9 pr-3 py-1.5 border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                    </div>
                </div>

                {/* Outpasses List */}
                {loading ? (
                    <div className="text-center py-16 text-zinc-500 text-sm">
                        <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Fetching applications...
                    </div>
                ) : outpasses.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl border border-zinc-200 text-center shadow-xs">
                        <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                        <h3 className="text-base font-bold text-zinc-900 mb-1">Queue is Clear!</h3>
                        <p className="text-xs text-zinc-500">
                            {activeTab === "PENDING"
                                ? "There are no outpass requests currently awaiting approval."
                                : "No outpasses match your current search query."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {outpasses.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white rounded-xl border border-zinc-200 shadow-xs p-5 hover:border-zinc-300 transition"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                                            {item.student?.name?.[0] || "S"}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-zinc-900">
                                                {item.student?.name}
                                                <span className="font-normal text-zinc-500 ml-1.5">
                                                    ({item.student?.studentProfile?.rollNo || "No Roll"})
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-zinc-500">
                                                {item.student?.studentProfile?.hostelBlock} — Room{" "}
                                                {item.student?.studentProfile?.roomNo} | Phone: {item.student?.phone}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={item.status} />
                                        {item.isCurfewExtension && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                                Curfew (Post 10:30 PM)
                                            </span>
                                        )}
                                        {item.passCode && (
                                            <span className="font-mono font-bold text-xs bg-zinc-100 px-2 py-0.5 rounded text-zinc-900 border border-zinc-200">
                                                {item.passCode}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Destination & Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                                    <div>
                                        <span className="text-zinc-400 block">Outpass Type</span>
                                        <span className="font-semibold text-zinc-900 capitalize">
                                            {item.outpassType.replace("_", " ")}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-400 block">Destination</span>
                                        <span className="font-semibold text-zinc-900">{item.destination}</span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-400 block">Reason</span>
                                        <span className="font-semibold text-zinc-800">{item.reason}</span>
                                    </div>
                                </div>

                                {/* Timeframes & Proof */}
                                <div className="bg-zinc-50 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs mb-3">
                                    <div className="flex gap-6">
                                        <div>
                                            <span className="text-zinc-400 block text-[10px]">Departing</span>
                                            <span className="font-semibold text-zinc-900">
                                                {new Date(item.departureTime).toLocaleString("en-IN", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-400 block text-[10px]">Expected Return</span>
                                            <span className="font-semibold text-zinc-900">
                                                {new Date(item.expectedReturnTime).toLocaleString("en-IN", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Proof preview if uploaded */}
                                    {item.proofDocument && (
                                        <a
                                            href={item.proofDocument}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-md hover:bg-sky-100 transition border border-sky-200"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            View Uploaded Proof
                                            <ExternalLink className="w-3 h-3 ml-0.5" />
                                        </a>
                                    )}
                                </div>

                                {/* Parent info for Curfew passes */}
                                {item.isCurfewExtension && (
                                    <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-xs mb-3 text-amber-900 flex flex-wrap gap-4">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-amber-800 block">
                                                Parent Phone
                                            </span>
                                            <span className="font-semibold">{item.parentPhone || "Not provided"}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-amber-800 block">
                                                Parent Email CC
                                            </span>
                                            <span className="font-semibold">{item.parentEmail || "Not provided"}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons for PENDING outpasses */}
                                {item.status === "PENDING" && (
                                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                                        <button
                                            onClick={() => handleOpenReview(item, "REJECT")}
                                            disabled={actionLoading === item._id}
                                            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-xs border border-rose-200 transition"
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleOpenReview(item, "APPROVE")}
                                            disabled={actionLoading === item._id}
                                            className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 font-bold text-xs shadow-xs transition"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                            Approve & Issue Pass Key
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Review Action Modal */}
            {reviewModal.open && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg border border-zinc-200 max-w-md w-full p-6">
                        <h3 className="text-base font-bold text-zinc-900 mb-1">
                            {reviewModal.action === "APPROVE" ? "Approve Outpass" : "Reject Outpass Application"}
                        </h3>
                        <p className="text-xs text-zinc-500 mb-4">
                            Student: {reviewModal.outpass?.student?.name} (
                            {reviewModal.outpass?.student?.studentProfile?.rollNo})
                        </p>

                        <form onSubmit={handleConfirmReview}>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                    Warden Remarks {reviewModal.action === "REJECT" ? "*" : "(Optional)"}
                                </label>
                                <textarea
                                    required={reviewModal.action === "REJECT"}
                                    value={reviewModal.remarks}
                                    onChange={(e) =>
                                        setReviewModal((prev) => ({ ...prev, remarks: e.target.value }))
                                    }
                                    placeholder={
                                        reviewModal.action === "APPROVE"
                                            ? "e.g. Approved. Parent confirmed."
                                            : "State the reason for rejection..."
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setReviewModal({ open: false, outpass: null, action: "APPROVE", remarks: "" })}
                                    className="py-1.5 px-3 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading === reviewModal.outpass?._id}
                                    className={`py-1.5 px-4 rounded-lg font-bold text-xs text-white transition ${
                                        reviewModal.action === "APPROVE"
                                            ? "bg-zinc-900 hover:bg-zinc-800"
                                            : "bg-rose-600 hover:bg-rose-700"
                                    }`}
                                >
                                    {reviewModal.action === "APPROVE" ? "Confirm & Issue Key" : "Confirm Rejection"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardenDashboard;
