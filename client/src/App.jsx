import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import ApplyOutpass from "./pages/ApplyOutpass";
import OutpassHistory from "./pages/OutpassHistory";
import WardenDashboard from "./pages/WardenDashboard";
import GuardDashboard from "./pages/GuardDashboard";
import ParentConsent from "./pages/ParentConsent";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }
                    />

                    {/* Student Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["student"]}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/apply"
                        element={
                            <ProtectedRoute allowedRoles={["student"]}>
                                <ApplyOutpass />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            <ProtectedRoute allowedRoles={["student"]}>
                                <OutpassHistory />
                            </ProtectedRoute>
                        }
                    />

                    {/* Warden Protected Routes */}
                    <Route
                        path="/warden"
                        element={
                            <ProtectedRoute allowedRoles={["warden"]}>
                                <WardenDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Security Guard Protected Routes */}
                    <Route
                        path="/guard"
                        element={
                            <ProtectedRoute allowedRoles={["guard"]}>
                                <GuardDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Public Parent Consent Verification Portal */}
                    <Route path="/parent-consent/:token" element={<ParentConsent />} />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
