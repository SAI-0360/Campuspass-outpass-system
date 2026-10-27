import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, UserCheck, Shield, ChevronDown } from "lucide-react";

const studentProfiles = [
    {
        id: "student1",
        name: "Rahul Verma",
        rollNo: "22CSE104",
        hostel: "BH-2 Boys Hostel",
        dept: "Computer Science",
    },
    {
        id: "student2",
        name: "Ananya Sharma",
        rollNo: "22ECE205",
        hostel: "GH-1 Girls Hostel",
        dept: "Electronics & Comm.",
    },
    {
        id: "student3",
        name: "Rohan Gupta",
        rollNo: "22MECH310",
        hostel: "BH-2 Boys Hostel",
        dept: "Mechanical Eng.",
    },
];

const Login = () => {
    const navigate = useNavigate();
    const { login, demoLogin } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState("");
    const [showStudentMenu, setShowStudentMenu] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const navigateRole = (role) => {
        if (role === "warden") {
            navigate("/warden", { replace: true });
        } else if (role === "guard") {
            navigate("/guard", { replace: true });
        } else {
            navigate("/dashboard", { replace: true });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await login(form.email, form.password);
            navigateRole(data.user?.role);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    const handleDemo = async (role) => {
        setDemoLoading(role);
        setError("");
        try {
            const data = await demoLogin(role);
            navigateRole(data.user?.role);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to log in as demo ${role}.`);
        } finally {
            setDemoLoading("");
        }
    };

    const handleStudentDemo = async (profileId) => {
        setShowStudentMenu(false);
        setDemoLoading(profileId);
        setError("");
        try {
            const data = await demoLogin("student", profileId);
            navigateRole(data.user?.role);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to log in as demo student.");
        } finally {
            setDemoLoading("");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                        CP
                    </div>
                </div>
                <h2 className="mt-4 text-center text-2xl font-extrabold text-zinc-900 tracking-tight">
                    CampusPass Portal
                </h2>
                <p className="mt-1 text-center text-xs text-zinc-500">
                    Hostel Outpass & Campus Gate Verification System
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-sm border border-zinc-200 rounded-xl sm:px-10">
                    {error && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                placeholder="student@campuspass.edu"
                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign in to CampusPass"}
                        </button>
                    </form>

                    {/* 1-Click Demo Evaluation Buttons */}
                    <div className="mt-6 pt-6 border-t border-zinc-200">
                        <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-center mb-3">
                            ⚡ 1-Click Evaluation Logins
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                            {/* Student Dropdown Button with 3 Profiles */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowStudentMenu(!showStudentMenu)}
                                    disabled={!!demoLoading}
                                    className="w-full flex flex-col items-center justify-center gap-1 py-2 px-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded-lg text-[11px] font-bold text-zinc-800 transition disabled:opacity-50 cursor-pointer"
                                >
                                    <div className="flex items-center gap-1">
                                        <UserCheck className="w-4 h-4 text-emerald-600" />
                                        <ChevronDown className="w-3 h-3 text-zinc-400" />
                                    </div>
                                    {demoLoading && demoLoading.startsWith("student") ? "..." : "Student ▾"}
                                </button>

                                {showStudentMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-20"
                                            onClick={() => setShowStudentMenu(false)}
                                        />
                                        <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl z-30 p-1.5 text-left animate-in fade-in zoom-in-95 duration-100">
                                            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
                                                Select Student Profile
                                            </span>
                                            {studentProfiles.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => handleStudentDemo(p.id)}
                                                    className="w-full text-left p-2 rounded-lg hover:bg-emerald-50/70 transition flex flex-col cursor-pointer group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-900">
                                                            {p.name}
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 group-hover:bg-emerald-100 group-hover:text-emerald-800 px-1.5 py-0.5 rounded">
                                                            {p.hostel}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                                        Roll: {p.rollNo} &bull; {p.dept}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDemo("warden")}
                                disabled={!!demoLoading}
                                className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded-lg text-[11px] font-bold text-zinc-800 transition disabled:opacity-50"
                            >
                                <ShieldCheck className="w-4 h-4 text-purple-600" />
                                {demoLoading === "warden" ? "..." : "Warden"}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemo("guard")}
                                disabled={!!demoLoading}
                                className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded-lg text-[11px] font-bold text-zinc-800 transition disabled:opacity-50"
                            >
                                <Shield className="w-4 h-4 text-sky-600" />
                                {demoLoading === "guard" ? "..." : "Guard"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-zinc-600">
                            New student?{" "}
                            <Link to="/register" className="font-bold text-zinc-900 hover:underline">
                                Register your account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
