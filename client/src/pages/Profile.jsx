import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
    User,
    Mail,
    Phone,
    Building2,
    Home,
    GraduationCap,
    Lock,
    Key,
    Shield,
    CheckCircle2,
    AlertCircle,
    Save,
    ArrowLeft,
    Users,
    BadgeCheck,
} from "lucide-react";

const Profile = () => {
    const { user, setUser } = useAuth();

    const isStudent = user?.role === "student";
    const isWarden = user?.role === "warden";
    const isGuard = user?.role === "guard";

    const dashboardPath = isWarden ? "/warden" : isGuard ? "/guard" : "/dashboard";

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        // Student fields
        rollNo: user?.studentProfile?.rollNo || "",
        department: user?.studentProfile?.department || "",
        hostelBlock: user?.studentProfile?.hostelBlock || "",
        roomNo: user?.studentProfile?.roomNo || "",
        parentName: user?.studentProfile?.parentName || "",
        parentPhone: user?.studentProfile?.parentPhone || "",
        parentEmail: user?.studentProfile?.parentEmail || "",
        // Staff fields
        hostelAssigned: user?.staffProfile?.hostelAssigned || "",
        gateNumber: user?.staffProfile?.gateNumber || "",
    });

    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState("");
    const [profileError, setProfileError] = useState("");

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return "CP";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileSuccess("");
        setProfileError("");

        try {
            const payload = {
                name: profileData.name,
                phone: profileData.phone,
            };

            if (isStudent) {
                payload.studentProfile = {
                    department: profileData.department,
                    hostelBlock: profileData.hostelBlock,
                    roomNo: profileData.roomNo,
                    parentName: profileData.parentName,
                    parentPhone: profileData.parentPhone,
                    parentEmail: profileData.parentEmail,
                };
            } else if (isWarden || isGuard) {
                payload.staffProfile = {
                    hostelAssigned: profileData.hostelAssigned,
                    gateNumber: profileData.gateNumber,
                };
            }

            const res = await api.put("/auth/profile", payload);
            if (res.data?.success && res.data?.user) {
                setUser(res.data.user);
                setProfileSuccess("Profile updated successfully!");
                setTimeout(() => setProfileSuccess(""), 4000);
            }
        } catch (err) {
            setProfileError(
                err.response?.data?.message || "Failed to update profile. Please try again."
            );
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordSuccess("");
        setPasswordError("");

        if (passwordData.newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters long.");
            setPasswordLoading(false);
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match.");
            setPasswordLoading(false);
            return;
        }

        try {
            const res = await api.put("/auth/password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            if (res.data?.success) {
                setPasswordSuccess("Password changed successfully!");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                setTimeout(() => setPasswordSuccess(""), 4000);
            }
        } catch (err) {
            setPasswordError(
                err.response?.data?.message || "Failed to change password. Please check your current password."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        to={dashboardPath}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to {isWarden ? "Warden Queue" : isGuard ? "Gate Terminal" : "Dashboard"}
                    </Link>
                </div>

                {/* Profile Header Banner */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 shadow-xs mb-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                            {getInitials(user?.name)}
                        </div>

                        {/* Name & Role Details */}
                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                                    {user?.name}
                                </h1>
                                <span
                                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                        isWarden
                                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                                            : isGuard
                                            ? "bg-sky-100 text-sky-800 border border-sky-200"
                                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    }`}
                                >
                                    {user?.role}
                                </span>
                                {isStudent && user?.studentProfile?.rollNo && (
                                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                                        {user.studentProfile.rollNo}
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-zinc-500 mb-3">{user?.email}</p>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-500">
                                {isStudent && (
                                    <>
                                        <span className="flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                                            {user?.studentProfile?.hostelBlock || "Hostel Not Set"}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Home className="w-3.5 h-3.5 text-zinc-400" />
                                            Room {user?.studentProfile?.roomNo || "N/A"}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                                            {user?.studentProfile?.department || "Department Not Set"}
                                        </span>
                                    </>
                                )}
                                {isWarden && (
                                    <span className="flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                                        Assigned to {user?.staffProfile?.hostelAssigned || "All Hostels"}
                                    </span>
                                )}
                                {isGuard && (
                                    <span className="flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-sky-600" />
                                        Station: {user?.staffProfile?.gateNumber || "Main Gate"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left 2 Columns: Edit Profile */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 shadow-xs">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                                <div>
                                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                                        Profile Information
                                    </h2>
                                    <p className="text-xs text-zinc-500">
                                        Update your personal details and contact records
                                    </p>
                                </div>
                            </div>

                            {profileSuccess && (
                                <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <span>{profileSuccess}</span>
                                </div>
                            )}

                            {profileError && (
                                <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
                                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                    <span>{profileError}</span>
                                </div>
                            )}

                            <form onSubmit={handleProfileSubmit} className="space-y-5">
                                {/* Basic Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                                            <input
                                                type="text"
                                                required
                                                value={profileData.name}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, name: e.target.value })
                                                }
                                                className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                                            <input
                                                type="email"
                                                disabled
                                                value={user?.email || ""}
                                                className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 bg-zinc-50 text-zinc-500 rounded-lg cursor-not-allowed"
                                            />
                                        </div>
                                        <span className="text-[10px] text-zinc-400 mt-1 block">
                                            Primary identifier (immutable)
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                            Contact Phone
                                        </label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                                            <input
                                                type="tel"
                                                placeholder="e.g. 9876543210"
                                                value={profileData.phone}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, phone: e.target.value })
                                                }
                                                className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                            />
                                        </div>
                                    </div>

                                    {isStudent && (
                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                                Roll Number
                                            </label>
                                            <div className="relative">
                                                <BadgeCheck className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                                                <input
                                                    type="text"
                                                    disabled
                                                    value={profileData.rollNo || "NOT SET"}
                                                    className="w-full pl-9 pr-3 py-2 text-sm font-mono font-semibold border border-zinc-200 bg-zinc-50 text-zinc-700 rounded-lg cursor-not-allowed"
                                                />
                                            </div>
                                            <span className="text-[10px] text-zinc-400 mt-1 block">
                                                Assigned by University Registrar
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Student-Specific Academic & Hostel Details */}
                                {isStudent && (
                                    <>
                                        <div className="pt-4 border-t border-zinc-100">
                                            <h3 className="text-sm font-bold text-zinc-900 tracking-tight mb-3 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-zinc-600" />
                                                Hostel & Department Records
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="sm:col-span-2">
                                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                                        Hostel Block
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. BH-2 (Boys Hostel 2)"
                                                        value={profileData.hostelBlock}
                                                        onChange={(e) =>
                                                            setProfileData({
                                                                ...profileData,
                                                                hostelBlock: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                                        Room No
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 304"
                                                        value={profileData.roomNo}
                                                        onChange={(e) =>
                                                            setProfileData({
                                                                ...profileData,
                                                                roomNo: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                                    Academic Department
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Computer Science & Engineering"
                                                    value={profileData.department}
                                                    onChange={(e) =>
                                                        setProfileData({
                                                            ...profileData,
                                                            department: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                                />
                                            </div>
                                        </div>

                                        {/* Parent & Emergency Contacts */}
                                        <div className="pt-4 border-t border-zinc-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-zinc-600" />
                                                    Parent / Guardian Authorization Contacts
                                                </h3>
                                            </div>

                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs mb-4">
                                                💡 <strong>Important:</strong> Cryptographic parent consent links for
                                                curfew-breaching leaves (past 10:30 PM) and overnight outpasses are
                                                dispatched to these parent contact details.
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                                        Parent Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Sanjay Verma"
                                                        value={profileData.parentName}
                                                        onChange={(e) =>
                                                            setProfileData({
                                                                ...profileData,
                                                                parentName: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                                        Parent Phone
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        placeholder="e.g. 9811223344"
                                                        value={profileData.parentPhone}
                                                        onChange={(e) =>
                                                            setProfileData({
                                                                ...profileData,
                                                                parentPhone: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                                        Parent Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        placeholder="parent@example.com"
                                                        value={profileData.parentEmail}
                                                        onChange={(e) =>
                                                            setProfileData({
                                                                ...profileData,
                                                                parentEmail: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Staff-Specific Fields */}
                                {isWarden && (
                                    <div className="pt-4 border-t border-zinc-100">
                                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                            Hostel Blocks Assigned
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. BH-2 & GH-1"
                                            value={profileData.hostelAssigned}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    hostelAssigned: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                        />
                                    </div>
                                )}

                                {isGuard && (
                                    <div className="pt-4 border-t border-zinc-100">
                                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                            Campus Gate Duty Station
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Gate 1 (Main Campus Gate)"
                                            value={profileData.gateNumber}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    gateNumber: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                        />
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={profileLoading}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 transition disabled:opacity-50 shadow-xs"
                                    >
                                        <Save className="w-4 h-4" />
                                        {profileLoading ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Security & Password */}
                    <div className="space-y-6">
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100">
                                <Lock className="w-5 h-5 text-zinc-700" />
                                <div>
                                    <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                                        Account Security
                                    </h2>
                                    <p className="text-xs text-zinc-500">Change your login password</p>
                                </div>
                            </div>

                            {passwordSuccess && (
                                <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{passwordSuccess}</span>
                                </div>
                            )}

                            {passwordError && (
                                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>{passwordError}</span>
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <Key className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={passwordData.currentPassword}
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    currentPassword: e.target.value,
                                                })
                                            }
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={passwordData.newPassword}
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    newPassword: e.target.value,
                                                })
                                            }
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                        />
                                    </div>
                                    <span className="text-[10px] text-zinc-400 mt-1 block">
                                        Minimum 6 characters
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    confirmPassword: e.target.value,
                                                })
                                            }
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-xs transition border border-zinc-300 disabled:opacity-50"
                                >
                                    {passwordLoading ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
