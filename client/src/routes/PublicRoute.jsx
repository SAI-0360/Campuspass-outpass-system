import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (user) {
        if (user.role === "warden") {
            return <Navigate to="/warden" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;
