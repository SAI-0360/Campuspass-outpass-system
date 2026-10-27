import React from "react";

const StatusBadge = ({ status, wasLate, lateMinutes }) => {
    switch (status) {
        case "PENDING":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Pending Approval
                </span>
            );
        case "APPROVED":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
                    Approved
                </span>
            );
        case "EXITED":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                    Outside Campus
                </span>
            );
        case "RETURNED":
            if (wasLate) {
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500"></span>
                        Returned ({lateMinutes ? `${lateMinutes}m Late` : "Late"})
                    </span>
                );
            }
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                    <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-zinc-400"></span>
                    Returned
                </span>
            );
        case "REJECTED":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500"></span>
                    Rejected
                </span>
            );
        case "CANCELLED":
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-500 border border-zinc-200">
                    Cancelled
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600">
                    {status}
                </span>
            );
    }
};

export default StatusBadge;
