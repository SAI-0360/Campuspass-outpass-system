import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import { ArrowLeft, PlusCircle, Calendar, MapPin } from "lucide-react";

const OutpassHistory = () => {
    const [outpasses, setOutpasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await api.get("/student/my-outpasses");
                setOutpasses(res.data?.outpasses || []);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition mb-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Active Pass
                        </Link>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Outpass History</h1>
                        <p className="text-xs text-zinc-500">Record of all your past leave applications and gate logs</p>
                    </div>

                    <Link
                        to="/apply"
                        className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs shadow-xs transition"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Apply Outpass
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-zinc-500 text-sm">
                        <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Loading your outpass records...
                    </div>
                ) : outpasses.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl border border-zinc-200 text-center shadow-xs">
                        <Calendar className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                        <h3 className="text-base font-bold text-zinc-900 mb-1">No Past Outpasses</h3>
                        <p className="text-xs text-zinc-500 mb-4">You have not submitted any outpass applications yet.</p>
                        <Link
                            to="/apply"
                            className="inline-block py-2 px-4 rounded-lg bg-zinc-900 text-white font-bold text-xs"
                        >
                            Submit First Application
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {outpasses.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white rounded-xl border border-zinc-200 shadow-xs p-5 hover:border-zinc-300 transition"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <StatusBadge
                                            status={item.status}
                                            wasLate={item.gateLog?.wasLate}
                                            lateMinutes={item.gateLog?.lateMinutes}
                                        />
                                        <span className="text-xs font-semibold text-zinc-700 capitalize">
                                            {item.outpassType.replace("_", " ")}
                                        </span>
                                        {item.isCurfewExtension && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                                Curfew Pass
                                            </span>
                                        )}
                                    </div>

                                    {item.passCode && (
                                        <span className="font-mono font-bold text-xs bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200 text-zinc-900">
                                            Key: {item.passCode}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                                    <div className="flex items-start gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-zinc-500">Destination: </span>
                                            <span className="font-semibold text-zinc-900">{item.destination}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-zinc-500">Reason: </span>
                                        <span className="text-zinc-800 font-medium">{item.reason}</span>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 p-2.5 rounded-lg flex flex-wrap justify-between gap-2 text-[11px] text-zinc-600">
                                    <div>
                                        <span className="text-zinc-400 block">Departed</span>
                                        <span className="font-semibold text-zinc-800">
                                            {new Date(item.departureTime).toLocaleString("en-IN", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-400 block">Expected Return</span>
                                        <span className="font-semibold text-zinc-800">
                                            {new Date(item.expectedReturnTime).toLocaleString("en-IN", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    {item.gateLog?.actualExitTime && (
                                        <div>
                                            <span className="text-zinc-400 block">Gate Exit</span>
                                            <span className="font-semibold text-sky-700">
                                                {new Date(item.gateLog.actualExitTime).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    {item.gateLog?.actualReturnTime && (
                                        <div>
                                            <span className="text-zinc-400 block">Gate Return</span>
                                            <span
                                                className={`font-semibold ${
                                                    item.gateLog.wasLate ? "text-rose-700" : "text-emerald-700"
                                                }`}
                                            >
                                                {new Date(item.gateLog.actualReturnTime).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {item.wardenReview?.remarks && (
                                    <div className="mt-2 text-[11px] text-zinc-500 italic">
                                        Warden note: "{item.wardenReview.remarks}"
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OutpassHistory;
