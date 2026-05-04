"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Image, File, X,
  Search, Trash2, Microscope, Activity
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type RecordType = "lab" | "imaging" | "report" | "prescription" | "other";

interface MedicalRecord {
  id: string;
  name: string;
  type: RecordType;
  doctor?: string;
  hospital?: string;
  tags: string[];
  notes?: string;
  file_url?: string;
  created_at: string;
}

const typeConfig: Record<RecordType, { label: string; color: string; bg: string; icon: any }> = {
  lab:          { label: "Lab Results",  color: "#6366f1", bg: "rgba(99,102,241,0.08)",  icon: Microscope },
  imaging:      { label: "Imaging",      color: "#0891b2", bg: "rgba(8,145,178,0.08)",   icon: Image      },
  report:       { label: "Report",       color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",  icon: FileText   },
  prescription: { label: "Prescription", color: "#22c55e", bg: "rgba(34,197,94,0.08)",   icon: Activity   },
  other:        { label: "Other",        color: "#94a3b8", bg: "rgba(148,163,184,0.08)", icon: File       },
};

function RecordCard({ record, onDelete, index }: {
  record: MedicalRecord; onDelete: () => void; index: number;
}) {
  const cfg = typeConfig[record.type];
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 24 }}
      className="rounded-2xl p-4 relative group"
      style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
          <Icon className="w-5 h-5" style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-slate-900 text-sm leading-snug truncate">{record.name}</p>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {record.file_url && (
                <a href={record.file_url} target="_blank" rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-indigo-50">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                </a>
              )}
              <button onClick={e => { e.stopPropagation(); onDelete(); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-50">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
            {record.doctor && <span className="text-xs text-slate-400">{record.doctor}</span>}
            {record.file_url && (
              <span className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e" }}>
                📎 File attached
              </span>
            )}
          </div>
          {record.notes && <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">{record.notes}</p>}
          <div className="flex items-center justify-between mt-2.5 pt-2.5"
            style={{ borderTop: "1px solid rgba(203,213,225,0.3)" }}>
            <div className="flex flex-wrap gap-1">
              {record.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 rounded text-xs" style={{ background: "#f1f5f9", color: "#64748b" }}>
                  #{tag}
                </span>
              ))}
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">
              {new Date(record.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UploadModal({ onClose, onUpload }: { onClose: () => void; onUpload: (r: MedicalRecord) => void }) {
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "", type: "lab" as RecordType,
    doctor: "", hospital: "", notes: "", tags: ""
  });

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let file_url = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("medical-records")
          .upload(path, file);
        if (uploadError) {
          console.error("Upload error:", uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from("medical-records")
            .getPublicUrl(path);
          file_url = urlData.publicUrl;
        }
      }

      const { data, error } = await supabase
        .from("medical_records")
        .insert({
          user_id: user.id,
          name: form.name,
          type: form.type,
          doctor: form.doctor || null,
          hospital: form.hospital || null,
          notes: form.notes || null,
          tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
          file_url,
        })
        .select()
        .single();

      if (error) { console.error("Record save error:", error); return; }
      if (data) onUpload(data as MedicalRecord);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "white", boxShadow: "0 25px 80px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>

        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(203,213,225,0.4)" }}>
          <h3 className="font-bold text-slate-900">Upload Medical Record</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* File drop zone */}
          <div
            className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-8 cursor-pointer transition-all"
            style={{
              borderColor: dragging ? "#6366f1" : file ? "#22c55e" : "rgba(203,213,225,0.6)",
              background: dragging ? "rgba(99,102,241,0.04)" : file ? "rgba(34,197,94,0.04)" : "#fafafa",
            }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) setFile(f);
            }}
            onClick={() => document.getElementById("file-input")?.click()}>
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }}
            />
            <Upload className="w-8 h-8 mb-2" style={{ color: file ? "#22c55e" : "#cbd5e1" }} />
            {file ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-emerald-600">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-500">Drop file here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG — max 50MB</p>
              </>
            )}
          </div>

          {[
            { label: "Document Name *", key: "name",     placeholder: "e.g. Blood Test Results April 2026" },
            { label: "Doctor",          key: "doctor",   placeholder: "e.g. Dr. Smith" },
            { label: "Hospital / Clinic", key: "hospital", placeholder: "e.g. City Hospital" },
            { label: "Tags (comma separated)", key: "tags", placeholder: "e.g. blood, routine, annual" },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{field.label}</label>
              <input
                value={form[field.key as keyof typeof form] as string}
                onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }}
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Type</label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(typeConfig) as RecordType[]).map(type => {
                const cfg = typeConfig[type];
                return (
                  <button key={type} onClick={() => setForm(p => ({ ...p, type }))}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: form.type === type ? cfg.bg : "#f8fafc",
                      color: form.type === type ? cfg.color : "#64748b",
                      border: `1px solid ${form.type === type ? cfg.color + "40" : "rgba(203,213,225,0.6)"}`,
                    }}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Any additional notes..." rows={2}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none"
              style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }} />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500"
              style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)" }}>
              Cancel
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSave} disabled={!form.name.trim() || saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
              {saving ? "Uploading..." : "Upload Record"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function RecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<RecordType | "all">("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecords() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("medical_records")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) setRecords(data as MedicalRecord[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const record = records.find(r => r.id === confirmDelete);
    if (record?.file_url) {
      const path = record.file_url.split("/medical-records/")[1];
      if (path) await supabase.storage.from("medical-records").remove([path]);
    }
    const { error } = await supabase.from("medical_records").delete().eq("id", confirmDelete);
    if (!error) setRecords(prev => prev.filter(r => r.id !== confirmDelete));
    setConfirmDelete(null);
  };

  const filtered = records.filter(r => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
        !r.tags.some(t => t.includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Medical Records</h2>
          <p className="text-slate-500 text-sm mt-0.5">Store and manage your health documents securely</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
          <Upload className="w-4 h-4" /> Upload Record
        </motion.button>
      </div>

      {/* Stats / Filter */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.75rem" }}>
        {(["all", ...Object.keys(typeConfig)] as (RecordType | "all")[]).map((type) => {
          const count = type === "all" ? records.length : records.filter(r => r.type === type).length;
          const cfg = type === "all"
            ? { label: "All", color: "#6366f1", bg: "rgba(99,102,241,0.08)", icon: FileText }
            : typeConfig[type as RecordType];
          const Icon = cfg.icon;
          return (
            <motion.div key={type} whileHover={{ y: -2 }}
              onClick={() => setFilterType(type)}
              className="rounded-2xl p-4 cursor-pointer transition-all"
              style={{
                background: "white",
                border: `1px solid ${filterType === type ? cfg.color : "rgba(203,213,225,0.5)"}`,
                boxShadow: filterType === type ? `0 4px 16px ${cfg.color}20` : "0 2px 8px rgba(0,0,0,0.04)",
              }}>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center mb-2" style={{ background: cfg.bg }}>
                <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
              </div>
              <p className="text-xl font-black" style={{ color: cfg.color }}>{count}</p>
              <p className="text-xs text-slate-400 mt-0.5">{cfg.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
        style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search records, tags, doctors..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400" />
        {search && <button onClick={() => setSearch("")}><X className="w-4 h-4 text-slate-400" /></button>}
      </div>

      {/* Records list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl"
          style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)" }}>
          <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">No records found</p>
          <p className="text-slate-400 text-xs mt-1">Upload your first medical document</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((record, i) => (
            <RecordCard key={record.id} record={record} index={i}
              onDelete={() => setConfirmDelete(record.id)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onUpload={r => setRecords(prev => [r, ...prev])}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
            onClick={() => setConfirmDelete(null)}>
            <motion.div
              initial={{ scale: 0.95, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ background: "white", boxShadow: "0 25px 80px rgba(0,0,0,0.2)" }}
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(225,29,72,0.08)" }}>
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-center mb-1">Delete Record?</h3>
              <p className="text-sm text-slate-400 text-center mb-5">
                This action cannot be undone. The record and its file will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)" }}>
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}