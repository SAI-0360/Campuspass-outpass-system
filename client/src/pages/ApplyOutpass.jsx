import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { AlertCircle, ArrowLeft, Upload, Clock } from "lucide-react";

// Helper to format Date into local YYYY-MM-DDTHH:mm string for datetime-local input
const toLocalISOString = (date) => {
    const tzOffsetMs = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
};

const ApplyOutpass = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Default departure: 10 mins from now; return: 4 hours from now in local time
    const now = new Date();
    const defaultDep = toLocalISOString(new Date(now.getTime() + 10 * 60 * 1000));
    const defaultRet = toLocalISOString(new Date(now.getTime() + 4 * 60 * 60 * 1000));

    const [form, setForm] = useState({
        outpassType: "day_out",
        destination: "",
        reason: "",
        departureTime: defaultDep,
        expectedReturnTime: defaultRet,
        parentPhone: user?.studentProfile?.parentPhone || "",
        parentEmail: user?.studentProfile?.parentEmail || "",
    });

    const [file, setFile] = useState(null);
    const [isCurfew, setIsCurfew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Sync parent contact info when user profile loads
    useEffect(() => {
        if (user?.studentProfile) {
            setForm((prev) => ({
                ...prev,
                parentPhone: prev.parentPhone || user.studentProfile.parentPhone || "",
                parentEmail: prev.parentEmail || user.studentProfile.parentEmail || "",
            }));
        }
    }, [user]);

    // Live 10:30 PM Curfew Detection
    useEffect(() => {
        if (!form.expectedReturnTime || !form.departureTime) return;

        const dep = new Date(form.departureTime);
        const ret = new Date(form.expectedReturnTime);

        const isDifferentDay =
            ret.getFullYear() !== dep.getFullYear() ||
            ret.getMonth() !== dep.getMonth() ||
            ret.getDate() !== dep.getDate();

        const returnHour = ret.getHours();
        const returnMinutes = ret.getMinutes();
        const isPastCurfew = returnHour > 22 || (returnHour === 22 && returnMinutes > 30);

        const curfewRequired =
            isDifferentDay || isPastCurfew || form.outpassType === "night_out" || form.outpassType === "weekend_home";

        setIsCurfew(curfewRequired);
    }, [form.departureTime, form.expectedReturnTime, form.outpassType]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("outpassType", form.outpassType);
            formData.append("destination", form.destination);
            formData.append("reason", form.reason);
            formData.append("departureTime", new Date(form.departureTime).toISOString());
            formData.append("expectedReturnTime", new Date(form.expectedReturnTime).toISOString());
            formData.append("parentPhone", form.parentPhone);
            formData.append("parentEmail", form.parentEmail);

            if (file) {
                formData.append("proofDocument", file);
            }

            await api.post("/student/apply", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit outpass application.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8">
                <div className="mb-4">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Active Pass
                    </Link>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Apply for Outpass</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Submit your leave request for Warden approval</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium">
                        {error}
                    </div>
                )}

                <div className="bg-white p-6 sm:p-8 rounded-xl border border-zinc-200 shadow-xs">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Outpass Type */}
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                Outpass Type *
                            </label>
                            <select
                                name="outpassType"
                                value={form.outpassType}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                            >
                                <option value="day_out">Day Out (Same-Day Return)</option>
                                <option value="night_out">Night Out (Curfew Exemption)</option>
                                <option value="weekend_home">Weekend Home Visit</option>
                                <option value="emergency">Emergency Leave</option>
                            </select>
                        </div>

                        {/* Destination & Reason */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                    Destination *
                                </label>
                                <input
                                    type="text"
                                    name="destination"
                                    required
                                    value={form.destination}
                                    onChange={handleChange}
                                    placeholder="e.g. City Center Mall / Home"
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                    Reason *
                                </label>
                                <input
                                    type="text"
                                    name="reason"
                                    required
                                    value={form.reason}
                                    onChange={handleChange}
                                    placeholder="e.g. Buying textbooks / Family visit"
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>
                        </div>

                        {/* Dates Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                    Departure Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="departureTime"
                                    required
                                    value={form.departureTime}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                    Expected Return Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="expectedReturnTime"
                                    required
                                    value={form.expectedReturnTime}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>
                        </div>

                        {/* Live Curfew Notice */}
                        {isCurfew && (
                            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                    <div className="text-xs text-amber-800">
                                        <span className="font-bold block">10:30 PM Hostel Curfew Rule Applied</span>
                                        Your expected return is past the 10:30 PM entry cutoff or on another day. This
                                        request will be flagged for Warden verification. Parent contact info is required.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-amber-200">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                                            Parent Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="parentPhone"
                                            required={isCurfew}
                                            value={form.parentPhone}
                                            onChange={handleChange}
                                            placeholder="9876543210"
                                            className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-md text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                                            Parent Email (for CC)
                                        </label>
                                        <input
                                            type="email"
                                            name="parentEmail"
                                            value={form.parentEmail}
                                            onChange={handleChange}
                                            placeholder="parent@example.com"
                                            className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-md text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Optional Proof Upload */}
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                Supporting Document / Proof (Optional)
                            </label>
                            <div className="border border-dashed border-zinc-300 rounded-lg p-4 text-center hover:border-zinc-400 transition bg-zinc-50">
                                <Upload className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
                                <label className="cursor-pointer text-xs text-zinc-600 font-medium">
                                    <span className="text-zinc-900 font-bold underline">Click to upload</span> ticket, medical slip, or parent email screenshot
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                {file && (
                                    <div className="mt-2 text-xs text-emerald-700 font-semibold bg-emerald-50 py-1 px-2 rounded inline-block">
                                        Selected: {file.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-xs text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition disabled:opacity-50 mt-4"
                        >
                            {loading ? "Submitting Application..." : "Submit Outpass Request"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ApplyOutpass;
