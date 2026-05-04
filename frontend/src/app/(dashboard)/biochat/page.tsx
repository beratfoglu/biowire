"use client";
import { supabase } from "@/lib/supabase";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Sparkles, Activity, Brain, Eye, Ear, Wind, 
  HeartPulse, Bone, Dumbbell, Hand, Stethoscope, 
  Footprints, Droplets, Flame, Clock, Thermometer,
  ShieldAlert, CheckCircle2, AlertTriangle
} from "lucide-react";

const bodyRegions = [
  { id: "head", label: "Head", icon: Brain },
  { id: "eyes", label: "Eyes", icon: Eye },
  { id: "ears", label: "Ears", icon: Ear },
  { id: "throat", label: "Throat", icon: Thermometer },
  { id: "chest", label: "Chest", icon: Wind },
  { id: "heart", label: "Heart", icon: HeartPulse },
  { id: "abdomen", label: "Abdomen", icon: Activity },
  { id: "back", label: "Back", icon: Bone },
  { id: "arms", label: "Arms", icon: Dumbbell },
  { id: "hands", label: "Hands", icon: Hand },
  { id: "pelvis", label: "Pelvis", icon: Stethoscope },
  { id: "legs", label: "Legs", icon: Activity },
  { id: "feet", label: "Feet", icon: Footprints },
  { id: "skin", label: "Skin", icon: Droplets },
];

const specialistLabels: Record<string, string> = {
  cardiologist: "Cardiologist", neurologist: "Neurologist", gastroenterologist: "Gastroenterologist",
  urologist: "Urologist", pulmonologist: "Pulmonologist", dermatologist: "Dermatologist",
  orthopedist: "Orthopedist", psychiatrist: "Psychiatrist", endocrinologist: "Endocrinologist",
  ophthalmologist: "Ophthalmologist", general_practitioner: "General Practitioner",
};

