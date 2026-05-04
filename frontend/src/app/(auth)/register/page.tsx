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

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    gender: "",
    bloodType: "",
    height: "",
    weight: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const inputStyle = {
    background: "white",
    border: "1.5px solid #E1F5EE",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.95rem",
    color: "#2C2C2A",
    borderRadius: "1rem",
    padding: "0.75rem 1rem",
    width: "100%",
    outline: "none",
  };

  const labelStyle = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.85rem",
    color: "#2C2C2A",
    fontWeight: 500,
    marginBottom: "6px",
    display: "block",
  };

  const handleContinue = () => {
    if (!form.fullName.trim()) { setError("Please enter your full name."); return; }
    if (!form.email.trim()) { setError("Please enter your email."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setError("");
    setStep(2);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            birth_date: form.birthDate,
            gender: form.gender,
            blood_type: form.bloodType,
            height: form.height ? Number(form.height) : null,
            weight: form.weight ? Number(form.weight) : null,
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
              Start Your<br /><span style={{ color: "#1D9E75" }}>Health Journey.</span>
            </h1>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.05rem", color: "#5DCAA5", lineHeight: 1.75, maxWidth: "400px" }}>
              Create your Biowire account in seconds. We'll personalize your experience based on your health profile.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col gap-4">
            {[{ n: 1, label: "Account details" }, { n: 2, label: "Personal information" }].map((s) => (
              <div key={s.n} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: step >= s.n ? "#1D9E75" : "rgba(29,158,117,0.12)", border: step >= s.n ? "none" : "1px solid rgba(29,158,117,0.25)" }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: step >= s.n ? "white" : "#5DCAA5", fontWeight: 600 }}>
                    {s.n}
                  </span>
                </div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: step >= s.n ? "#9FE1CB" : "rgba(159,225,203,0.4)" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "rgba(159,225,203,0.4)" }}>
          Biowire does not provide medical advice. Always consult a qualified healthcare professional.
        </motion.p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center relative overflow-y-auto"
        style={{ background: "#F7FFFE", padding: "2rem" }}>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full flex flex-col gap-7"
          style={{ maxWidth: "420px" }}
        >
          <div className="lg:hidden">
            <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "1.5rem", color: "#1D9E75" }}>
              bio<span style={{ color: "#085041" }}>wire</span>
            </span>
          </div>

          <div className="flex gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{ background: step >= s ? "#1D9E75" : "#E1F5EE" }} />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(225,29,72,0.08)", border: "1px solid rgba(225,29,72,0.2)", color: "#e11d48", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <div className="flex flex-col gap-1">
                <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "2rem", color: "#2C2C2A", lineHeight: 1.2 }}>
                  Create account
                </h2>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#5F5E5A" }}>
                  Start with your basic details
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="John Doe"
                    autoComplete="name"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#1D9E75"}
                    onBlur={(e) => e.target.style.borderColor = "#E1F5EE"}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#1D9E75"}
                    onBlur={(e) => e.target.style.borderColor = "#E1F5EE"}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      style={{ ...inputStyle, paddingRight: "4rem" }}
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
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      style={{ ...inputStyle, paddingRight: "4rem" }}
                      onFocus={(e) => e.target.style.borderColor = form.confirmPassword && form.confirmPassword !== form.password ? "#e11d48" : "#1D9E75"}
                      onBlur={(e) => e.target.style.borderColor = form.confirmPassword && form.confirmPassword !== form.password ? "#e11d48" : "#E1F5EE"}
                    />
                    <button
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: "#888780", fontSize: "0.8rem", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                      {showConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="w-full py-3.5 rounded-2xl text-white font-medium"
                style={{ background: "#1D9E75", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem" }}
              >
                Continue
              </motion.button>

              <p className="text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.875rem", color: "#5F5E5A" }}>
                Already have an account?{" "}
                <a href="/login" style={{ color: "#1D9E75", fontWeight: 500 }}>Sign in</a>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col gap-1">
                <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "2rem", color: "#2C2C2A", lineHeight: 1.2 }}>
                  Health profile
                </h2>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#5F5E5A" }}>
                  Help us personalize your experience
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label style={labelStyle}>Date of Birth</label>
                    <input type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)}
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "#1D9E75"}
                      onBlur={(e) => e.target.style.borderColor = "#E1F5EE"} />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label style={labelStyle}>Gender</label>
                    <select value={form.gender} onChange={(e) => update("gender", e.target.value)}
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "#1D9E75"}
                      onBlur={(e) => e.target.style.borderColor = "#E1F5EE"}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label style={labelStyle}>Height (cm)</label>
                    <input type="number" value={form.height} onChange={(e) => update("height", e.target.value)}
                      placeholder="175" style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "#1D9E75"}
                      onBlur={(e) => e.target.style.borderColor = "#E1F5EE"} />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label style={labelStyle}>Weight (kg)</label>
                    <input type="number" value={form.weight} onChange={(e) => update("weight", e.target.value)}
                      placeholder="70" style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "#1D9E75"}
                      onBlur={(e) => e.target.style.borderColor = "#E1F5EE"} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Blood Type</label>
                  <select value={form.bloodType} onChange={(e) => update("bloodType", e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#1D9E75"}
                    onBlur={(e) => e.target.style.borderColor = "#E1F5EE"}>
                    <option value="">Select blood type</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"].map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setError(""); setStep(1); }}
                  className="flex-1 py-3.5 rounded-2xl font-medium"
                  style={{ background: "white", border: "1.5px solid #E1F5EE", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "#2C2C2A" }}
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl text-white font-medium disabled:opacity-60"
                  style={{ background: "#1D9E75", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem" }}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </motion.button>
              </div>

              <p className="text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#888780", lineHeight: 1.6 }}>
                By creating an account, you agree to our{" "}
                <a href="#" style={{ color: "#1D9E75" }}>Terms of Service</a> and{" "}
                <a href="#" style={{ color: "#1D9E75" }}>Privacy Policy</a>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}