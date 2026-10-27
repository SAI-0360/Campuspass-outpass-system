import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    MapPin,
    User,
    FileText,
    ExternalLink,
} from "lucide-react";

const ParentConsent = () => {
    const { token } = useParams();

    const [outpass, setOutpass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [result, setResult] = useState(null); // { status: 'APPROVED' | 'DENIED', message: '' }
    const [error, setError] = useState("");

    const fetchDetails = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get(`/parent/consent/${token}`);
            setOutpass(res.data?.outpass || null);

            // If already decided previously
            if (res.data?.outpass?.parentConsent?.status !== "PENDING") {
                setResult({
                    status: res.data.outpass.parentConsent.status,
                    message: `Consent was already recorded on ${new Date(
                        res.data.outpass.parentConsent.verifiedAt
                    ).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                    })}.`,
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired verification link.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchDetails();
    }, [token]);

    const handleDecision = async (decision) => {
        const confirmText =
            decision === "APPROVE"
                ? "Are you sure you want to GRANT permission for your ward to take this leave?"
                : "Are you sure you want to DENY permission for this outpass?";

        if (!window.confirm(confirmText)) return;

        setActionLoading(true);
        setError("");

        try {
            const res = await api.post(`/parent/consent/${token}/respond`, {
                decision,
                remarks,
            });

            setResult({
                status: res.data?.decision,
                message: res.data?.message,
            });
            fetchDetails(); // Reload state
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit decision. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold text-zinc-700">Loading leave details...</span>
                </div>
            </div>
        );
    }

    if (error && !outpass) {
        return (
            <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-zinc-200 shadow-sm text-center">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 mb-1">Invalid Verification Link</h2>
                    <p className="text-xs text-zinc-500 mb-4">{error}</p>
                    <span className="text-[11px] text-zinc-400">
                        Please verify the link sent to your registered mobile number or email.
                    </span>
                </div>
            </div>
        );
    }

    const isDecided = result || outpass?.parentConsent?.status !== "PENDING";
    const decisionStatus = result?.status || outpass?.parentConsent?.status;

    return (
        <div className="min-h-screen bg-zinc-100 flex flex-col font-sans py-8 px-4 sm:px-6">
            <div className="max-w-xl w-full mx-auto">
                {/* Branding Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 text-white font-bold text-xl shadow-xs mb-2">
                        CP
                    </div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Parent Consent Portal</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        University Hostel Digital Leave Verification System
                    </p>
                </div>

                {/* Visible Demo / Evaluation Notice */}
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900 shadow-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold">Demo / Testing Environment:</span> In live university production, this verification link is dispatched automatically to the parent's phone via SMS / WhatsApp (Twilio / Gupshup) and is never accessible to the student.
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    {/* Header Banner */}
                    <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                                Leave Application Type
                            </span>
                            <span className="text-base font-bold capitalize text-white">
                                {outpass?.outpassType.replace("_", " ")}
                            </span>
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">
                            ID: #{outpass?._id.slice(-6).toUpperCase()}
                        </span>
                    </div>

                    {/* Curfew warning */}
                    {outpass?.isCurfewExtension && (
                        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start gap-2.5 text-xs text-amber-900">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold block">10:30 PM Hostel Curfew Warning</span>
                                <span className="text-amber-800">
                                    Your ward is requesting to return past the university's 10:30 PM gate cutoff.
                                    Explicit parental authorization is mandatory before the Warden can approve this
                                    leave.
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="p-6 space-y-5">
                        {/* Student Info Box */}
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                🎓 Student Information
                            </span>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-zinc-500 block">Student Name</span>
                                    <span className="font-bold text-zinc-900">{outpass?.student?.name}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-500 block">Roll / Reg Number</span>
                                    <span className="font-bold font-mono text-zinc-900">
                                        {outpass?.student?.rollNo || "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-zinc-500 block">Hostel Block & Room</span>
                                    <span className="font-semibold text-zinc-800">
                                        {outpass?.student?.hostelBlock} • Room {outpass?.student?.roomNo}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-zinc-500 block">Department</span>
                                    <span className="font-semibold text-zinc-800">
                                        {outpass?.student?.department || "Engineering"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Outpass Schedule */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-xs">
                                <span className="text-zinc-400 font-medium block mb-1">Departure Time</span>
                                <span className="font-bold text-zinc-900 block">
                                    {new Date(outpass?.departureTime).toLocaleString("en-IN", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </span>
                            </div>
                            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-xs">
                                <span className="text-zinc-400 font-medium block mb-1">Expected Return Time</span>
                                <span className="font-bold text-zinc-900 block">
                                    {new Date(outpass?.expectedReturnTime).toLocaleString("en-IN", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Destination & Reason */}
                        <div className="space-y-3 text-xs">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                                <div>
                                    <span className="text-zinc-500 font-medium">Destination: </span>
                                    <span className="font-bold text-zinc-900">{outpass?.destination}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                                <div>
                                    <span className="text-zinc-500 font-medium">Reason for Leave: </span>
                                    <span className="font-semibold text-zinc-800">{outpass?.reason}</span>
                                </div>
                            </div>
                        </div>

                        {/* Attachment Link if available */}
                        {outpass?.proofDocument && (
                            <div className="pt-2">
                                <a
                                    href={outpass.proofDocument}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-2 rounded-lg transition"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    View Attached Travel / Event Proof Document
                                </a>
                            </div>
                        )}

                        {/* Decision Outcome Card (if already decided) */}
                        {isDecided ? (
                            <div
                                className={`p-4 rounded-xl border text-center ${
                                    decisionStatus === "APPROVED"
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                        : "bg-rose-50 border-rose-200 text-rose-900"
                                }`}
                            >
                                <div className="flex justify-center mb-2">
                                    {decisionStatus === "APPROVED" ? (
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                    ) : (
                                        <XCircle className="w-8 h-8 text-rose-600" />
                                    )}
                                </div>
                                <h3 className="text-sm font-bold">
                                    {decisionStatus === "APPROVED"
                                        ? "Permission Granted by Parent"
                                        : "Permission Denied by Parent"}
                                </h3>
                                <p className="text-xs mt-1 text-zinc-600">
                                    {result?.message ||
                                        `This consent decision was recorded. Current outpass status is '${outpass?.status}'.`}
                                </p>
                                {outpass?.parentConsent?.parentRemarks && (
                                    <p className="text-xs italic mt-2 text-zinc-500">
                                        Parent Note: "{outpass.parentConsent.parentRemarks}"
                                    </p>
                                )}
                            </div>
                        ) : (
                            /* Parent Action Form */
                            <div className="pt-4 border-t border-zinc-200 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                        Remarks / Instructions for Warden (Optional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="e.g. He is permitted to attend the event. Please ensure he returns before 11:30 PM."
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => handleDecision("DENY")}
                                        disabled={actionLoading}
                                        className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4 text-rose-600" />
                                        Deny Permission
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDecision("APPROVE")}
                                        disabled={actionLoading}
                                        className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                        Grant Permission
                                    </button>
                                </div>

                                <p className="text-[11px] text-zinc-400 text-center">
                                    By clicking "Grant Permission", you formally authorize the hostel warden to issue
                                    the gate pass for your ward.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentConsent;
