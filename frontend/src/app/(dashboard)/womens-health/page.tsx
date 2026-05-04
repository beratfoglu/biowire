"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Baby, Plus, X,
  ChevronRight, AlertTriangle, CheckCircle2,
  BookOpen, Shield
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── TYPES ───────────────────────────────────────────────
type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

interface CycleEntry {
  id: string;
  start_date: string;
  end_date?: string;
  duration?: number;
  symptoms: string[];
  flow: "light" | "medium" | "heavy";
  notes?: string;
}

interface PregnancyWeek {
  week: number;
  baby: string;
  mother: string;
  size: string;
  tips: string[];
  warnings: string[];
}

// ─── DATA ─────────────────────────────────────────────────
const cycleSymptoms = [
  "Cramps", "Bloating", "Headache", "Mood swings", "Fatigue",
  "Breast tenderness", "Back pain", "Nausea", "Acne", "Insomnia",
  "Hot flashes", "Spotting", "Heavy flow", "Clotting"
];

const phaseConfig: Record<CyclePhase, { label: string; color: string; bg: string; desc: string; days: string }> = {
  menstrual:  { label: "Menstrual",  color: "#e11d48", bg: "rgba(225,29,72,0.08)",  desc: "Uterine lining sheds. Rest and self-care are key.",           days: "Days 1-5"  },
  follicular: { label: "Follicular", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", desc: "Estrogen rises, energy increases. Great for new projects.",    days: "Days 6-13" },
  ovulation:  { label: "Ovulation",  color: "#22c55e", bg: "rgba(34,197,94,0.08)",  desc: "Peak fertility window. Energy and confidence at their highest.", days: "Day 14"    },
  luteal:     { label: "Luteal",     color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", desc: "Progesterone rises. PMS symptoms may appear in later days.",    days: "Days 15-28"},
};

const pregnancyWeeks: PregnancyWeek[] = [
  {
    week: 4, size: "Poppy seed",
    baby: "The embryo implants in the uterine wall. The neural tube — which becomes the brain and spinal cord — begins forming.",
    mother: "You may notice a missed period. Fatigue and mild cramping are common. hCG hormone rises rapidly.",
    tips: ["Start prenatal vitamins with folic acid (400-800 mcg)", "Avoid alcohol and smoking immediately", "Schedule your first prenatal appointment"],
    warnings: ["Heavy bleeding or severe cramping — contact your doctor", "Signs of ectopic pregnancy: sharp one-sided pain"]
  },
  {
    week: 8, size: "Raspberry",
    baby: "All major organs are forming. Tiny fingers and toes are developing. The heart beats at 150-170 bpm.",
    mother: "Morning sickness peaks. Breasts are tender and may grow. Fatigue is intense — this is normal.",
    tips: ["Eat small, frequent meals to combat nausea", "Ginger tea can help with morning sickness", "Rest when you can — your body is working incredibly hard"],
    warnings: ["Severe vomiting preventing all fluid intake (hyperemesis gravidarum)", "Any vaginal bleeding"]
  },
  {
    week: 12, size: "Lime",
    baby: "Reflexes develop — fingers open and close. Kidneys produce urine. The fetus is fully formed.",
    mother: "Morning sickness often improves. Risk of miscarriage drops significantly. You may see a bump forming.",
    tips: ["First trimester screening ultrasound scheduled", "Start gentle prenatal exercise if cleared by doctor", "Inform your employer about your pregnancy"],
    warnings: ["Fever above 38°C", "Decreased fetal movement (later trimesters)"]
  },
  {
    week: 20, size: "Banana",
    baby: "You can feel movement (quickening). Baby can hear your voice. Hair is forming on the scalp.",
    mother: "Anatomy scan ultrasound at this point. Energy often returns. Lower back pain may begin.",
    tips: ["Anatomy scan to check all organs", "Start sleeping on your left side for better circulation", "Begin Kegel exercises for pelvic floor"],
    warnings: ["Sudden swelling of face, hands, feet", "Severe headaches or vision changes (preeclampsia signs)"]
  },
  {
    week: 28, size: "Eggplant",
    baby: "Baby opens and closes eyes. Brain grows rapidly. Survival rate outside womb is very high with medical support.",
    mother: "Third trimester begins. Braxton Hicks contractions may start. Heartburn and shortness of breath common.",
    tips: ["Glucose tolerance test for gestational diabetes", "Begin counting fetal kicks daily", "Prepare birth plan and hospital bag"],
    warnings: ["Less than 10 fetal movements in 2 hours", "Regular contractions before 37 weeks (preterm labor)"]
  },
  {
    week: 36, size: "Honeydew melon",
    baby: "Baby is nearly full-term. Lungs are maturing. Most babies turn head-down in preparation for birth.",
    mother: "Baby 'drops' lower into pelvis. Frequent urination returns. Nesting instinct may kick in.",
    tips: ["Group B strep test", "Finalize birth plan", "Install infant car seat", "Pack hospital bag"],
    warnings: ["Regular contractions 5 min apart lasting 60 seconds", "Water breaking", "Decreased fetal movement"]
  },
];

const conditionsData = [
  {
    name: "PCOS", icon: "🔬", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",
    prevalence: "1 in 10 women of reproductive age",
    overview: "Polycystic Ovary Syndrome is a hormonal disorder causing enlarged ovaries with small cysts. It's one of the most common causes of female infertility.",
    symptoms: ["Irregular or absent periods", "Excess androgen (facial hair, acne)", "Polycystic ovaries on ultrasound", "Weight gain", "Hair thinning", "Skin darkening"],
    treatment: ["Lifestyle changes (diet, exercise)", "Hormonal contraceptives", "Metformin", "Clomiphene (for fertility)", "Letrozole", "Anti-androgens"],
    when_to_seek: ["Periods absent >3 months", "Difficulty conceiving", "Severe acne or hair growth", "Sudden weight gain"]
  },
  {
    name: "Endometriosis", icon: "🩸", color: "#e11d48", bg: "rgba(225,29,72,0.08)",
    prevalence: "1 in 10 women worldwide",
    overview: "Endometriosis occurs when tissue similar to the uterine lining grows outside the uterus, causing chronic pain and potential fertility issues.",
    symptoms: ["Severe period cramps", "Chronic pelvic pain", "Pain during intercourse", "Heavy periods", "Painful bowel movements", "Infertility"],
    treatment: ["NSAIDs for pain", "Hormonal therapy", "GnRH agonists", "Laparoscopic surgery", "Hysterectomy (severe cases)"],
    when_to_seek: ["Period pain interfering with daily life", "Pelvic pain outside period", "Pain during sex", "Difficulty conceiving"]
  },
  {
    name: "Uterine Fibroids", icon: "🫀", color: "#f97316", bg: "rgba(249,115,22,0.08)",
    prevalence: "70-80% of women by age 50",
    overview: "Fibroids are non-cancerous growths in the uterus. Many women have no symptoms, while others experience heavy bleeding and pain.",
    symptoms: ["Heavy menstrual bleeding", "Prolonged periods", "Pelvic pressure or pain", "Frequent urination", "Constipation", "Backache"],
    treatment: ["Watchful waiting", "Hormonal medications", "Uterine fibroid embolization", "Myomectomy", "Hysterectomy"],
    when_to_seek: ["Soaking a pad/tampon every hour", "Periods lasting >7 days", "Pelvic pain unrelieved by OTC meds", "Difficulty emptying bladder"]
  },
  {
    name: "Ectopic Pregnancy", icon: "⚠️", color: "#dc2626", bg: "rgba(220,38,38,0.08)",
    prevalence: "1-2% of all pregnancies",
    overview: "An ectopic pregnancy occurs when a fertilized egg implants outside the uterus, usually in a fallopian tube. This is a medical emergency.",
    symptoms: ["Sharp one-sided pelvic pain", "Vaginal bleeding", "Shoulder tip pain", "Dizziness or fainting", "Nausea", "Missed period"],
    treatment: ["Methotrexate (early diagnosis)", "Laparoscopic surgery", "Emergency surgery if ruptured"],
    when_to_seek: ["ANY combination of missed period + pelvic pain + bleeding — EMERGENCY", "Shoulder tip pain", "Fainting or collapse"]
  },
];

// ─── HELPERS ──────────────────────────────────────────────
function getCurrentPhase(lastPeriodStart: string): { phase: CyclePhase; day: number } {
  const start = new Date(lastPeriodStart);
  const today = new Date();
  const dayOfCycle = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const normalizedDay = ((dayOfCycle - 1) % 28) + 1;
  if (normalizedDay <= 5) return { phase: "menstrual", day: normalizedDay };
  if (normalizedDay <= 13) return { phase: "follicular", day: normalizedDay };
  if (normalizedDay === 14) return { phase: "ovulation", day: normalizedDay };
  return { phase: "luteal", day: normalizedDay };
}

// ─── LOG CYCLE MODAL ──────────────────────────────────────
function LogCycleModal({ onClose, onSave }: { onClose: () => void; onSave: (e: CycleEntry) => void }) {
  const [form, setForm] = useState({ start_date: "", end_date: "", flow: "medium" as CycleEntry["flow"], notes: "" });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = async () => {
    if (!form.start_date) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const duration = form.end_date
        ? Math.floor((new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : undefined;

      const { data, error } = await supabase
        .from("cycle_logs")
        .insert({
          user_id: user.id,
          start_date: form.start_date,
          end_date: form.end_date || null,
          duration: duration || null,
          flow: form.flow,
          symptoms: selectedSymptoms,
          notes: form.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Cycle save error:", error);
        return;
      }

      if (data) onSave(data as CycleEntry);
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
          <h3 className="font-bold text-slate-900">Log Period</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {[{ label: "Start Date", key: "start_date" }, { label: "End Date", key: "end_date" }].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{f.label}</label>
                <input type="date" value={form[f.key as keyof typeof form] as string}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }} />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Flow Intensity</label>
            <div className="flex gap-2">
              {(["light", "medium", "heavy"] as const).map(f => (
                <button key={f} onClick={() => setForm(p => ({ ...p, flow: f }))}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                  style={{
                    background: form.flow === f ? "rgba(225,29,72,0.1)" : "#f8fafc",
                    color: form.flow === f ? "#e11d48" : "#64748b",
                    border: `1px solid ${form.flow === f ? "rgba(225,29,72,0.3)" : "rgba(203,213,225,0.6)"}`,
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Symptoms</label>
            <div className="flex flex-wrap gap-1.5">
              {cycleSymptoms.map(s => {
                const sel = selectedSymptoms.includes(s);
                return (
                  <button key={s} onClick={() => toggleSymptom(s)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: sel ? "rgba(225,29,72,0.08)" : "#f8fafc",
                      color: sel ? "#e11d48" : "#64748b",
                      border: `1px solid ${sel ? "rgba(225,29,72,0.3)" : "rgba(203,213,225,0.5)"}`,
                    }}>
                    {s}
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
              onClick={handleSave} disabled={!form.start_date || saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}>
              {saving ? "Saving..." : "Save"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── CONDITION DETAIL MODAL ───────────────────────────────
function ConditionModal({ condition, onClose }: { condition: typeof conditionsData[0]; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.94, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "white", boxShadow: "0 25px 80px rgba(0,0,0,0.2)", maxHeight: "88vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>

        <div className="p-6 relative" style={{ background: condition.bg }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/60">
            <X className="w-4 h-4 text-slate-500" />
          </button>
          <span className="text-4xl mb-3 block">{condition.icon}</span>
          <h2 className="text-xl font-black text-slate-900">{condition.name}</h2>
          <p className="text-xs text-slate-500 mt-1">{condition.prevalence}</p>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <p className="text-sm text-slate-700 leading-relaxed">{condition.overview}</p>
          {[
            { title: "Symptoms", items: condition.symptoms, bg: "rgba(249,115,22,0.05)", icon: <AlertTriangle className="w-4 h-4 text-orange-400" /> },
            { title: "Treatment Options", items: condition.treatment, bg: "rgba(99,102,241,0.05)", icon: <Shield className="w-4 h-4 text-indigo-400" /> },
            { title: "When to Seek Help", items: condition.when_to_seek, bg: "rgba(225,29,72,0.05)", icon: <AlertTriangle className="w-4 h-4 text-rose-500" /> },
          ].map((section, i) => (
            <div key={i}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{section.title}</p>
              <div className="flex flex-col gap-1.5">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2.5 p-2.5 rounded-xl" style={{ background: section.bg }}>
                    <div className="flex-shrink-0 mt-0.5">{section.icon}</div>
                    <p className="text-sm text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PREGNANCY WEEK CARD ──────────────────────────────────
function PregnancyWeekCard({ week, index }: { week: PregnancyWeek; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
          style={{ background: "rgba(236,72,153,0.08)" }}>
          <span className="text-xs font-bold text-pink-500">Week</span>
          <span className="text-lg font-black text-pink-500">{week.week}</span>
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-900 text-sm">Week {week.week}</p>
          <p className="text-xs text-slate-400">Baby size: {week.size}</p>
        </div>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </motion.div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 flex flex-col gap-4">
              <div style={{ borderTop: "1px solid rgba(203,213,225,0.4)", paddingTop: 16 }}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">👶 Baby Development</p>
                <p className="text-sm text-slate-600 leading-relaxed">{week.baby}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">🤱 What to Expect</p>
                <p className="text-sm text-slate-600 leading-relaxed">{week.mother}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">✅ Tips</p>
                <div className="flex flex-col gap-1.5">
                  {week.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl"
                      style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)" }}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
              {week.warnings.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">⚠️ Warning Signs</p>
                  <div className="flex flex-col gap-1.5">
                    {week.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl"
                        style={{ background: "rgba(225,29,72,0.05)", border: "1px solid rgba(225,29,72,0.1)" }}>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-700">{w}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────
export default function WomensHealthPage() {
  const [cycles, setCycles] = useState<CycleEntry[]>([]);
  const [cyclesLoading, setCyclesLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<typeof conditionsData[0] | null>(null);
  const [activeTab, setActiveTab] = useState<"cycle" | "pregnancy" | "conditions">("cycle");
  const [pregnancyWeek, setPregnancyWeek] = useState<number | null>(null);

  useEffect(() => {
    async function loadCycles() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("cycle_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("start_date", { ascending: false });
        if (data) setCycles(data as CycleEntry[]);
      } catch (e) {
        console.error(e);
      } finally {
        setCyclesLoading(false);
      }
    }
    loadCycles();
  }, []);

  const lastCycle = cycles[0];
  const { phase, day } = lastCycle
    ? getCurrentPhase(lastCycle.start_date)
    : { phase: "follicular" as CyclePhase, day: 0 };
  const phaseCfg = phaseConfig[phase];

  const avgCycleLength = cycles.length > 1
    ? Math.round(cycles.slice(0, -1).reduce((sum, c, i) => {
        const diff = (new Date(cycles[i].start_date).getTime() - new Date(cycles[i + 1].start_date).getTime()) / (1000 * 60 * 60 * 24);
        return sum + diff;
      }, 0) / (cycles.length - 1))
    : 28;

  const nextPeriod = lastCycle
    ? new Date(new Date(lastCycle.start_date).getTime() + avgCycleLength * 24 * 60 * 60 * 1000)
        .toLocaleDateString("en", { month: "short", day: "numeric" })
    : "—";

  const filteredWeeks = pregnancyWeek
    ? pregnancyWeeks.filter(w => w.week <= pregnancyWeek)
    : pregnancyWeeks;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Women's Health</h2>
          <p className="text-slate-500 text-sm mt-0.5">Cycle tracking, pregnancy guide, and women's health conditions</p>
        </div>
        {activeTab === "cycle" && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #e11d48, #be123c)", boxShadow: "0 4px 14px rgba(225,29,72,0.3)" }}>
            <Plus className="w-4 h-4" /> Log Period
          </motion.button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: "#f1f5f9", width: "fit-content" }}>
        {[
          { key: "cycle",      label: "Cycle Tracker",  icon: Calendar  },
          { key: "pregnancy",  label: "Pregnancy Guide", icon: Baby      },
          { key: "conditions", label: "Conditions",      icon: BookOpen  },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: active ? "white" : "transparent",
                color: active ? "#e11d48" : "#64748b",
                boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CYCLE TRACKER TAB */}
      {activeTab === "cycle" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">

          {/* Current phase */}
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${phaseCfg.bg}, rgba(255,255,255,0.5))`, border: `1px solid ${phaseCfg.color}30` }}>
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl pointer-events-none"
              style={{ background: phaseCfg.color, opacity: 0.12 }} />
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Current Phase</p>
              <h3 className="text-2xl font-black mb-1" style={{ color: phaseCfg.color }}>{phaseCfg.label}</h3>
              <p className="text-sm text-slate-500 mb-2">{phaseCfg.days}{day > 0 ? ` · Day ${day} of cycle` : ""}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{phaseCfg.desc}</p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {[
              { label: "Avg Cycle Length", value: `${avgCycleLength}d`, color: "#e11d48" },
              { label: "Next Period",      value: nextPeriod,            color: "#8b5cf6" },
              { label: "Total Logs",       value: cycles.length,         color: "#6366f1" },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-4"
                style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <p className="text-xs font-semibold text-slate-400 mb-1">{s.label}</p>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Phase guide */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(203,213,225,0.4)" }}>
              <p className="text-sm font-bold text-slate-900">Cycle Phase Guide</p>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(203,213,225,0.3)" }}>
              {(Object.entries(phaseConfig) as [CyclePhase, typeof phaseConfig[CyclePhase]][]).map(([key, cfg]) => (
                <div key={key} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-900">{cfg.label}</p>
                      <span className="text-xs text-slate-400">{cfg.days}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{cfg.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Period history */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(203,213,225,0.4)" }}>
              <p className="text-sm font-bold text-slate-900">Period History</p>
              <p className="text-xs text-slate-400">{cycles.length} entries</p>
            </div>
            {cyclesLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
              </div>
            ) : cycles.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-slate-400">No periods logged yet. Tap "Log Period" to start tracking.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(203,213,225,0.3)" }}>
                {cycles.map((cycle, i) => (
                  <motion.div key={cycle.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {new Date(cycle.start_date + "T00:00:00").toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                            style={{
                              background: cycle.flow === "heavy" ? "rgba(225,29,72,0.08)" : cycle.flow === "medium" ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)",
                              color: cycle.flow === "heavy" ? "#e11d48" : cycle.flow === "medium" ? "#f59e0b" : "#22c55e",
                            }}>
                            {cycle.flow} flow
                          </span>
                          {cycle.duration && <span className="text-xs text-slate-400">{cycle.duration} days</span>}
                        </div>
                        {cycle.symptoms && cycle.symptoms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {cycle.symptoms.map(s => (
                              <span key={s} className="text-xs px-1.5 py-0.5 rounded"
                                style={{ background: "#f1f5f9", color: "#64748b" }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {cycle.notes && <p className="text-xs text-slate-400 max-w-[160px] text-right">{cycle.notes}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* PREGNANCY GUIDE TAB */}
      {activeTab === "pregnancy" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
          <div className="rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.06), rgba(139,92,246,0.06))", border: "1px solid rgba(236,72,153,0.15)" }}>
            <p className="text-sm font-bold text-slate-900 mb-1">Pregnancy Week Guide</p>
            <p className="text-xs text-slate-500 mb-3">Select your current week to see relevant information, or browse all milestones.</p>
            <div className="flex items-center gap-3">
              <input type="number" min={1} max={42} placeholder="Current week (1-42)"
                value={pregnancyWeek || ""}
                onChange={e => setPregnancyWeek(e.target.value ? Number(e.target.value) : null)}
                className="rounded-xl px-3.5 py-2 text-sm outline-none w-48"
                style={{ background: "white", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }} />
              {pregnancyWeek && (
                <button onClick={() => setPregnancyWeek(null)} className="text-xs text-slate-400 hover:text-slate-600">
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {filteredWeeks.map((week, i) => <PregnancyWeekCard key={week.week} week={week} index={i} />)}
          </div>
          <div className="rounded-2xl p-5"
            style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-sm font-bold text-slate-900 mb-4">Always Remember</p>
            <div className="flex flex-col gap-2">
              {[
                "Attend all scheduled prenatal appointments",
                "Take folic acid throughout pregnancy (400-800 mcg/day)",
                "Avoid alcohol, smoking, and raw fish/undercooked meat",
                "Stay hydrated — aim for 8-10 glasses of water daily",
                "Trust your instincts — if something feels wrong, call your doctor",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)" }}>
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* CONDITIONS TAB */}
      {activeTab === "conditions" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
          <p className="text-sm text-slate-500">Common women's health conditions — symptoms, treatment, and when to seek help.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            {conditionsData.map((condition, i) => (
              <motion.div key={condition.name}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                whileHover={{ y: -2, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
                onClick={() => setSelectedCondition(condition)}
                className="rounded-2xl p-5 cursor-pointer relative overflow-hidden"
                style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl pointer-events-none"
                  style={{ background: condition.color, opacity: 0.1 }} />
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{condition.icon}</span>
                  {condition.name === "Ectopic Pregnancy" && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: "rgba(225,29,72,0.1)", color: "#e11d48" }}>⚠️ Emergency</span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{condition.name}</h3>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">{condition.overview}</p>
                <div className="flex items-center justify-between pt-3"
                  style={{ borderTop: "1px solid rgba(203,213,225,0.3)" }}>
                  <span className="text-xs text-slate-400">{condition.prevalence}</span>
                  <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: condition.color }}>
                    Learn more <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="rounded-2xl p-4"
            style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.12)" }}>
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-semibold text-indigo-500">⚕️ Medical disclaimer: </span>
              This information is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional.
            </p>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showLogModal && (
          <LogCycleModal
            onClose={() => setShowLogModal(false)}
            onSave={entry => setCycles(prev => [entry, ...prev])}
          />
        )}
        {selectedCondition && (
          <ConditionModal condition={selectedCondition} onClose={() => setSelectedCondition(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}