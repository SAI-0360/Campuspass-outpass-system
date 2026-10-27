import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import {
    Shield,
    Search,
    Camera,
    LogOut,
    LogIn,
    CheckCircle,
    AlertTriangle,
    Clock,
    User,
    MapPin,
    Calendar,
    X,
} from "lucide-react";

const GuardDashboard = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");

    const [activeTab, setActiveTab] = useState("EXIT"); // 'EXIT' | 'RETURN'
    const [feeds, setFeeds] = useState({ readyForExit: [], currentlyOutside: [] });
    const [feedsLoading, setFeedsLoading] = useState(true);

    const [actionModal, setActionModal] = useState({
        open: false,
        type: "EXIT", // 'EXIT' or 'RETURN'
        outpass: null,
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [lastActionAlert, setLastActionAlert] = useState(null); // { type: 'success' | 'late', message, lateMinutes }
    const [error, setError] = useState("");

    const fetchFeeds = async () => {
        try {
            setFeedsLoading(true);
            const res = await api.get("/guard/feeds");
            setFeeds({
                readyForExit: res.data?.readyForExit || [],
                currentlyOutside: res.data?.currentlyOutside || [],
            });
        } catch (err) {
            console.error("Error fetching feeds:", err);
        } finally {
            setFeedsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeds();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearchLoading(true);
        setSearchError("");
        setSearchResult(null);

        try {
            const res = await api.get(`/guard/lookup/${encodeURIComponent(searchQuery.trim())}`);
            setSearchResult(res.data?.outpass || null);
        } catch (err) {
            setSearchError(err.response?.data?.message || "No matching outpass found.");
        } finally {
            setSearchLoading(false);
        }
    };

    const openActionModal = (outpass, type) => {
        setActionModal({
            open: true,
            type,
            outpass,
        });
        setPhotoFile(null);
        setError("");
    };

    const handleConfirmAction = async (e) => {
        e.preventDefault();
        const { outpass, type } = actionModal;
        if (!outpass) return;

        setActionLoading(true);
        setError("");

        try {
            const formData = new FormData();
            if (photoFile) {
                formData.append("photo", photoFile);
            }

            const endpoint = type === "EXIT" ? `/guard/${outpass._id}/exit` : `/guard/${outpass._id}/return`;
            const res = await api.patch(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (type === "RETURN") {
                if (res.data?.wasLate) {
                    setLastActionAlert({
                        type: "late",
                        message: `LATE RETURN: ${outpass.student?.name} returned ${res.data.lateMinutes} minutes late!`,
                        lateMinutes: res.data.lateMinutes,
                    });
                } else {
                    setLastActionAlert({
                        type: "success",
                        message: `On-Time Return: ${outpass.student?.name} returned on schedule.`,
                    });
                }
            } else {
                setLastActionAlert({
                    type: "success",
                    message: `Exit confirmed: ${outpass.student?.name} has left campus.`,
                });
            }

            setActionModal({ open: false, type: "EXIT", outpass: null });
            setSearchResult(null);
            setSearchQuery("");
            fetchFeeds(); // Refresh lists
        } catch (err) {
            setError(err.response?.data?.message || "Failed to record gate verification.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-zinc-900 text-white">
                                <Shield className="w-5 h-5" />
                            </span>
                            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Gate Security Terminal</h1>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            Verify student passkeys, capture gate photos, and log campus departure & returns
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            Main Gate Online
                        </span>
                    </div>
                </div>

                {/* Instant Alert Banner (e.g. Late Return Alert) */}
                {lastActionAlert && (
                    <div
                        className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-3 shadow-xs ${
                            lastActionAlert.type === "late"
                                ? "bg-rose-50 border-rose-300 text-rose-900"
                                : "bg-emerald-50 border-emerald-300 text-emerald-900"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            {lastActionAlert.type === "late" ? (
                                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                            ) : (
                                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                            )}
                            <div>
                                <span className="text-xs font-bold block uppercase tracking-wider">
                                    {lastActionAlert.type === "late" ? "Gate Alert" : "Gate Confirmation"}
                                </span>
                                <span className="text-sm font-semibold">{lastActionAlert.message}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setLastActionAlert(null)}
                            className="p-1 text-zinc-400 hover:text-zinc-600 rounded-md"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Fast Search Box */}
                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs mb-6">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter Pass Code (e.g. CP-1234) or Student Roll Number..."
                                className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 uppercase font-mono placeholder:normal-case placeholder:font-sans"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={searchLoading}
                            className="py-2 px-5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg shadow-xs transition disabled:opacity-50 shrink-0"
                        >
                            {searchLoading ? "Searching..." : "Lookup Pass"}
                        </button>
                    </form>

                    {searchError && (
                        <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                            {searchError}
                        </div>
                    )}

                    {/* Search Result Card */}
                    {searchResult && (
                        <div className="mt-4 p-4 rounded-xl border-2 border-zinc-900 bg-zinc-50 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3 mb-3">
                                <div>
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                                        Verified Student Pass
                                    </span>
                                    <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                        {searchResult.student?.name}
                                        <span className="text-xs text-zinc-500 font-normal">
                                            ({searchResult.student?.studentProfile?.rollNo})
                                        </span>
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        {searchResult.student?.studentProfile?.hostelBlock} — Room{" "}
                                        {searchResult.student?.studentProfile?.roomNo}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-xs font-mono font-black text-zinc-900 block bg-white px-2 py-1 rounded border border-zinc-300">
                                        Key: {searchResult.passCode}
                                    </span>
                                    <div className="mt-1">
                                        <StatusBadge status={searchResult.status} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                <div>
                                    <span className="text-zinc-400 block text-[10px]">Destination</span>
                                    <span className="font-semibold text-zinc-900">{searchResult.destination}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-400 block text-[10px]">Expected Return</span>
                                    <span className="font-semibold text-zinc-900">
                                        {new Date(searchResult.expectedReturnTime).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Guard Action Buttons */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                                {searchResult.status === "APPROVED" && (
                                    <button
                                        onClick={() => openActionModal(searchResult, "EXIT")}
                                        className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg bg-zinc-900 text-white font-bold text-xs shadow-xs hover:bg-zinc-800 transition"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        Record Gate Exit (Take Photo)
                                    </button>
                                )}
                                {searchResult.status === "EXITED" && (
                                    <button
                                        onClick={() => openActionModal(searchResult, "RETURN")}
                                        className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition"
                                    >
                                        <LogIn className="w-3.5 h-3.5" />
                                        Record Gate Return (Verify Time)
                                    </button>
                                )}
                                {searchResult.status === "RETURNED" && (
                                    <span className="text-xs text-zinc-500 italic py-1">
                                        This outpass is already completed.
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Live Feeds Tab Navigation */}
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab("EXIT")}
                        className={`py-2 px-4 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === "EXIT"
                                ? "bg-zinc-900 text-white shadow-xs"
                                : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200"
                        }`}
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Ready for Departure ({feeds.readyForExit.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("RETURN")}
                        className={`py-2 px-4 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === "RETURN"
                                ? "bg-zinc-900 text-white shadow-xs"
                                : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200"
                        }`}
                    >
                        <LogIn className="w-3.5 h-3.5" />
                        Currently Outside Campus ({feeds.currentlyOutside.length})
                    </button>
                </div>

                {/* Feeds Content */}
                {feedsLoading ? (
                    <div className="text-center py-16 text-zinc-500 text-sm">
                        <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Refreshing gate feeds...
                    </div>
                ) : activeTab === "EXIT" ? (
                    /* Ready for Exit List */
                    feeds.readyForExit.length === 0 ? (
                        <div className="bg-white p-10 rounded-xl border border-zinc-200 text-center shadow-xs">
                            <CheckCircle className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                            <h3 className="text-sm font-bold text-zinc-900 mb-0.5">No Students Waiting to Depart</h3>
                            <p className="text-xs text-zinc-500">All approved passes have either departed or none are pending today.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {feeds.readyForExit.map((item) => (
                                <div
                                    key={item._id}
                                    className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-3 hover:border-zinc-300 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-800">
                                            {item.student?.name?.[0] || "S"}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-zinc-900">
                                                {item.student?.name}
                                                <span className="font-normal text-zinc-500 ml-1.5">
                                                    ({item.student?.studentProfile?.rollNo})
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-zinc-500">
                                                {item.destination} | Pass Key:{" "}
                                                <span className="font-mono font-bold text-zinc-800">{item.passCode}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => openActionModal(item, "EXIT")}
                                        className="py-1.5 px-3.5 rounded-lg bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition flex items-center gap-1.5"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                        Confirm Exit
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* Currently Outside List */
                    feeds.currentlyOutside.length === 0 ? (
                        <div className="bg-white p-10 rounded-xl border border-zinc-200 text-center shadow-xs">
                            <CheckCircle className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                            <h3 className="text-sm font-bold text-zinc-900 mb-0.5">No Students Outside Campus</h3>
                            <p className="text-xs text-zinc-500">All students with active outpasses are currently inside campus.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {feeds.currentlyOutside.map((item) => {
                                const isOverdue = new Date() > new Date(item.expectedReturnTime);
                                return (
                                    <div
                                        key={item._id}
                                        className={`bg-white p-4 rounded-xl border shadow-xs flex flex-wrap items-center justify-between gap-3 transition ${
                                            isOverdue ? "border-rose-300 bg-rose-50/30" : "border-zinc-200"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                                                    isOverdue
                                                        ? "bg-rose-100 text-rose-800 font-bold"
                                                        : "bg-zinc-100 text-zinc-800"
                                                }`}
                                            >
                                                {item.student?.name?.[0] || "S"}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                                                    {item.student?.name}
                                                    <span className="font-normal text-zinc-500">
                                                        ({item.student?.studentProfile?.rollNo})
                                                    </span>
                                                    {isOverdue && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                                                            OVERDUE
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-zinc-500">
                                                    Expected:{" "}
                                                    <span className="font-semibold text-zinc-800">
                                                        {new Date(item.expectedReturnTime).toLocaleTimeString("en-IN", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>{" "}
                                                    | Pass Key:{" "}
                                                    <span className="font-mono font-bold text-zinc-800">
                                                        {item.passCode}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => openActionModal(item, "RETURN")}
                                            className="py-1.5 px-3.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center gap-1.5"
                                        >
                                            <Camera className="w-3.5 h-3.5" />
                                            Confirm Return
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </main>

            {/* Action / Photo Capture Modal */}
            {actionModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg border border-zinc-200 max-w-sm w-full p-6">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-4">
                            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                <Camera className="w-4 h-4 text-zinc-700" />
                                {actionModal.type === "EXIT" ? "Gate Departure Verification" : "Gate Return Verification"}
                            </h3>
                            <button
                                onClick={() => setActionModal({ open: false, type: "EXIT", outpass: null })}
                                className="text-zinc-400 hover:text-zinc-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mb-4 text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                            <div>
                                <span className="font-bold text-zinc-900">{actionModal.outpass?.student?.name}</span> (
                                {actionModal.outpass?.student?.studentProfile?.rollNo})
                            </div>
                            <div className="text-[11px] text-zinc-500 mt-0.5">
                                Pass Code:{" "}
                                <span className="font-mono font-bold text-zinc-900">
                                    {actionModal.outpass?.passCode}
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleConfirmAction} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                                    Student Photo Verification
                                </label>
                                <div className="border border-dashed border-zinc-300 rounded-lg p-4 text-center bg-zinc-50 hover:border-zinc-400 transition">
                                    <Camera className="w-6 h-6 text-zinc-400 mx-auto mb-1" />
                                    <label className="cursor-pointer text-xs text-zinc-600">
                                        <span className="font-bold text-zinc-900 underline">Snap or choose photo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="user"
                                            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </label>
                                    {photoFile && (
                                        <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 py-0.5 px-2 rounded inline-block">
                                            {photoFile.name}
                                        </div>
                                    )}
                                    <p className="text-[10px] text-zinc-400 mt-1">
                                        (Optional in demo mode; uses gate camera in production)
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={() => setActionModal({ open: false, type: "EXIT", outpass: null })}
                                    className="py-1.5 px-3 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className={`py-1.5 px-4 rounded-lg font-bold text-xs text-white transition disabled:opacity-50 ${
                                        actionModal.type === "EXIT"
                                            ? "bg-zinc-900 hover:bg-zinc-800"
                                            : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                                >
                                    {actionLoading
                                        ? "Uploading & Verifying..."
                                        : actionModal.type === "EXIT"
                                        ? "Confirm Exit"
                                        : "Confirm Return"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuardDashboard;
