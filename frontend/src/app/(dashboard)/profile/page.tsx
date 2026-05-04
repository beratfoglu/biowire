"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Heart, ChevronRight, Edit2, Check, X, KeyRound, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Profile {
  full_name: string;
  email: string;
  birth_date: string;
  gender: string;
  height: number;
  weight: number;
  blood_type: string;
  allergens: string[];
  chronic_conditions: string[];
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"];
const commonAllergens = ["Penicillin", "Aspirin", "Peanuts", "Shellfish", "Latex", "Pollen", "Dust mites", "Cat dander"];
const commonConditions = ["Hypertension", "Type 2 Diabetes", "Asthma", "Hypothyroidism", "Anxiety", "Depression", "Migraine", "Arthritis"];

const emptyProfile: Profile = {
  full_name: "", email: "", birth_date: "", gender: "",
  height: 0, weight: 0, blood_type: "",
  allergens: [], chronic_conditions: [],
};

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function EditableField({ label, value, onSave, type = "text", options, readonly }: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  type?: string;
  options?: string[];
  readonly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);

  const handleSave = () => { onSave(draft); setEditing(false); };
  const handleCancel = () => { setDraft(value); setEditing(false); };

  const displayValue = type === "date" ? formatDateDisplay(value) : (value || "—");

  return (
    <div className="flex items-center justify-between py-3.5"
      style={{ borderBottom: "1px solid rgba(203,213,225,0.3)" }}>
      <div className="flex-1">
        <p className="text-xs font-semibold text-slate-400 mb-0.5">{label}</p>
        {editing ? (
          options ? (
            <select value={draft} onChange={e => setDraft(e.target.value)}
              className="mt-1 rounded-lg px-2.5 py-1.5 text-sm outline-none"
              style={{ background: "#f8fafc", border: "1px solid rgba(99,102,241,0.4)", color: "#1e293b" }}>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              type={type}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              autoFocus
              className="mt-1 rounded-lg px-2.5 py-1.5 text-sm outline-none"
              style={{ background: "#f8fafc", border: "1px solid rgba(99,102,241,0.4)", color: "#1e293b", width: "100%" }}
            />
          )
        ) : (
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{displayValue}</p>
        )}
      </div>
      {!readonly && (
        <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
          {editing ? (
            <>
              <button onClick={handleSave}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleCancel}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(203,213,225,0.3)", color: "#94a3b8" }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100">
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TagField({ label, tags, options, onUpdate }: {
  label: string; tags: string[]; options: string[]; onUpdate: (tags: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [custom, setCustom] = useState("");

  const toggle = (tag: string) => {
    const updated = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
    onUpdate(updated);
  };

  const addCustom = () => {
    if (!custom.trim() || tags.includes(custom.trim())) return;
    onUpdate([...tags, custom.trim()]);
    setCustom("");
  };

  return (
    <div className="py-3.5" style={{ borderBottom: "1px solid rgba(203,213,225,0.3)" }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        <button onClick={() => setEditing(!editing)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100">
          {editing
            ? <Check className="w-3.5 h-3.5 text-green-500" />
            : <Edit2 className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.length === 0 && !editing && <p className="text-sm text-slate-400">None added</p>}
        {tags.map(tag => (
          <span key={tag}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: "rgba(99,102,241,0.08)", color: "#4f46e5", border: "1px solid rgba(99,102,241,0.2)" }}>
            {tag}
            {editing && (
              <button onClick={() => toggle(tag)} className="ml-0.5 hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>
      {editing && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {options.filter(o => !tags.includes(o)).map(o => (
              <button key={o} onClick={() => toggle(o)}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{ background: "#f8fafc", color: "#64748b", border: "1px solid rgba(203,213,225,0.6)" }}>
                + {o}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCustom()}
              placeholder="Add custom..."
              className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-none"
              style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }}
            />
            <button onClick={addCustom}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "#6366f1" }}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        userIdRef.current = user.id;

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)          // ← user_id → id
          .maybeSingle();

        if (data) {
          setProfileExists(true);
          setProfile({
            full_name: data.full_name || "",
            email: user.email || "",
            birth_date: data.birth_date || "",
            gender: data.gender || "",
            height: data.height || 0,
            weight: data.weight || 0,
            blood_type: data.blood_type || "",
            allergens: Array.isArray(data.allergens) ? data.allergens : [],
            chronic_conditions: Array.isArray(data.chronic_conditions) ? data.chronic_conditions : [],
          });
        } else {
          setProfileExists(false);
          const meta = user.user_metadata || {};
          const initial: Profile = {
            full_name: meta.full_name || "",
            email: user.email || "",
            birth_date: meta.birth_date || "",
            gender: meta.gender || "",
            height: meta.height || 0,
            weight: meta.weight || 0,
            blood_type: meta.blood_type || "",
            allergens: [],
            chronic_conditions: [],
          };

          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,             // ← user_id → id
              email: user.email || "",
              full_name: initial.full_name,
              birth_date: initial.birth_date || null,
              gender: initial.gender,
              height: initial.height || null,
              weight: initial.weight || null,
              blood_type: initial.blood_type,
              allergens: [],
              chronic_conditions: [],
            });

          if (insertError) {
            console.error("Insert error:", JSON.stringify(insertError, null, 2));
          } else {
            setProfileExists(true);
          }
          setProfile(initial);
        }
      } catch (e) {
        console.error("loadProfile error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const saveProfile = async (updated: Profile) => {
    const userId = userIdRef.current;
    if (!userId) return;

    setSaving(true);
    try {
      const payload = {
        email: updated.email,
        full_name: updated.full_name,
        birth_date: updated.birth_date || null,
        gender: updated.gender,
        height: updated.height || null,
        weight: updated.weight || null,
        blood_type: updated.blood_type,
        allergens: updated.allergens,
        chronic_conditions: updated.chronic_conditions,
        updated_at: new Date().toISOString(),
      };

      if (profileExists) {
        // Satır var → UPDATE
        const { error } = await supabase
          .from("profiles")
          .update(payload)
          .eq("id", userId);         // ← user_id → id

        if (error) console.error("Update error:", JSON.stringify(error, null, 2));
      } else {
        // Satır yok → INSERT
        const { error } = await supabase
          .from("profiles")
          .insert({ id: userId, ...payload }); // ← user_id → id

        if (error) {
          console.error("Insert error:", JSON.stringify(error, null, 2));
        } else {
          setProfileExists(true);
        }
      }
    } catch (e) {
      console.error("saveProfile error:", e);
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof Profile, value: any) => {
    const updated = { ...profile, [key]: value };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { setPasswordMsg("Password must be at least 6 characters."); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setPasswordMsg(error.message); }
    else { setPasswordMsg("Password updated successfully!"); setNewPassword(""); }
  };

  const handleDeleteAccount = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const age = profile.birth_date
    ? Math.floor((Date.now() - new Date(profile.birth_date + "T00:00:00").getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  const bmi = profile.height && profile.weight
    ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
    : null;

  const bmiCategory = bmi
    ? parseFloat(bmi) < 18.5 ? { label: "Underweight", color: "#f59e0b" }
    : parseFloat(bmi) < 25 ? { label: "Normal", color: "#22c55e" }
    : parseFloat(bmi) < 30 ? { label: "Overweight", color: "#f97316" }
    : { label: "Obese", color: "#e11d48" }
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Profile</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage your personal and health information</p>
        </div>
        {saving && <p className="text-xs text-slate-400 animate-pulse">Saving...</p>}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {[
          { label: "Age",    value: age != null ? `${age} yrs` : "—", color: "#6366f1" },
          { label: "Height", value: profile.height ? `${profile.height} cm` : "—", color: "#0891b2" },
          { label: "Weight", value: profile.weight ? `${profile.weight} kg` : "—", color: "#f59e0b" },
          { label: "BMI",    value: bmi || "—", color: bmiCategory?.color || "#94a3b8", sub: bmiCategory?.label },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-4"
            style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-xs font-semibold text-slate-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            {stat.sub && <p className="text-xs font-semibold mt-0.5" style={{ color: stat.color }}>{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Sections */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "start" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div className="px-5 py-4 flex items-center gap-3"
            style={{ borderBottom: "1px solid rgba(203,213,225,0.4)", background: "rgba(99,102,241,0.08)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
              <User className="w-4 h-4" style={{ color: "#6366f1" }} />
            </div>
            <p className="font-bold text-slate-900 text-sm">Personal Information</p>
          </div>
          <div className="px-5">
            <EditableField label="Full Name" value={profile.full_name} onSave={v => update("full_name", v)} />
            <EditableField label="Email" value={profile.email} onSave={() => {}} readonly />
            <EditableField label="Date of Birth" value={profile.birth_date} onSave={v => update("birth_date", v)} type="date" />
            <EditableField label="Gender" value={profile.gender} onSave={v => update("gender", v)}
              options={["male", "female", "other", "prefer_not"]} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div className="px-5 py-4 flex items-center gap-3"
            style={{ borderBottom: "1px solid rgba(203,213,225,0.4)", background: "rgba(225,29,72,0.08)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
              <Heart className="w-4 h-4" style={{ color: "#e11d48" }} />
            </div>
            <p className="font-bold text-slate-900 text-sm">Health Information</p>
          </div>
          <div className="px-5">
            <EditableField label="Height (cm)" value={String(profile.height || "")} onSave={v => update("height", Number(v))} type="number" />
            <EditableField label="Weight (kg)" value={String(profile.weight || "")} onSave={v => update("weight", Number(v))} type="number" />
            <EditableField label="Blood Type" value={profile.blood_type} onSave={v => update("blood_type", v)} options={bloodTypes} />
            <TagField label="Allergens" tags={profile.allergens} options={commonAllergens}
              onUpdate={tags => update("allergens", tags)} />
            <TagField label="Chronic Conditions" tags={profile.chronic_conditions} options={commonConditions}
              onUpdate={tags => update("chronic_conditions", tags)} />
          </div>
        </motion.div>
      </div>

      {/* Account */}
      <div className="rounded-2xl p-5"
        style={{ background: "white", border: "1px solid rgba(225,29,72,0.2)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <p className="text-sm font-bold text-slate-900 mb-3">Account</p>
        <button onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center justify-between py-3.5 text-left transition-all hover:bg-slate-50 rounded-xl px-2"
          style={{ borderBottom: "1px solid rgba(203,213,225,0.3)" }}>
          <div>
            <p className="text-sm font-semibold text-slate-900">Change Password</p>
            <p className="text-xs text-slate-400 mt-0.5">Update your account password</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
        <button
          className="w-full flex items-center justify-between py-3.5 text-left transition-all hover:bg-slate-50 rounded-xl px-2"
          style={{ borderBottom: "1px solid rgba(203,213,225,0.3)" }}>
          <div>
            <p className="text-sm font-semibold text-slate-900">Export Health Data</p>
            <p className="text-xs text-slate-400 mt-0.5">Download all your health records as PDF</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
        <button onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center justify-between py-3.5 text-left transition-all hover:bg-slate-50 rounded-xl px-2">
          <div>
            <p className="text-sm font-semibold" style={{ color: "#e11d48" }}>Delete Account</p>
            <p className="text-xs text-slate-400 mt-0.5">Permanently delete your account and data</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
            onClick={() => { setShowPasswordModal(false); setPasswordMsg(""); setNewPassword(""); }}>
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ background: "white", boxShadow: "0 25px 80px rgba(0,0,0,0.2)" }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(99,102,241,0.08)" }}>
                    <KeyRound className="w-4 h-4" style={{ color: "#6366f1" }} />
                  </div>
                  <h3 className="font-bold text-slate-900">Change Password</h3>
                </div>
                <button onClick={() => { setShowPasswordModal(false); setPasswordMsg(""); setNewPassword(""); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-slate-600">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }} />
                {passwordMsg && (
                  <p className="text-xs" style={{ color: passwordMsg.includes("success") ? "#16a34a" : "#e11d48" }}>
                    {passwordMsg}
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setShowPasswordModal(false); setPasswordMsg(""); setNewPassword(""); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)" }}>
                  Cancel
                </button>
                <button onClick={handleChangePassword}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                  Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowDeleteModal(false)}>
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ background: "white", boxShadow: "0 25px 80px rgba(0,0,0,0.2)" }}
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(225,29,72,0.08)" }}>
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-center mb-1">Delete Account?</h3>
              <p className="text-sm text-slate-400 text-center mb-5">
                You will be signed out. Contact support to permanently delete your data.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)" }}>
                  Cancel
                </button>
                <button onClick={handleDeleteAccount}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}>
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}