const getUrgencyStyles = (level?: string) => {
  switch (level) {
    case "HIGH": return { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", fill: "#e11d48" };
    case "MEDIUM": return { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", fill: "#d97706" };
    default: return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", fill: "#059669" };
  }
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  urgency_score?: number;
  urgency_level?: string;
  recommended_specialist?: string;
}

export default function BioChatPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome", role: "assistant", content: "Hello! I'm BioChat AI. Please select your symptoms from the panel or describe them below."
  }]);
  const [input, setInput] = useState("");
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState(1);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ score: number; level: string; specialist: string } | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleRegion = (id: string) => {
    setSelectedRegions(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const buildAutoMessage = () => {
    if (selectedRegions.length === 0) return input;
    const regionLabels = selectedRegions.map(id => bodyRegions.find(r => r.id === id)?.label).filter(Boolean).join(", ");
    return `I am experiencing symptoms in my ${regionLabels}. The severity is ${severity}/10 and it has been lasting for ${duration} day(s).${input ? ` Additional notes: ${input}` : ""}`;
  };

  const sendMessage = async (overrideMessage?: string) => {
    const messageToSend = overrideMessage || input;
    if (!messageToSend.trim() || loading) return;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;


    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: messageToSend }]);
    setInput("");
    setLoading(true);

    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const sessionRes = await fetch("http://127.0.0.1:8000/biochat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": 'Bearer demo-token' },
          body: JSON.stringify({ title: messageToSend.slice(0, 50) }),
        });
        const sessionData = await sessionRes.json();
        currentSessionId = sessionData.id;
        setSessionId(currentSessionId);
      }

      const res = await fetch("http://127.0.0.1:8000/biochat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer demo-token` },
        body: JSON.stringify({
  session_id: currentSessionId,
  message: messageToSend,
  symptoms: [...selectedRegions.map(id => `${id} area`), messageToSend],
  severity,
  duration_days: duration,
  regions: selectedRegions,
  gender,
  language: "en",
}),
      });

      if (!res.ok) throw new Error("Backend not reachable");

      const data = await res.json();
      setLastResult({ score: data.urgency_score, level: data.urgency_level, specialist: data.recommended_specialist });
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "assistant", content: data.message,
        urgency_score: data.urgency_score, urgency_level: data.urgency_level, recommended_specialist: data.recommended_specialist,
      }]);

    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: "Sorry, I couldn't connect to the server. Please make sure the backend is running.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4" style={{ height: "calc(100vh - 120px)" }}>

      {/* ÜST — Symptom Builder */}
      <section className="flex-shrink-0 bg-white rounded-[1.5rem] p-5 border border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Symptom Profiler
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">Select affected regions and specify the parameters of your discomfort.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Gender</span>
            <div className="flex bg-slate-100/80 p-1 rounded-xl gap-0.5">
              {([
                { value: "male",   label: "♂ Male" },
                { value: "female", label: "♀ Female" },
              ] as const).map((g) => (
                <button key={g.value} onClick={() => setGender(g.value)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: gender === g.value ? "white" : "transparent",
                    color: gender === g.value ? "#4f46e5" : "#94a3b8",
                    boxShadow: gender === g.value ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Bölge chips */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Affected Areas</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
              {bodyRegions.map((region) => {
                const isSelected = selectedRegions.includes(region.id);
                const Icon = region.icon;
                return (
                  <motion.button key={region.id}
                    whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                    onClick={() => toggleRegion(region.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all
                      ${isSelected
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-inner"
                        : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"}`}>
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                    {region.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Kontroller */}
          <div className="flex flex-col gap-3 flex-shrink-0" style={{ width: "260px" }}>
            {/* Severity */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Flame className="w-3.5 h-3.5 text-rose-500" /> Severity
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${severity >= 7 ? "bg-rose-100 text-rose-700" : "bg-white text-slate-700 border border-slate-200"}`}>
                  {severity}/10
                </span>
              </div>
              <input type="range" min={1} max={10} value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer" />
            </div>

            {/* Duration */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Duration
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                  {duration}d
                </span>
              </div>
              <input type="range" min={1} max={30} value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mb-2" />
              <div className="flex gap-1.5">
                {[1, 3, 7, 14].map((d) => (
                  <button key={d} onClick={() => setDuration(d)}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-colors
                      ${duration === d ? "bg-indigo-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ALT — Chat + Sonuçlar */}
      <section className="flex gap-4 flex-1 min-h-0">

        {/* Chat */}
        <div className="flex-1 flex flex-col bg-white rounded-[1.5rem] border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-sm">BioChat Engine</p>
              <p className="text-slate-500 text-xs">Powered by Groq LLM + Fuzzy Logic</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-slate-50/30">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`p-3.5 text-sm leading-relaxed
                      ${msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-sm"
                        : "bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm shadow-sm"}`}>
                      {msg.content}
                    </div>
                    {msg.urgency_level && (
                      <div className="flex flex-wrap gap-1.5 px-1">
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border
                          ${getUrgencyStyles(msg.urgency_level).bg} ${getUrgencyStyles(msg.urgency_level).color} ${getUrgencyStyles(msg.urgency_level).border}`}>
                          {msg.urgency_level === "HIGH" ? <AlertTriangle className="w-3 h-3" /> : msg.urgency_level === "MEDIUM" ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          Score: {msg.urgency_score}
                        </span>
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <Stethoscope className="w-3 h-3" />
                          {specialistLabels[msg.recommended_specialist || ""] || msg.recommended_specialist || "General"}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm p-3.5 shadow-sm flex gap-1.5">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Describe your symptoms in detail..."
                className="flex-1 bg-transparent border-none outline-none text-sm p-2.5 text-slate-700 placeholder:text-slate-400 resize-none max-h-28 min-h-[40px]"
                rows={1}
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white disabled:opacity-40 disabled:bg-slate-300 transition-all mb-0.5 mr-0.5 flex-shrink-0">
                <Send className="w-4 h-4 ml-0.5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Sağ Panel */}
        <aside className="flex flex-col gap-4 flex-shrink-0 overflow-y-auto" style={{ width: "320px" }}>
          <AnimatePresence mode="popLayout">
            {lastResult ? (
              <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className={`relative overflow-hidden rounded-[1.5rem] p-6 border bg-white shadow-lg ${getUrgencyStyles(lastResult.level).border}`}>
                <div className={`absolute -top-8 -right-8 w-32 h-32 blur-3xl opacity-15 rounded-full ${getUrgencyStyles(lastResult.level).bg}`} />
                <div className="relative z-10">
                  <p className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-5 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Final Analysis
                  </p>
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-28 h-28 -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                        <motion.circle cx="56" cy="56" r="48"
                          stroke={getUrgencyStyles(lastResult.level).fill}
                          strokeWidth="10" fill="none" strokeLinecap="round"
                          initial={{ strokeDasharray: "0 1000" }}
                          animate={{ strokeDasharray: `${(lastResult.score / 100) * 301.59} 1000` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute flex items-center justify-center">
                        <span className={`text-3xl font-black ${getUrgencyStyles(lastResult.level).color}`}>
                          {lastResult.score}
                        </span>
                      </div>
                    </div>
                    <span className={`mt-3 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                      ${getUrgencyStyles(lastResult.level).bg} ${getUrgencyStyles(lastResult.level).color} ${getUrgencyStyles(lastResult.level).border}`}>
                      {lastResult.level} RISK
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Recommended Action</p>
                    <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                      <Stethoscope className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      Consult a {specialistLabels[lastResult.specialist] || lastResult.specialist}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div key="empty" className="bg-white rounded-[1.5rem] p-6 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center" style={{ minHeight: "240px" }}>
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Activity className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-600">Awaiting Data</p>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-[200px]">
                  Enter your symptoms or run a quick analysis to generate a medical report.
                </p>
              </div>
            )}
          </AnimatePresence>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-[1.5rem] shadow-lg text-white">
            <p className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> System Pipeline
            </p>
            <ul className="space-y-4 relative before:absolute before:inset-y-2 before:left-2 before:w-px before:bg-slate-700">
              {[
                { title: "Fuzzy Logic", desc: "Processes severity variables", icon: <Activity className="w-3 h-3" /> },
                { title: "Groq LLM", desc: "Cross-references medical data", icon: <Brain className="w-3 h-3" /> },
                { title: "Routing", desc: "Assigns optimal specialist", icon: <Stethoscope className="w-3 h-3" /> },
              ].map((item, i) => (
                <li key={i} className="flex gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-indigo-500 flex-shrink-0 flex items-center justify-center z-10 text-indigo-400">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}