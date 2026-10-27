import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import { PlusCircle, History, Clock, MapPin, AlertCircle, XCircle, ExternalLink, CheckCircle2 } from "lucide-react";

const StudentDashboard = () => {
    const [activePass, setActivePass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const fetchActivePass = async () => {
        try {
            setLoading(true);
            const res = await api.get("/student/active-pass");
            setActivePass(res.data?.activePass || null);
        } catch (err) {
            console.error("Error fetching active pass:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivePass();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this pending outpass request?")) return;
        setCancelLoading(true);
        setError("");
        setMessage("");

        try {
            await api.patch(`/student/${id}/cancel`);
            setMessage("Outpass request cancelled successfully.");
            setActivePass(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to cancel outpass.");
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
                {/* Header Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Student Outpass Portal</h1>
                        <p className="text-xs text-zinc-500 mt-0.5">Manage your digital leave pass and gate authorizations</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/apply"
                            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs shadow-xs transition"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Apply New Outpass
                        </Link>
                        <Link
                            to="/history"
                            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs border border-zinc-300 transition"
                        >
                            <History className="w-4 h-4 text-zinc-500" />
                            History
                        </Link>
                    </div>
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

                {/* Main Content Area */}
                {loading ? (
                    <div className="text-center py-16 text-zinc-500 text-sm">
                        <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Checking active outpass status...
                    </div>
                ) : !activePass ? (
                    /* Empty State */
                    <div className="bg-white p-10 rounded-xl border border-zinc-200 text-center shadow-xs">
                        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-zinc-400" />
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 mb-1">No Active Outpass</h3>
                        <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
                            You currently do not have any pending or approved outpasses. You can apply for a new pass anytime.
                        </p>
                        <Link
                            to="/apply"
                            className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Apply for Outpass
                        </Link>
                    </div>
                ) : (
                    /* Active Pass Card */
                    <div className="bg-white rounded-xl border border-zinc-300 shadow-sm overflow-hidden">
                        {/* Top banner */}
                        <div className="bg-zinc-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                                    Current Outpass Status
                                </span>
                                <div className="flex items-center gap-3 mt-1">
                                    <StatusBadge status={activePass.status} />
                                    <span className="text-xs text-zinc-300 font-medium capitalize">
                                        Type: {activePass.outpassType.replace("_", " ")}
                                    </span>
                                </div>
                            </div>

                            {activePass.passCode && (
                                <div className="text-right">
                                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-semibold">
                                        Gate Pass Key
                                    </span>
                                    <span className="text-2xl font-black font-mono tracking-widest text-emerald-400">
                                        {activePass.passCode}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Stage 1: Awaiting Parent Authorization */}
                        {activePass.status === "AWAITING_PARENT" && (
                            <div className="bg-amber-50 border-b border-amber-200 p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0 pr-0 sm:pr-4">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                                            Stage 1 of 2: Awaiting Parent Authorization
                                        </div>
                                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                            Verification link dispatched to parent (
                                            <span className="font-semibold text-amber-950">{activePass.parentPhone || "Registered Contact"}</span>
                                            ). The Warden cannot review this request until parental consent is granted.
                                        </p>
                                    </div>
                                    {/* In real-world production, this link is delivered strictly to the parent's phone via SMS/WhatsApp.
                                        For local testing and academic evaluation, this 1-click test link allows instant simulation. */}
                                    {activePass.parentConsent?.token && (
                                        <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5">
                                            <a
                                                href={`/parent-consent/${activePass.parentConsent.token}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg shadow-xs transition"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Open Parent Consent Portal
                                            </a>
                                            <span className="text-[10px] text-amber-800 font-medium flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                Demo Link &bull; Sent via SMS in production
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Stage 2: Parent Authorized */}
                        {activePass.parentConsent?.status === "APPROVED" && (
                            <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-800 font-medium">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>
                                        Parent Consent Verified on{" "}
                                        {new Date(activePass.parentConsent.verifiedAt).toLocaleString("en-IN", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </span>
                                </div>
                                {activePass.parentConsent.parentRemarks && (
                                    <span className="text-[11px] italic text-emerald-700">
                                        "{activePass.parentConsent.parentRemarks}"
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Curfew alert banner */}
                        {activePass.isCurfewExtension && (
                            <div className="bg-amber-50/50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-800 font-medium">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Curfew Extension Pass (Past 10:30 PM entry cutoff). Parent contact logged.</span>
                            </div>
                        )}

                        {/* Details grid */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                                    <span className="text-xs text-zinc-400 font-medium block mb-1">Departure Time</span>
                                    <span className="text-sm font-bold text-zinc-900">
                                        {new Date(activePass.departureTime).toLocaleString("en-IN", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </span>
                                </div>
                                <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                                    <span className="text-xs text-zinc-400 font-medium block mb-1">Expected Return Time</span>
                                    <span className="text-sm font-bold text-zinc-900">
                                        {new Date(activePass.expectedReturnTime).toLocaleString("en-IN", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                                    <div>
                                        <span className="font-semibold text-zinc-700">Destination: </span>
                                        <span className="text-zinc-900 font-medium">{activePass.destination}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0 font-bold text-center">?</div>
                                    <div>
                                        <span className="font-semibold text-zinc-700">Reason: </span>
                                        <span className="text-zinc-900 font-medium">{activePass.reason}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Warden remarks if available */}
                            {activePass.wardenReview?.remarks && (
                                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-xs">
                                    <span className="font-semibold text-zinc-700 block mb-0.5">Warden Remarks:</span>
                                    <span className="text-zinc-600 italic">"{activePass.wardenReview.remarks}"</span>
                                </div>
                            )}

                            {/* Action to cancel if pending or awaiting parent */}
                            {(activePass.status === "PENDING" || activePass.status === "AWAITING_PARENT") && (
                                <div className="pt-2 border-t border-zinc-200 flex justify-end">
                                    <button
                                        onClick={() => handleCancel(activePass._id)}
                                        disabled={cancelLoading}
                                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold border border-rose-200 transition disabled:opacity-50"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                        {cancelLoading ? "Cancelling..." : "Cancel Outpass Application"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
