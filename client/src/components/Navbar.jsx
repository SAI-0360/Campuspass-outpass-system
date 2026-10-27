import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, LogOut, FileText, PlusCircle, History, Shield, User } from "lucide-react";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    if (!user) return null;

    const isStudent = user.role === "student";
    const isWarden = user.role === "warden";
    const isGuard = user.role === "guard";

    const homePath = isWarden ? "/warden" : isGuard ? "/guard" : "/dashboard";

    return (
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Brand / Logo */}
                <div className="flex items-center gap-6">
                    <Link to={homePath} className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-zinc-800 transition">
                            CP
                        </div>
                        <div>
                            <span className="font-bold text-base tracking-tight text-zinc-900 block leading-tight">
                                CampusPass
                            </span>
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
                                Hostel Outpass System
                            </span>
                        </div>
                    </Link>

                    {/* Navigation links */}
                    <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                        {isStudent && (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="px-3 py-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition flex items-center gap-1.5"
                                >
                                    <FileText className="w-4 h-4 text-zinc-500" />
                                    Active Pass
                                </Link>
                                <Link
                                    to="/apply"
                                    className="px-3 py-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition flex items-center gap-1.5"
                                >
                                    <PlusCircle className="w-4 h-4 text-zinc-500" />
                                    Apply Outpass
                                </Link>
                                <Link
                                    to="/history"
                                    className="px-3 py-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition flex items-center gap-1.5"
                                >
                                    <History className="w-4 h-4 text-zinc-500" />
                                    History
                                </Link>
                            </>
                        )}
                        {isWarden && (
                            <Link
                                to="/warden"
                                className="px-3 py-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition flex items-center gap-1.5"
                            >
                                <ShieldCheck className="w-4 h-4 text-zinc-500" />
                                Warden Review Queue
                            </Link>
                        )}
                        {isGuard && (
                            <Link
                                to="/guard"
                                className="px-3 py-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition flex items-center gap-1.5"
                            >
                                <Shield className="w-4 h-4 text-zinc-500" />
                                Gate Terminal
                            </Link>
                        )}

                        {/* Universal Profile Link */}
                        <Link
                            to="/profile"
                            className="px-3 py-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition flex items-center gap-1.5"
                        >
                            <User className="w-4 h-4 text-zinc-500" />
                            Profile
                        </Link>
                    </nav>
                </div>

                {/* Right: User Role & Logout */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/profile"
                        title="View / Edit Profile"
                        className="flex items-center gap-2.5 group cursor-pointer"
                    >
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-semibold text-zinc-900 leading-tight group-hover:text-blue-600 transition">
                                {user.name}
                            </div>
                            <div className="text-[11px] text-zinc-500 capitalize">
                                {user.role} {user.studentProfile?.rollNo ? `(${user.studentProfile.rollNo})` : ""}
                            </div>
                        </div>

                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider group-hover:ring-2 group-hover:ring-offset-1 transition ${
                                isWarden
                                    ? "bg-purple-100 text-purple-800 border border-purple-200 group-hover:ring-purple-400"
                                    : isGuard
                                    ? "bg-sky-100 text-sky-800 border border-sky-200 group-hover:ring-sky-400"
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200 group-hover:ring-emerald-400"
                            }`}
                        >
                            {user.role}
                        </span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
