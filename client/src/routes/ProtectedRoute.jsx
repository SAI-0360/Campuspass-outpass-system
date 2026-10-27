import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-zinc-600 font-medium">Verifying session...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role check if allowedRoles array is specified
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === "warden") {
            return <Navigate to="/warden" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
