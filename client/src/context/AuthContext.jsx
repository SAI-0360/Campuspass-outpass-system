import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user has an active session cookie on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                const res = await api.get("/auth/me");
                if (res.data?.success && res.data?.user) {
                    setUser(res.data.user);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        if (res.data?.user) {
            setUser(res.data.user);
        }
        return res.data;
    };

    const demoLogin = async (role, profileId) => {
        const res = await api.post("/auth/demo-login", { role, profileId });
        if (res.data?.user) {
            setUser(res.data.user);
        }
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                login,
                demoLogin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
