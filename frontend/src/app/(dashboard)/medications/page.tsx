"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Pill, Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  active: boolean;
  taken_today: boolean;
}

const frequencyOptions = [
  { value: "once_daily",  label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_daily", label: "Three times daily" },
  { value: "every_other", label: "Every other day" },
  { value: "weekly",      label: "Weekly" },
  { value: "as_needed",   label: "As needed" },
];

export default function MedicationsPage() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "all">("active");
  const [form, setForm] = useState({
    name: "", dosage: "", frequency: "once_daily",
    start_date: "", end_date: "", notes: ""
  });

  useEffect(() => {
    async function loadMeds() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("medications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) setMeds(data.map(m => ({ ...m, taken_today: false })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadMeds();
  }, []);

  const toggleTaken = (id: string) => {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, taken_today: !m.taken_today } : m));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.dosage.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("medications")
        .insert({
          user_id: user.id,
          name: form.name,
          dosage: form.dosage,
          frequency: form.frequency,
          start_date: form.start_date || new Date().toISOString().split("T")[0],
          end_date: form.end_date || null,
          notes: form.notes || null,
          active: true,
        })
        .select()
        .single();

      if (error) { console.error("Medication save error:", error); return; }
      if (data) setMeds(prev => [{ ...data, taken_today: false }, ...prev]);

      setForm({ name: "", dosage: "", frequency: "once_daily", start_date: "", end_date: "", notes: "" });
      setShowForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const displayed = activeTab === "active" ? meds.filter(m => m.active) : meds;
  const activeMeds = meds.filter(m => m.active);
  const takenToday = activeMeds.filter(m => m.taken_today).length;
  const adherence = activeMeds.length > 0 ? Math.round((takenToday / activeMeds.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Medications</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track your medications and daily intake</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
          <Plus className="w-4 h-4" /> Add Medication
        </motion.button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[
          { label: "Active Medications", value: activeMeds.length, color: "#6366f1" },
          { label: "Taken Today", value: `${takenToday}/${activeMeds.length}`, color: "#22c55e" },
          { label: "Adherence", value: `${adherence}%`, color: adherence >= 80 ? "#22c55e" : adherence >= 50 ? "#f59e0b" : "#e11d48" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-5"
            style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-xs font-semibold text-slate-400 mb-2">{stat.label}</p>
            <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Today's checklist */}
      {activeMeds.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <p className="text-sm font-bold text-slate-900 mb-4">Today's Medications</p>
          <div className="flex flex-col gap-2">
            {activeMeds.map((med) => (
              <motion.div key={med.id} whileHover={{ x: 2 }}
                className="flex items-center gap-4 p-3.5 rounded-xl cursor-pointer transition-all"
                style={{
                  background: med.taken_today ? "rgba(34,197,94,0.05)" : "#f8fafc",
                  border: `1px solid ${med.taken_today ? "rgba(34,197,94,0.2)" : "rgba(203,213,225,0.5)"}`,
                }}
                onClick={() => toggleTaken(med.id)}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: med.taken_today ? "#22c55e" : "white",
                    border: `2px solid ${med.taken_today ? "#22c55e" : "rgba(203,213,225,0.8)"}`,
                  }}>
                  {med.taken_today && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{med.name}</p>
                  <p className="text-xs text-slate-400">{med.dosage} · {frequencyOptions.find(f => f.value === med.frequency)?.label}</p>
                </div>
                {med.taken_today
                  ? <span className="text-xs font-semibold text-emerald-500">Taken ✓</span>
                  : <span className="text-xs font-semibold text-slate-400">Pending</span>}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(203,213,225,0.4)" }}>
          <p className="text-sm font-semibold text-slate-700">{displayed.length} medications</p>
          <div className="flex gap-1.5">
            {[{ key: "active", label: "Active" }, { key: "all", label: "All" }].map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key as "active" | "all")}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: activeTab === t.key ? "#6366f1" : "#f8fafc",
                  color: activeTab === t.key ? "white" : "#64748b",
                  border: `1px solid ${activeTab === t.key ? "#6366f1" : "rgba(203,213,225,0.6)"}`,
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-12 text-center">
            <Pill className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No medications added yet.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(203,213,225,0.3)" }}>
            {displayed.map((med, i) => (
              <motion.div key={med.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="px-5 py-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: med.active ? "rgba(99,102,241,0.08)" : "rgba(203,213,225,0.2)" }}>
                  <Pill className="w-5 h-5" style={{ color: med.active ? "#6366f1" : "#94a3b8" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900 text-sm">{med.name}</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: med.active ? "rgba(34,197,94,0.1)" : "rgba(203,213,225,0.3)",
                        color: med.active ? "#16a34a" : "#94a3b8",
                      }}>
                      {med.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1.5">
                    {med.dosage} · {frequencyOptions.find(f => f.value === med.frequency)?.label}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      Started {new Date(med.start_date + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {med.end_date && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        Until {new Date(med.end_date + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                  {med.notes && <p className="text-xs text-slate-400 mt-1">{med.notes}</p>}
                </div>
                {med.active && (
                  <div className="flex-shrink-0">
                    {med.taken_today
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : <AlertCircle className="w-5 h-5 text-amber-400" />}
                  </div>
                )}
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
              className="rounded-2xl p-6 w-full max-w-md mx-4"
              style={{ background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900">Add Medication</h3>
                <button onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { label: "Medication Name", key: "name",   placeholder: "e.g. Ibuprofen" },
                  { label: "Dosage",          key: "dosage", placeholder: "e.g. 400mg" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{field.label}</label>
                    <input
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                      style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }}
                    />
                  </div>
                ))}

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Frequency</label>
                  <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                    style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }}>
                    {frequencyOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {[
                    { label: "Start Date",           key: "start_date" },
                    { label: "End Date (optional)",  key: "end_date" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{field.label}</label>
                      <input type="date"
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                        style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Notes (optional)</label>
                  <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="e.g. Take with food"
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                    style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }} />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)" }}>
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={!form.name.trim() || !form.dosage.trim() || saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                  {saving ? "Saving..." : "Save"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}