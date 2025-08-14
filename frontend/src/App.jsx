import "./global.css";
import "./styles/datepicker.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// import Verification from "./pages/Verification";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthRoute from "./components/auth/AuthRoute";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Auth routes - only accessible when not authenticated */}
        <Route element={<AuthRoute isAuthenticated={isAuthenticated} redirectPath="/" />}>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
            <Route path="signup" element={<Signup onSignup={() => setIsAuthenticated(true)} />} />
            {/* <Route path="verification" element={<Verification />} /> */}
          </Route>
        </Route>

        {/* Protected routes - only accessible when authenticated */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} redirectPath="/auth/login" />}>
          <Route path="/" element={<Dashboard onLogout={() => setIsAuthenticated(false)} />} />
          <Route path="/users" element={<Users />} />
          {/* <Route path="/settings" element={<Settings />} /> */}
        </Route>

        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/auth/login"} replace />} />
      </Routes>
    </>
  );
}

export default App;
