"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function Bubbles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${20 + i * 20}px`,
            height: `${20 + i * 20}px`,
            background: "rgba(29,158,117,0.08)",
            left: `${5 + i * 16}%`,
            top: `${10 + (i % 4) * 22}%`,
            border: "1px solid rgba(29,158,117,0.12)",
            willChange: "transform",
          }}
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
        />
      ))}
    </div>
  );
}

function EKGLine() {
  const pathRef = useRef<SVGPolylineElement>(null);
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const length = el.getTotalLength();
    el.style.strokeDasharray = `${length}`;
    el.style.strokeDashoffset = `${length}`;
    el.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
      duration: 2000,
      easing: "cubic-bezier(0.4,0,0.2,1)",
      fill: "forwards",
      iterations: Infinity,
    });
  }, []);

  return (
    <svg width="280" height="60" viewBox="0 0 280 60" style={{ overflow: "visible" }}>
      <polyline
        ref={pathRef}
        points="0,30 50,30 65,30 75,5 85,55 92,15 100,30 120,30 280,30"
        fill="none"
        stroke="#1D9E75"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.circle
        cx="75" cy="5" r="4"
        fill="#5DCAA5"
        animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "75px 5px" }}
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }
    setResetLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0D1F1A" }}>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{ width: "52%", background: "#0D1F1A", borderRight: "1px solid rgba(29,158,117,0.15)", padding: "3rem" }}>
        <Bubbles />
        <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none">
          <svg width="100%" height="120" viewBox="0 0 800 120" preserveAspectRatio="none">
            <motion.polyline
              points="0,60 150,60 200,60 240,10 280,110 310,20 340,60 420,60 500,60 540,10 580,110 610,20 640,60 800,60"
              fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
            />
          </svg>
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "1.8rem", color: "#1D9E75" }}>
            bio<span style={{ color: "#5DCAA5" }}>wire</span>
          </span>
        </motion.div>

        <div className="relative z-10 flex flex-col gap-8">
          <EKGLine />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-col gap-4">
            <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(2.5rem, 4vw, 4rem)", color: "#E1F5EE", lineHeight: 1.1 }}>
              Your Health,<br /><span style={{ color: "#1D9E75" }}>Understood.</span>
            </h1>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.05rem", color: "#5DCAA5", lineHeight: 1.75, maxWidth: "400px" }}>
              Sign in to access your personal health dashboard, BioChat, and real-time environmental data.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="flex flex-wrap gap-3">
            {["BioChat", "Health Dashboard", "Global Feed", "Health Library"].map((f, i) => (
              <span key={i} className="px-4 py-2 rounded-full text-sm"
                style={{ background: "rgba(29,158,117,0.12)", border: "1px solid rgba(29,158,117,0.25)", color: "#9FE1CB", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {f}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "rgba(159,225,203,0.4)" }}>
          Biowire does not provide medical advice. Always consult a qualified healthcare professional.
        </motion.p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center relative" style={{ background: "#F7FFFE", padding: "2rem" }}>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full flex flex-col gap-8"
          style={{ maxWidth: "420px" }}
        >
          <div className="lg:hidden">
            <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "1.5rem", color: "#1D9E75" }}>
              bio<span style={{ color: "#085041" }}>wire</span>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "2rem", color: "#2C2C2A", lineHeight: 1.2 }}>
              Welcome back
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#5F5E5A" }}>
              Sign in to your Biowire account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(225,29,72,0.08)", border: "1px solid rgba(225,29,72,0.2)", color: "#e11d48", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {error}
            </div>
          )}

          {/* Reset sent success */}
          {resetSent && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(29,158,117,0.08)", border: "1px solid rgba(29,158,117,0.2)", color: "#1D9E75", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Password reset email sent! Check your inbox.
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#2C2C2A", fontWeight: 500 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-2xl outline-none transition-all"
                style={{ background: "white", border: "1.5px solid #E1F5EE", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#2C2C2A" }}
                onFocus={(e) => e.target.style.borderColor = "#1D9E75"}
                onBlur={(e) => e.target.style.borderColor = "#E1F5EE"}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#2C2C2A", fontWeight: 500 }}>Password</label>
                <button
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#1D9E75", background: "none", border: "none", cursor: "pointer" }}>
                  {resetLoading ? "Sending..." : "Forgot password?"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-2xl outline-none transition-all"
                  style={{ background: "white", border: "1.5px solid #E1F5EE", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#2C2C2A" }}
                  onFocus={(e) => e.target.style.borderColor = "#1D9E75"}
                  onBlur={(e) => e.target.style.borderColor = "#E1F5EE"}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#888780", fontSize: "0.8rem", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-medium disabled:opacity-60"
              style={{ background: "#1D9E75", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>

            <p className="text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.875rem", color: "#5F5E5A" }}>
              Don't have an account?{" "}
              <a href="/register" style={{ color: "#1D9E75", fontWeight: 500 }}>Create one</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}