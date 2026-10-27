import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, ArrowRight, UserCheck, KeyRound } from "lucide-react";

const Login = () => {
    const navigate = useNavigate();
    const { login, demoLogin } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await login(form.email, form.password);
            if (data.user?.role === "warden") {
                navigate("/warden", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
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
            if (data.user?.role === "warden") {
                navigate("/warden", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || `Failed to log in as demo ${role}.`);
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
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleDemo("student")}
                                disabled={!!demoLoading}
                                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-800 transition disabled:opacity-50"
                            >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                {demoLoading === "student" ? "Logging in..." : "Demo Student"}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemo("warden")}
                                disabled={!!demoLoading}
                                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-800 transition disabled:opacity-50"
                            >
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                {demoLoading === "warden" ? "Logging in..." : "Demo Warden"}
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
