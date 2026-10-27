import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Register = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        rollNo: "",
        hostelBlock: "",
        roomNo: "",
        department: "Computer Science",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
    });

    const [loading, setLoading] = useState(false);
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
            const payload = {
                name: form.name,
                email: form.email,
                password: form.password,
                role: "student",
                phone: form.phone,
                studentProfile: {
                    rollNo: form.rollNo,
                    hostelBlock: form.hostelBlock,
                    roomNo: form.roomNo,
                    department: form.department,
                    parentName: form.parentName,
                    parentPhone: form.parentPhone,
                    parentEmail: form.parentEmail,
                },
            };

            const res = await api.post("/auth/register", payload);
            if (res.data?.user) {
                setUser(res.data.user);
                navigate("/dashboard", { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                        CP
                    </div>
                </div>
                <h2 className="mt-3 text-center text-2xl font-extrabold text-zinc-900 tracking-tight">
                    Student Registration
                </h2>
                <p className="mt-1 text-center text-xs text-zinc-500">
                    Create your hostel account to apply for digital outpasses
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-6 shadow-sm border border-zinc-200 rounded-xl sm:px-10">
                    {error && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Basic Account Info */}
                        <div className="border-b border-zinc-200 pb-3">
                            <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block mb-3">
                                1. Account Details
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Arjun Mehta"
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="arjun@campuspass.edu"
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        minLength={6}
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hostel Profile */}
                        <div className="border-b border-zinc-200 pb-3">
                            <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block mb-3">
                                2. Hostel & Academic Details
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Roll / Reg Number *</label>
                                    <input
                                        type="text"
                                        name="rollNo"
                                        required
                                        value={form.rollNo}
                                        onChange={handleChange}
                                        placeholder="22CSE045"
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Hostel Block *</label>
                                    <input
                                        type="text"
                                        name="hostelBlock"
                                        required
                                        value={form.hostelBlock}
                                        onChange={handleChange}
                                        placeholder="BH-2 (Block B)"
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Room No *</label>
                                    <input
                                        type="text"
                                        name="roomNo"
                                        required
                                        value={form.roomNo}
                                        onChange={handleChange}
                                        placeholder="304"
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Parent Details (for 10:30 PM Curfew Rule verification) */}
                        <div className="pb-2">
                            <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block mb-1">
                                3. Parent / Guardian Details
                            </span>
                            <p className="text-[11px] text-zinc-500 mb-3">
                                Required for verification on leaves extending past 10:30 PM
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Parent Name *</label>
                                    <input
                                        type="text"
                                        name="parentName"
                                        required
                                        value={form.parentName}
                                        onChange={handleChange}
                                        placeholder="Ramesh Mehta"
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Parent Phone *</label>
                                    <input
                                        type="tel"
                                        name="parentPhone"
                                        required
                                        value={form.parentPhone}
                                        onChange={handleChange}
                                        placeholder="9811223344"
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Parent Email</label>
                                    <input
                                        type="email"
                                        name="parentEmail"
                                        value={form.parentEmail}
                                        onChange={handleChange}
                                        placeholder="parent@example.com"
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition disabled:opacity-50 mt-4"
                        >
                            {loading ? "Creating Account..." : "Complete Registration"}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-zinc-600">
                            Already registered?{" "}
                            <Link to="/login" className="font-bold text-zinc-900 hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
