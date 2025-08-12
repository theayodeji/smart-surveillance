import React, { useState } from "react";
import axios from "axios";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default to regular user
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      // Store the token
      localStorage.setItem('token', response.data.token);
      
      // Call the onLogin callback to update the auth state
      if (onLogin) {
        onLogin();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-400 focus:border-green-400"
                placeholder="Username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-400 focus:border-green-400"
                placeholder="Password"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700">
                Login as
              </label>
              <div className="flex mt-2 space-x-4">
                <div className="flex items-center">
                  <input
                    id="user-type-user"
                    name="user-type"
                    type="radio"
                    checked={role === "user"}
                    onChange={() => setRole("user")}
                    className="w-4 h-4 border-gray-300 focus:ring-green-400 focus:border-green-400"
                  />
                  <label
                    htmlFor="user-type-user"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Guest
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="user-type-admin"
                    name="user-type"
                    type="radio"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                    className="w-4 h-4 text-green-400 border-gray-300 focus:ring-green-400"
                  />
                  <label
                    htmlFor="user-type-admin"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Administrator
                  </label>
                </div>
              </div>
            </div> */}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="w-4 h-4 border-gray-300 rounded focus:ring-green-400 focus:border-green-400"
              />
              <label
                htmlFor="remember-me"
                className="block ml-2 text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            {/* <div className="text-sm">
              <a
                href="#"
                className="font-medium text-green-700 hover:text-green-600"
              >
                Forgot your password?
              </a>
            </div> */}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || username === '' || password === ''} 
              className={`cursor-pointer flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-500 focus:ring-green-600"
              }`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        {/* <div className="text-center text-sm mt-4">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <a
              href="#"
              className="font-medium text-green-500 focus:border-green-400 hover:text-green-600"
            >
              Sign up
            </a>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;
