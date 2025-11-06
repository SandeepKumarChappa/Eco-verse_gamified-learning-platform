import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useState } from "react";

export default function SignInPage() {
  const { setSession, role } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      if (q.get("role") === "admin") setIsAdminMode(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (role) {
      if (role === "admin") navigate("/admin");
      else if (role === "teacher") navigate("/teacher");
      else navigate("/student");
    }
  }, [role, navigate]);

  const signin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      if (!data.ok) throw new Error("Invalid credentials or not approved yet");
      setSession({ role: data.role, username: data.username });
      
      // Small delay to ensure session is set
      setTimeout(() => {
        if (data.role === "admin") navigate("/admin");
        else if (data.role === "teacher") navigate("/teacher");
        else navigate("/student");
      }, 100);
    } catch (e: any) {
      try {
        const st = await fetch(
          `/api/application-status/${encodeURIComponent(username)}`
        ).then((r) => r.json());
        if (st?.status === "pending") {
          setPendingUser(username);
          setError(null);
        } else {
          setError(e?.message || "Login error");
        }
      } catch {
        setError(e?.message || "Login error");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!username) return;
    setChecking(true);
    try {
      const res = await fetch(
        `/api/application-status/${encodeURIComponent(username)}`
      );
      const data = await res.json();
      if (data.status === "approved") {
        setPendingUser(null);
        setError(null);
      } else if (data.status === "rejected") {
        setPendingUser(null);
        setError("Your application was rejected.");
      } else {
        setError("Application is still pending approval.");
      }
    } catch {
      setError("Could not check status.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1627552089384-78612c8584e9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxuYXR1cmUlMjBjaGlsZHJlbnxlbnwwfHx8fDE3NjA1MDgyNTZ8MA&ixlib=rb-4.1.0&q=85')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-sky-900/50 to-blue-900/60"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Floating decorative elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-yellow-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-400 rounded-full blur-3xl opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border-4 border-white/20 transform hover:scale-[1.02] transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-green-400 to-emerald-500 p-4 rounded-full mb-4 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {isAdminMode ? "Admin Sign In" : "Welcome Back!"}
            </h1>
            <p className="text-gray-600 text-lg">
              {isAdminMode ? "Enter your credentials to access admin panel." : "Sign in to continue your eco journey"}
            </p>
          </div>

          {/* Pending Status Alert */}
          {pendingUser && (
            <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-2xl">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-yellow-800 text-sm font-medium">
                  Your application is pending approval. Check back soon!
                </div>
              </div>
              <Button
                className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white"
                disabled={checking}
                onClick={checkStatus}
              >
                {checking ? "Checking..." : "Check Status"}
              </Button>
            </div>
          )}

          {/* Error Alert */}
          {error && !pendingUser && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 rounded-2xl">
              <div className="text-red-700 text-sm font-medium text-center">
                {error}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); signin(); }} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-200 outline-none transition-all duration-300 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-200 outline-none transition-all duration-300 bg-white"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || pendingUser !== null}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-green-600 hover:text-green-700 font-bold underline transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
