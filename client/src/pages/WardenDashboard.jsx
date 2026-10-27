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
    ChevronDown,
    ChevronUp,
    CheckCheck,
} from "lucide-react";

const WardenDashboard = () => {
    const [stats, setStats] = useState(null);
    const [outpasses, setOutpasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("PENDING"); // 'PENDING' | 'LATE' | 'ALL' | 'EXITED'
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [acknowledgeLoading, setAcknowledgeLoading] = useState(null);
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

    const handleAcknowledge = async (outpassId) => {
        setAcknowledgeLoading(outpassId);
        setError("");
        setMessage("");

        try {
            const res = await api.patch(`/warden/${outpassId}/acknowledge`);
            setMessage(res.data?.message || "Outpass marked as reviewed.");
            setOutpasses((prev) =>
                prev.map((item) =>
                    item._id === outpassId
                        ? {
                              ...item,
                              wardenReview: {
                                  ...item.wardenReview,
                                  isAcknowledged: true,
                                  acknowledgedAt: new Date(),
                              },
                          }
                        : item
                )
            );
        } catch (err) {
            setError(err.response?.data?.message || "Failed to mark as reviewed.");
        } finally {
            setAcknowledgeLoading(null);
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
                        <button
                            onClick={() => setActiveTab("PENDING")}
                            className={`text-left p-4 rounded-xl border transition shadow-xs cursor-pointer ${
                                activeTab === "PENDING"
                                    ? "bg-amber-50/50 border-amber-300 ring-2 ring-amber-400"
                                    : "bg-white border-zinc-200 hover:border-zinc-300"
                            }`}
                        >
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Pending Review
                            </span>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-2xl font-black text-amber-600">{stats.pendingCount}</span>
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab("ALL")}
                            className={`text-left p-4 rounded-xl border transition shadow-xs cursor-pointer ${
                                activeTab === "ALL"
                                    ? "bg-purple-50/50 border-purple-300 ring-2 ring-purple-400"
                                    : "bg-white border-zinc-200 hover:border-zinc-300"
                            }`}
                        >
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Curfew Extensions
                            </span>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-2xl font-black text-purple-600">{stats.curfewPendingCount}</span>
                                <AlertTriangle className="w-5 h-5 text-purple-500" />
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab("EXITED")}
                            className={`text-left p-4 rounded-xl border transition shadow-xs cursor-pointer ${
                                activeTab === "EXITED"
                                    ? "bg-sky-50/50 border-sky-300 ring-2 ring-sky-400"
                                    : "bg-white border-zinc-200 hover:border-zinc-300"
                            }`}
                        >
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Outside Campus
                            </span>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-2xl font-black text-sky-600">{stats.outsideCount}</span>
                                <UserCheck className="w-5 h-5 text-sky-500" />
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab("LATE")}
                            className={`text-left p-4 rounded-xl border transition shadow-xs cursor-pointer ${
                                activeTab === "LATE"
                                    ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400"
                                    : stats.overdueCount > 0
                                    ? "bg-rose-50/40 border-rose-200 hover:border-rose-300"
                                    : "bg-white border-zinc-200 hover:border-zinc-300"
                            }`}
                        >
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block flex items-center justify-between">
                                Overdue Returns
                                {stats.overdueCount > 0 && (
                                    <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold">
                                        ACTION
                                    </span>
                                )}
                            </span>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-2xl font-black text-rose-600">{stats.overdueCount}</span>
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                            </div>
                        </button>
                    </div>
                )}

                {/* Filter Tabs & Search */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1 bg-zinc-100 p-1 rounded-lg">
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
                            onClick={() => setActiveTab("LATE")}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                                activeTab === "LATE"
                                    ? "bg-rose-600 text-white shadow-xs"
                                    : stats?.overdueCount > 0
                                    ? "text-rose-700 font-black hover:bg-rose-100"
                                    : "text-zinc-600 hover:text-zinc-900"
                            }`}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Late & Overdue ({stats?.overdueCount || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab("ALL")}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                                activeTab === "ALL"
                                    ? "bg-white text-zinc-900 shadow-xs"
                                    : "text-zinc-600 hover:text-zinc-900"
                            }`}
                        >
                            All Outpasses ({stats?.totalCount || outpasses.length})
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
                                : activeTab === "LATE"
                                ? "Zero overdue or late returns recorded! All students are in good standing."
                                : "No outpasses match your current search query."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {outpasses.map((item) => {
                            const isExpanded = expandedId === item._id;
                            const isLate = item.gateLog?.wasLate;
                            const isOverdue = item.status === "EXITED" && new Date(item.expectedReturnTime) < new Date();
                            const isAcknowledged = item.wardenReview?.isAcknowledged;

                            return (
                                <div
                                    key={item._id}
                                    className={`bg-white rounded-xl border transition-all duration-150 shadow-xs overflow-hidden ${
                                        isExpanded
                                            ? "border-zinc-400 ring-1 ring-zinc-300"
                                            : "border-zinc-200 hover:border-zinc-300"
                                    }`}
                                >
                                    {/* Tile Header (Click to expand one at a time) */}
                                    <div
                                        onClick={() => setExpandedId(isExpanded ? null : item._id)}
                                        className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none hover:bg-zinc-50/70 transition"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                                {item.student?.name?.[0] || "S"}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-bold text-zinc-900">
                                                        {item.student?.name}
                                                    </span>
                                                    <span className="text-[11px] text-zinc-500 font-mono">
                                                        ({item.student?.studentProfile?.rollNo || "No Roll"})
                                                    </span>
                                                    <span className="text-[11px] text-zinc-300">·</span>
                                                    <span className="text-[11px] text-zinc-600">
                                                        {item.student?.studentProfile?.hostelBlock || "Hostel"} — Rm {item.student?.studentProfile?.roomNo || "N/A"}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-zinc-500 mt-0.5 truncate flex items-center gap-1.5">
                                                    <span className="capitalize font-medium text-zinc-700">
                                                        {item.outpassType.replace("_", " ")}
                                                    </span>
                                                    <span className="text-zinc-400">→</span>
                                                    <span className="font-semibold text-zinc-800">
                                                        {item.destination}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {item.passCode && (
                                                <span className="font-mono font-bold text-xs bg-zinc-100 px-2 py-0.5 rounded text-zinc-900 border border-zinc-200">
                                                    {item.passCode}
                                                </span>
                                            )}

                                            <StatusBadge status={item.status} />

                                            {isLate && (
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-600 text-white shadow-xs">
                                                    ⚠️ LATE (+{item.gateLog.lateMinutes}m)
                                                </span>
                                            )}

                                            {isOverdue && (
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-600 text-white shadow-xs animate-pulse">
                                                    ⚠️ OVERDUE
                                                </span>
                                            )}

                                            {item.isCurfewExtension && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 hidden sm:inline-block">
                                                    Curfew
                                                </span>
                                            )}

                                            {/* Reviewed status indicator on tile */}
                                            {isAcknowledged ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    <CheckCheck className="w-3 h-3 text-emerald-600" />
                                                    Reviewed
                                                </span>
                                            ) : (isLate || isOverdue) ? (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                                    Needs Review
                                                </span>
                                            ) : null}

                                            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 ml-1">
                                                {isExpanded ? (
                                                    <ChevronUp className="w-4 h-4 text-zinc-700" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Detail View (Only one tile expanded at a time) */}
                                    {isExpanded && (
                                        <div className="border-t border-zinc-200 bg-zinc-50/60 p-5 space-y-4">
                                            {/* Overdue or Late Return Warning Banners */}
                                            {isLate && (
                                                <div className="bg-rose-50 border border-rose-300 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 text-rose-900 font-bold">
                                                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                                        <span>LATE RETURN AUDIT FLAGGED: {item.gateLog.lateMinutes} MINUTES OVERDUE</span>
                                                    </div>
                                                    <div className="text-[11px] text-rose-800 font-medium">
                                                        Expected: {new Date(item.expectedReturnTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} | Actual Return: {new Date(item.gateLog.actualReturnTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                    </div>
                                                </div>
                                            )}

                                            {isOverdue && (
                                                <div className="bg-rose-50 border border-rose-300 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2 animate-pulse">
                                                    <div className="flex items-center gap-2 text-rose-900 font-bold">
                                                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                                        <span>CURRENTLY OVERDUE — STUDENT HAS NOT CHECKED IN AT GATE</span>
                                                    </div>
                                                    <div className="text-[11px] text-rose-800 font-medium">
                                                        Approved return was: {new Date(item.expectedReturnTime).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Destination & Details Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-lg border border-zinc-200">
                                                <div>
                                                    <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider">Outpass Type</span>
                                                    <span className="font-semibold text-zinc-900 capitalize">
                                                        {item.outpassType.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider">Destination</span>
                                                    <span className="font-semibold text-zinc-900">{item.destination}</span>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider">Reason</span>
                                                    <span className="font-semibold text-zinc-800">{item.reason}</span>
                                                </div>
                                            </div>

                                            {/* Timeframes & Proof */}
                                            <div className="bg-white p-3.5 rounded-lg border border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                                                <div className="flex flex-wrap gap-6">
                                                    <div>
                                                        <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider">Departure</span>
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
                                                        <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider">Expected Return</span>
                                                        <span className="font-semibold text-zinc-900">
                                                            {new Date(item.expectedReturnTime).toLocaleString("en-IN", {
                                                                month: "short",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider">Student Phone</span>
                                                        <span className="font-semibold text-zinc-900">{item.student?.phone || "N/A"}</span>
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

                                            {/* Parent info & Consent for Curfew passes */}
                                            {item.parentConsent?.status === "APPROVED" && (
                                                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 font-bold">
                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                        Parent Consent Verified ({new Date(item.parentConsent.verifiedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })})
                                                    </div>
                                                    {item.parentConsent.parentRemarks && (
                                                        <div className="text-[11px] italic text-emerald-800">
                                                            "{item.parentConsent.parentRemarks}"
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {item.isCurfewExtension && (
                                                <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 flex flex-wrap gap-4">
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

                                            {/* Gate Security Audit Log (Exit & Return Records with Photos) */}
                                            {(item.gateLog?.actualExitTime || item.gateLog?.actualReturnTime) && (
                                                <div className="bg-white border border-zinc-200 rounded-lg p-3 text-xs space-y-2">
                                                    <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center justify-between">
                                                        <span>Gate Security Terminal Verification Log</span>
                                                        {item.gateLog.wasLate && (
                                                            <span className="text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded font-black text-[10px]">
                                                                ⚠️ OVERDUE BY {item.gateLog.lateMinutes} MINS
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {item.gateLog.actualExitTime && (
                                                            <div className="flex items-center gap-3 bg-zinc-50 p-2.5 rounded-md border border-zinc-200">
                                                                {item.gateLog.exitPhoto ? (
                                                                    <a href={item.gateLog.exitPhoto} target="_blank" rel="noopener noreferrer" title="View Full Exit Photo">
                                                                        <img
                                                                            src={item.gateLog.exitPhoto}
                                                                            alt="Exit Photo"
                                                                            className="w-12 h-12 rounded-md object-cover border border-zinc-300 shrink-0 hover:opacity-80 transition"
                                                                        />
                                                                    </a>
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-md bg-zinc-100 flex items-center justify-center text-[9px] text-zinc-400 font-bold shrink-0">
                                                                        NO PHOTO
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className="text-[10px] text-zinc-400 block font-semibold">EXIT CONFIRMED</span>
                                                                    <span className="font-bold text-zinc-900 block text-xs">
                                                                        {new Date(item.gateLog.actualExitTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                                    </span>
                                                                    <span className="text-[10px] text-zinc-500">
                                                                        Officer: {item.gateLog.exitGuard?.name || "Gate Guard"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {item.gateLog.actualReturnTime && (
                                                            <div className={`flex items-center gap-3 p-2.5 rounded-md border ${item.gateLog.wasLate ? "bg-rose-50/70 border-rose-200" : "bg-zinc-50 border-zinc-200"}`}>
                                                                {item.gateLog.returnPhoto ? (
                                                                    <a href={item.gateLog.returnPhoto} target="_blank" rel="noopener noreferrer" title="View Full Return Photo">
                                                                        <img
                                                                            src={item.gateLog.returnPhoto}
                                                                            alt="Return Photo"
                                                                            className="w-12 h-12 rounded-md object-cover border border-zinc-300 shrink-0 hover:opacity-80 transition"
                                                                        />
                                                                    </a>
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-md bg-zinc-100 flex items-center justify-center text-[9px] text-zinc-400 font-bold shrink-0">
                                                                        NO PHOTO
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className="text-[10px] text-zinc-400 block font-semibold">RETURN CONFIRMED</span>
                                                                    <span className="font-bold text-zinc-900 block text-xs">
                                                                        {new Date(item.gateLog.actualReturnTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                                    </span>
                                                                    <span className="text-[10px] text-zinc-500">
                                                                        Officer: {item.gateLog.returnGuard?.name || "Gate Guard"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action & Review Section */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-200">
                                                {/* Left: Review Status Indication */}
                                                <div>
                                                    {isAcknowledged ? (
                                                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                                                            <CheckCheck className="w-4 h-4 text-emerald-600" />
                                                            <span>
                                                                Marked as Reviewed {item.wardenReview?.acknowledgedAt && `on ${new Date(item.wardenReview.acknowledgedAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-zinc-500 italic">
                                                            {item.status === "PENDING"
                                                                ? "Pending decision from warden"
                                                                : "Awaiting warden review acknowledgment"}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="flex items-center gap-2">
                                                    {item.status === "PENDING" && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenReview(item, "REJECT");
                                                                }}
                                                                disabled={actionLoading === item._id}
                                                                className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-xs border border-rose-200 transition cursor-pointer"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                Reject
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenReview(item, "APPROVE");
                                                                }}
                                                                disabled={actionLoading === item._id}
                                                                className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 font-bold text-xs shadow-xs transition cursor-pointer"
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                                                Approve & Issue Pass Key
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Mark as Reviewed Button: shown when not yet acknowledged */}
                                                    {!isAcknowledged && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAcknowledge(item._id);
                                                            }}
                                                            disabled={acknowledgeLoading === item._id}
                                                            className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg text-white bg-emerald-700 hover:bg-emerald-800 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                                                            title="Mark as reviewed so this outpass is acknowledged and not reviewed again"
                                                        >
                                                            <CheckCheck className="w-4 h-4" />
                                                            {acknowledgeLoading === item._id ? "Saving..." : "Mark as Reviewed"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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

                        {reviewModal.outpass?.parentConsent?.status === "APPROVED" && (
                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                                <span className="font-bold block">✅ Parent Consent Verified</span>
                                <span className="text-[11px] text-emerald-800 block">
                                    Verified on {new Date(reviewModal.outpass.parentConsent.verifiedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                </span>
                                {reviewModal.outpass.parentConsent.parentRemarks && (
                                    <span className="text-[11px] italic block mt-1 text-emerald-700">
                                        Parent Note: "{reviewModal.outpass.parentConsent.parentRemarks}"
                                    </span>
                                )}
                            </div>
                        )}

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
