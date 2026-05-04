"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Heart, Droplets, Plus, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/lib/supabase";

type VitalType = "blood_pressure" | "heart_rate" | "blood_sugar";

interface VitalEntry {
  id: string;
  type: VitalType;
  value: string;
  unit: string;
  measured_at: string;
  notes?: string;
}

const vitalConfig = {
  blood_pressure: {
    label: "Blood Pressure",
    icon: Activity,
    unit: "mmHg",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
    placeholder: "120/80",
    normal: "90/60 – 120/80",
    description: "Systolic / Diastolic",
  },
  heart_rate: {
    label: "Heart Rate",
    icon: Heart,
    unit: "bpm",
    color: "#e11d48",
    bg: "rgba(225,29,72,0.08)",
    border: "rgba(225,29,72,0.2)",
    placeholder: "72",
    normal: "60 – 100 bpm",
    description: "Beats per minute",
  },
  blood_sugar: {
    label: "Blood Sugar",
    icon: Droplets,
    unit: "mg/dL",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    placeholder: "95",
    normal: "70 – 100 mg/dL (fasting)",
    description: "Fasting glucose level",
  },
};

function MiniChart({ entries, color }: { entries: VitalEntry[]; color: string }) {
  if (entries.length < 2) return null;
  const values = entries.map(e => parseFloat(e.value.split("/")[0]));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 120, h = 36, pad = 4;

  const points = values.slice(-7).map((v, i, arr) => {
    const x = pad + (i / (arr.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {values.slice(-7).map((v, i, arr) => {
        const x = pad + (i / (arr.length - 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
}

function getTrend(entries: VitalEntry[]) {
  if (entries.length < 2) return "stable";
  const last = parseFloat(entries[0].value.split("/")[0]);
  const prev = parseFloat(entries[1].value.split("/")[0]);
  if (last > prev + 2) return "up";
  if (last < prev - 2) return "down";
  return "stable";
}

export default function VitalsPage() {
  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<VitalType>("blood_pressure");
  const [form, setForm] = useState({ value: "", notes: "" });
  const [activeTab, setActiveTab] = useState<VitalType>("blood_pressure");

  useEffect(() => {
    async function loadVitals() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("vital_signs")
          .select("*")
          .eq("user_id", user.id)
          .order("measured_at", { ascending: false });
        if (data) setEntries(data as VitalEntry[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadVitals();
  }, []);

  const handleAdd = async () => {
    if (!form.value.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const cfg = vitalConfig[selectedType];
      const { data, error } = await supabase
        .from("vital_signs")
        .insert({
          user_id: user.id,
          type: selectedType,
          value: parseFloat(form.value.split("/")[0]),
          unit: cfg.unit,
          notes: form.notes || null,
          measured_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) { console.error("Vital save error:", error); return; }
      if (data) {
        // Normalize returned data to match our interface
        const entry: VitalEntry = {
          id: data.id,
          type: data.type,
          value: form.value, // keep original string (e.g. "120/80")
          unit: data.unit,
          measured_at: data.measured_at,
          notes: data.notes,
        };
        setEntries(prev => [entry, ...prev]);
      }

      setForm({ value: "", notes: "" });
      setShowForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const filtered = entries.filter(e => e.type === activeTab);
  const cfg = vitalConfig[activeTab];

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Vitals</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track your blood pressure, heart rate, and blood sugar</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
          <Plus className="w-4 h-4" /> Add Reading
        </motion.button>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {(Object.keys(vitalConfig) as VitalType[]).map((type) => {
            const c = vitalConfig[type];
            const Icon = c.icon;
            const typeEntries = entries.filter(e => e.type === type);
            const latest = typeEntries[0];
            const t = getTrend(typeEntries);
            return (
              <motion.div key={type}
                whileHover={{ y: -2 }}
                onClick={() => setActiveTab(type)}
                className="rounded-2xl p-5 cursor-pointer relative overflow-hidden"
                style={{
                  background: "white",
                  border: `1px solid ${activeTab === type ? c.color : "rgba(203,213,225,0.5)"}`,
                  boxShadow: activeTab === type
                    ? `0 4px 20px ${c.bg}, 0 0 0 2px ${c.border}`
                    : "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl pointer-events-none"
                  style={{ background: c.color, opacity: 0.1 }} />
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: c.color, width: 18, height: 18 }} />
                  </div>
                  {t === "up" ? <TrendingUp className="w-4 h-4 text-rose-400" /> :
                   t === "down" ? <TrendingDown className="w-4 h-4 text-emerald-400" /> :
                   <Minus className="w-4 h-4 text-slate-300" />}
                </div>
                <p className="text-xs font-semibold text-slate-400 mb-1">{c.label}</p>
                <p className="text-2xl font-black mb-0.5" style={{ color: c.color }}>
                  {latest?.value ?? "—"}
                </p>
                <p className="text-xs text-slate-400">{c.unit}</p>
                <div className="mt-3">
                  <MiniChart entries={typeEntries} color={c.color} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>

        {/* Tab bar */}
        <div className="flex border-b" style={{ borderColor: "rgba(203,213,225,0.5)" }}>
          {(Object.keys(vitalConfig) as VitalType[]).map((type) => {
            const c = vitalConfig[type];
            return (
              <button key={type} onClick={() => setActiveTab(type)}
                className="flex-1 py-3.5 text-xs font-semibold transition-all"
                style={{
                  color: activeTab === type ? c.color : "#94a3b8",
                  borderBottom: activeTab === type ? `2px solid ${c.color}` : "2px solid transparent",
                  background: activeTab === type ? c.bg : "transparent",
                }}>
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Normal range info */}
        <div className="px-5 py-3 flex items-center justify-between"
          style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}>
          <p className="text-xs font-semibold" style={{ color: cfg.color }}>
            Normal range: {cfg.normal}
          </p>
          <p className="text-xs text-slate-400">{cfg.description}</p>
        </div>

        {/* Entries list */}
        <div className="divide-y" style={{ borderColor: "rgba(203,213,225,0.3)" }}>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm">No readings yet. Add your first reading.</p>
            </div>
          ) : (
            filtered.map((entry, i) => (
              <motion.div key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {entry.value} <span className="font-normal text-slate-400 text-xs">{entry.unit}</span>
                    </p>
                    {entry.notes && <p className="text-xs text-slate-400 mt-0.5">{entry.notes}</p>}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  {new Date(entry.measured_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowForm(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="rounded-2xl p-6 w-full max-w-md mx-4"
              style={{ background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900">Add Vital Reading</h3>
                <button onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Type selector */}
              <div className="flex gap-2 mb-4">
                {(Object.keys(vitalConfig) as VitalType[]).map((type) => {
                  const c = vitalConfig[type];
                  return (
                    <button key={type} onClick={() => setSelectedType(type)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: selectedType === type ? c.bg : "#f8fafc",
                        color: selectedType === type ? c.color : "#94a3b8",
                        border: `1px solid ${selectedType === type ? c.border : "rgba(203,213,225,0.5)"}`,
                      }}>
                      {c.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                    Value ({vitalConfig[selectedType].unit})
                  </label>
                  <input
                    type="text"
                    value={form.value}
                    onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                    placeholder={vitalConfig[selectedType].placeholder}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Notes (optional)</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="e.g. Fasting, post-meal, after exercise"
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)" }}>
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  disabled={!form.value.trim() || saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                  {saving ? "Saving..." : "Save Reading"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}