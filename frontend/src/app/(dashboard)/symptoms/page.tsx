"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SymptomEntry {
  id: string;
  symptoms: string[];
  severity: number;
  body_region: string;
  notes?: string;
  logged_at: string;
}

const bodyRegions = [
  "Head", "Eyes", "Ears", "Throat", "Chest", "Heart",
  "Abdomen", "Back", "Arms", "Hands", "Pelvis", "Legs", "Feet", "Skin"
];

const commonSymptoms = [
  "Headache", "Chest pain", "Shortness of breath", "Nausea", "Fatigue",
  "Fever", "Cough", "Dizziness", "Back pain", "Joint pain",
  "Abdominal pain", "Rash", "Palpitations", "Swelling", "Loss of appetite"
];

const severityConfig = [
  { level: 1, label: "Minimal",  color: "#22c55e" },
  { level: 2, label: "Mild",     color: "#84cc16" },
  { level: 3, label: "Moderate", color: "#f59e0b" },
  { level: 4, label: "Severe",   color: "#f97316" },
  { level: 5, label: "Critical", color: "#e11d48" },
];

function SeverityBadge({ level }: { level: number }) {
  const cfg = severityConfig[Math.min(Math.ceil(level / 2) - 1, 4)];
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      {level}/10 · {cfg.label}
    </span>
  );
}

export default function SymptomsPage() {
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [severity, setSeverity] = useState(5);
  const [region, setRegion] = useState("");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState<"all" | "severe">("all");

  useEffect(() => {
    async function loadEntries() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("symptom_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false });
        if (data) setEntries(data as SymptomEntry[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadEntries();
  }, []);

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const addCustom = () => {
    if (!customSymptom.trim()) return;
    if (!selectedSymptoms.includes(customSymptom.trim()))
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
    setCustomSymptom("");
  };

  const handleSave = async () => {
    if (selectedSymptoms.length === 0) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("symptom_logs")
        .insert({
          user_id: user.id,
          symptoms: selectedSymptoms,
          severity,
          body_region: region || "General",
          notes: notes || null,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) { console.error("Symptom save error:", error); return; }
      if (data) setEntries(prev => [data as SymptomEntry, ...prev]);

      setSelectedSymptoms([]);
      setSeverity(5);
      setRegion("");
      setNotes("");
      setShowForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === "severe" ? entries.filter(e => e.severity >= 7) : entries;
  const severeCount = entries.filter(e => e.severity >= 7).length;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Symptom Log</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track and monitor your daily symptoms</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
          <Plus className="w-4 h-4" /> Log Symptoms
        </motion.button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[
          { label: "Total Logs",  value: entries.length, color: "#6366f1" },
          { label: "This Week",   value: entries.filter(e => new Date(e.logged_at) > new Date(Date.now() - 7 * 86400000)).length, color: "#0891b2" },
          { label: "Severe (≥7)", value: severeCount, color: "#e11d48" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-5"
            style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-xs font-semibold text-slate-400 mb-2">{stat.label}</p>
            <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter + List */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>

        <div className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(203,213,225,0.4)" }}>
          <p className="text-sm font-semibold text-slate-700">
            {filtered.length} {filter === "severe" ? "severe " : ""}entries
          </p>
          <div className="flex gap-1.5">
            {[{ key: "all", label: "All" }, { key: "severe", label: "⚠ Severe" }].map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key as "all" | "severe")}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: filter === f.key ? "#6366f1" : "#f8fafc",
                  color: filter === f.key ? "white" : "#64748b",
                  border: `1px solid ${filter === f.key ? "#6366f1" : "rgba(203,213,225,0.6)"}`,
                }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400 text-sm">No symptom logs yet.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(203,213,225,0.3)" }}>
            {filtered.map((entry, i) => (
              <motion.div key={entry.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {entry.symptoms.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: "rgba(99,102,241,0.08)", color: "#4f46e5", border: "1px solid rgba(99,102,241,0.2)" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <SeverityBadge level={entry.severity} />
                      <span className="text-xs text-slate-400">📍 {entry.body_region}</span>
                    </div>
                    {entry.notes && <p className="text-xs text-slate-400 mt-1.5">{entry.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <p className="text-xs text-slate-400">
                      {new Date(entry.logged_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(entry.logged_at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {entry.severity >= 7 && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowForm(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="rounded-2xl p-6 w-full max-w-lg mx-4"
              style={{ background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" }}
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900">Log Symptoms</h3>
                <button onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Common symptoms */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-600 mb-2 block">Select Symptoms</label>
                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.map((s) => {
                    const sel = selectedSymptoms.includes(s);
                    return (
                      <button key={s} onClick={() => toggleSymptom(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{
                          background: sel ? "rgba(99,102,241,0.1)" : "#f8fafc",
                          color: sel ? "#4f46e5" : "#64748b",
                          border: `1px solid ${sel ? "rgba(99,102,241,0.4)" : "rgba(203,213,225,0.6)"}`,
                        }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom */}
              <div className="flex gap-2 mb-4">
                <input value={customSymptom} onChange={e => setCustomSymptom(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCustom()}
                  placeholder="Add custom symptom..."
                  className="flex-1 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }} />
                <button onClick={addCustom}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#6366f1" }}>Add</button>
              </div>

              {/* Selected */}
              {selectedSymptoms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4 p-3 rounded-xl"
                  style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)" }}>
                  {selectedSymptoms.map(s => (
                    <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: "rgba(99,102,241,0.1)", color: "#4f46e5", border: "1px solid rgba(99,102,241,0.2)" }}>
                      {s}
                      <button onClick={() => toggleSymptom(s)} className="ml-0.5 hover:opacity-70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Severity */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-600">Severity</label>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                    style={{
                      background: severity >= 7 ? "rgba(225,29,72,0.1)" : "rgba(99,102,241,0.08)",
                      color: severity >= 7 ? "#e11d48" : "#4f46e5",
                    }}>
                    {severity}/10
                  </span>
                </div>
                <input type="range" min={1} max={10} value={severity}
                  onChange={e => setSeverity(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: severity >= 7 ? "#e11d48" : "#6366f1" }} />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-400">Minimal</span>
                  <span className="text-xs text-slate-400">Critical</span>
                </div>
              </div>

              {/* Body region */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Body Region</label>
                <select value={region} onChange={e => setRegion(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: region ? "#1e293b" : "#94a3b8" }}>
                  <option value="">Select region...</option>
                  {bodyRegions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any additional details..." rows={2}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)" }}>
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={selectedSymptoms.length === 0 || saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                  {saving ? "Saving..." : "Save Log"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}