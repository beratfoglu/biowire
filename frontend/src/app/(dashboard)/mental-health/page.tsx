"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Activity, Plus, X,
  ChevronRight, Phone, Play, Smile
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Mood = "great" | "good" | "okay" | "bad" | "terrible";

interface MoodEntry {
  id: string;
  mood: Mood;
  notes?: string;
  logged_at: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: "breathing" | "meditation" | "grounding" | "journaling";
  icon: string;
  color: string;
  bg: string;
  steps: string[];
}

const moodConfig: Record<Mood, { label: string; color: string; bg: string; emoji: string; score: number }> = {
  great:    { label: "Great",    color: "#22c55e", bg: "rgba(34,197,94,0.1)",   emoji: "😄", score: 5 },
  good:     { label: "Good",     color: "#84cc16", bg: "rgba(132,204,22,0.1)",  emoji: "🙂", score: 4 },
  okay:     { label: "Okay",     color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  emoji: "😐", score: 3 },
  bad:      { label: "Bad",      color: "#f97316", bg: "rgba(249,115,22,0.1)",  emoji: "😔", score: 2 },
  terrible: { label: "Terrible", color: "#e11d48", bg: "rgba(225,29,72,0.1)",   emoji: "😢", score: 1 },
};

const exercises: Exercise[] = [
  {
    id: "1", title: "4-7-8 Breathing", duration: "5 min",
    category: "breathing", icon: "🌬️", color: "#06b6d4", bg: "rgba(6,182,212,0.08)",
    description: "A powerful breathing technique that activates your parasympathetic nervous system, reducing anxiety and promoting calm.",
    steps: [
      "Find a comfortable seated position and close your eyes",
      "Exhale completely through your mouth",
      "Inhale quietly through your nose for 4 counts",
      "Hold your breath for 7 counts",
      "Exhale completely through your mouth for 8 counts",
      "Repeat this cycle 4 times",
      "Notice the calm spreading through your body",
    ],
  },
  {
    id: "2", title: "Body Scan Meditation", duration: "10 min",
    category: "meditation", icon: "🧘", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",
    description: "A mindfulness practice that helps you reconnect with your body, release tension, and cultivate present-moment awareness.",
    steps: [
      "Lie down or sit comfortably and close your eyes",
      "Take three deep breaths to settle in",
      "Bring attention to the top of your head",
      "Slowly scan down: forehead, eyes, jaw — release any tension",
      "Continue to shoulders, arms, hands",
      "Move through chest, stomach, lower back",
      "Scan legs down to your feet",
      "Rest in full-body awareness for a moment",
    ],
  },
  {
    id: "3", title: "5-4-3-2-1 Grounding", duration: "3 min",
    category: "grounding", icon: "🌱", color: "#22c55e", bg: "rgba(34,197,94,0.08)",
    description: "A sensory grounding technique that anchors you to the present moment and reduces anxiety or dissociation.",
    steps: [
      "Take a slow deep breath",
      "Name 5 things you can SEE around you",
      "Name 4 things you can TOUCH — feel their texture",
      "Name 3 things you can HEAR right now",
      "Name 2 things you can SMELL",
      "Name 1 thing you can TASTE",
      "Take another deep breath — you are here, you are safe",
    ],
  },
  {
    id: "4", title: "Gratitude Journaling", duration: "7 min",
    category: "journaling", icon: "📓", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",
    description: "Research shows that writing three things you're grateful for daily can significantly improve mood and wellbeing over time.",
    steps: [
      "Find a quiet moment with pen and paper or your notes app",
      "Write today's date",
      "List 3 things you're genuinely grateful for — big or small",
      "For each one, write WHY you're grateful for it",
      "Write one person you appreciate and what you value about them",
      "End with one thing you're looking forward to",
      "Read it back — let the gratitude sink in",
    ],
  },
  {
    id: "5", title: "Box Breathing", duration: "4 min",
    category: "breathing", icon: "⬜", color: "#6366f1", bg: "rgba(99,102,241,0.08)",
    description: "Used by Navy SEALs and elite athletes, box breathing is a powerful stress management tool that improves focus and calm.",
    steps: [
      "Sit upright with your back straight",
      "Exhale all air from your lungs",
      "Inhale slowly for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly for 4 counts",
      "Hold empty for 4 counts",
      "Repeat 4-6 cycles — feel your nervous system calm",
    ],
  },
  {
    id: "6", title: "Self-Compassion Break", duration: "5 min",
    category: "meditation", icon: "💙", color: "#e11d48", bg: "rgba(225,29,72,0.08)",
    description: "Based on Dr. Kristin Neff's research, this practice helps you respond to your own suffering with kindness rather than criticism.",
    steps: [
      "Think of a situation causing you stress or pain right now",
      "Acknowledge: 'This is a moment of suffering'",
      "Remind yourself: 'Suffering is a part of life — I am not alone'",
      "Place your hand on your heart — feel its warmth",
      "Ask: 'What do I need to hear right now?'",
      "Offer yourself those words as you would to a dear friend",
      "Breathe and rest in self-compassion",
    ],
  },
];

const crisisResources = [
  { name: "International Crisis Line", number: "1-800-273-8255", available: "24/7", color: "#e11d48" },
  { name: "Crisis Text Line",          number: "Text HOME to 741741", available: "24/7", color: "#6366f1" },
  { name: "SAMHSA Helpline",           number: "1-800-662-4357", available: "24/7", color: "#0891b2" },
];

const categoryConfig = {
  breathing:  { label: "Breathing",  color: "#06b6d4", bg: "rgba(6,182,212,0.08)" },
  meditation: { label: "Meditation", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  grounding:  { label: "Grounding",  color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  journaling: { label: "Journaling", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
};

function ExerciseModal({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.94, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "white", boxShadow: "0 25px 80px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}>

        <div className="p-6 relative" style={{ background: exercise.bg }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/60">
            <X className="w-4 h-4 text-slate-500" />
          </button>
          <div className="text-4xl mb-3">{exercise.icon}</div>
          <h3 className="font-black text-slate-900 text-lg">{exercise.title}</h3>
          <p className="text-sm text-slate-500 mt-1">{exercise.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "white", color: exercise.color }}>{exercise.duration}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "white", color: exercise.color }}>{exercise.steps.length} steps</span>
          </div>
        </div>

        <div className="p-6">
          {!completed ? (
            <>
              <div className="flex items-center gap-2 mb-5">
                {exercise.steps.map((_, i) => (
                  <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                    style={{ background: i <= currentStep ? exercise.color : "rgba(203,213,225,0.4)" }} />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={currentStep}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Step {currentStep + 1} of {exercise.steps.length}
                  </p>
                  <p className="text-base text-slate-800 font-medium leading-relaxed">
                    {exercise.steps[currentStep]}
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="flex gap-3 mt-6">
                {currentStep > 0 && (
                  <button onClick={() => setCurrentStep(p => p - 1)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500"
                    style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)" }}>
                    Previous
                  </button>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => currentStep < exercise.steps.length - 1 ? setCurrentStep(p => p + 1) : setCompleted(true)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${exercise.color}, ${exercise.color}cc)` }}>
                  {currentStep < exercise.steps.length - 1 ? "Next Step" : "Complete ✓"}
                </motion.button>
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4">
              <div className="text-5xl mb-3">🎉</div>
              <h4 className="font-black text-slate-900 mb-2">Well done!</h4>
              <p className="text-sm text-slate-500 mb-5">
                You completed {exercise.title}. Taking care of your mental health is an act of strength.
              </p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                Done
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MentalHealthPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [moodsLoading, setMoodsLoading] = useState(true);
  const [showMoodLog, setShowMoodLog] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [savingMood, setSavingMood] = useState(false);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "exercises" | "crisis">("overview");

  useEffect(() => {
    async function loadMoods() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("mood_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false });
        if (data) setMoods(data as MoodEntry[]);
      } catch (e) {
        console.error(e);
      } finally {
        setMoodsLoading(false);
      }
    }
    loadMoods();
  }, []);

  const handleLogMood = async () => {
    if (!selectedMood) return;
    setSavingMood(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("mood_logs")
        .insert({
          user_id: user.id,
          mood: selectedMood,
          notes: moodNote || null,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) { console.error("Mood save error:", error); return; }
      if (data) setMoods(prev => [data as MoodEntry, ...prev]);

      setSelectedMood(null);
      setMoodNote("");
      setShowMoodLog(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingMood(false);
    }
  };

  const avgScore = moods.length > 0
    ? (moods.slice(0, 7).reduce((sum, m) => sum + moodConfig[m.mood].score, 0) / Math.min(moods.length, 7)).toFixed(1)
    : "—";

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mental Health</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track your mood and practice mindfulness exercises</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowMoodLog(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", boxShadow: "0 4px 14px rgba(139,92,246,0.3)" }}>
          <Smile className="w-4 h-4" /> Log Mood
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: "#f1f5f9", width: "fit-content" }}>
        {[
          { key: "overview",  label: "Overview",  icon: Activity },
          { key: "exercises", label: "Exercises", icon: Brain    },
          { key: "crisis",    label: "Support",   icon: Phone    },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: active ? "white" : "transparent",
                color: active ? "#6366f1" : "#64748b",
                boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {[
              { label: "7-Day Avg Mood", value: avgScore, sub: "out of 5", color: "#8b5cf6" },
              { label: "Total Logs",     value: moods.length, sub: "mood entries", color: "#6366f1" },
              { label: "Latest Mood",    value: moods[0] ? moodConfig[moods[0].mood].emoji : "—", sub: moods[0] ? moodConfig[moods[0].mood].label : "No data", color: moods[0] ? moodConfig[moods[0].mood].color : "#94a3b8" },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl p-5"
                style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <p className="text-xs font-semibold text-slate-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Mood timeline */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(203,213,225,0.4)" }}>
              <p className="text-sm font-bold text-slate-900">Mood History</p>
              <p className="text-xs text-slate-400">{moods.length} entries</p>
            </div>

            {/* Mini mood chart */}
            {moods.length > 0 && (
              <div className="px-5 py-4">
                <div className="flex items-end gap-2 h-16 mb-2">
                  {moods.slice(0, 14).reverse().map((entry, i) => {
                    const cfg = moodConfig[entry.mood];
                    const height = (cfg.score / 5) * 100;
                    return (
                      <motion.div key={entry.id}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.04 }}
                        className="flex-1 rounded-t-lg min-h-[8px]"
                        style={{ background: cfg.color, opacity: 0.7 }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {moodsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
              </div>
            ) : moods.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-slate-400">No moods logged yet. Tap "Log Mood" to start tracking.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(203,213,225,0.3)" }}>
                {moods.slice(0, 7).map((entry) => {
                  const cfg = moodConfig[entry.mood];
                  return (
                    <div key={entry.id} className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cfg.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
                          {entry.notes && <p className="text-xs text-slate-400">{entry.notes}</p>}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(entry.logged_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* EXERCISES TAB */}
      {activeTab === "exercises" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
          <p className="text-sm text-slate-500">Evidence-based exercises for stress, anxiety, and emotional regulation.</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(categoryConfig).map(([key, cfg]) => (
              <span key={key} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                {cfg.label}
              </span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            {exercises.map((ex, i) => {
              const catCfg = categoryConfig[ex.category];
              return (
                <motion.div key={ex.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
                  onClick={() => setActiveExercise(ex)}
                  className="rounded-2xl p-5 cursor-pointer relative overflow-hidden"
                  style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl pointer-events-none"
                    style={{ background: ex.color, opacity: 0.08 }} />
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{ex.icon}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: catCfg.bg, color: catCfg.color }}>{catCfg.label}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">{ex.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{ex.description}</p>
                  <div className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px solid rgba(203,213,225,0.3)" }}>
                    <span className="text-xs text-slate-400">{ex.duration} · {ex.steps.length} steps</span>
                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: ex.color }}>
                      <Play className="w-3 h-3" /> Start
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* CRISIS TAB */}
      {activeTab === "crisis" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
          <div className="rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08))", border: "1px solid rgba(139,92,246,0.2)" }}>
            <h3 className="font-bold text-slate-900 mb-2">You Are Not Alone</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              If you're experiencing a mental health crisis or having thoughts of self-harm, please reach out immediately. Help is available 24/7.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {crisisResources.map((resource, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${resource.color}15` }}>
                  <Phone className="w-5 h-5" style={{ color: resource.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">{resource.name}</p>
                  <p className="font-black text-base mt-0.5" style={{ color: resource.color }}>{resource.number}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Available {resource.available}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </motion.div>
            ))}
          </div>
          <div className="rounded-2xl p-5"
            style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-sm font-bold text-slate-900 mb-4">When You're Struggling</p>
            <div className="flex flex-col gap-3">
              {[
                { icon: "🌬️", tip: "Take slow, deep breaths — your nervous system will follow" },
                { icon: "🚶", tip: "Step outside for even 5 minutes — nature and movement help" },
                { icon: "📞", tip: "Call someone you trust — connection is medicine" },
                { icon: "💧", tip: "Drink a glass of water — small acts of care matter" },
                { icon: "✍️", tip: "Write down what you're feeling — naming emotions reduces their intensity" },
                { icon: "🛌", tip: "Rest without guilt — your body and mind need recovery time" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mood log modal */}
      <AnimatePresence>
        {showMoodLog && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowMoodLog(false)}>
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ background: "white", boxShadow: "0 25px 80px rgba(0,0,0,0.2)" }}
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900">How are you feeling?</h3>
                <button onClick={() => setShowMoodLog(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="flex justify-between mb-5">
                {(Object.keys(moodConfig) as Mood[]).map(mood => {
                  const cfg = moodConfig[mood];
                  const selected = selectedMood === mood;
                  return (
                    <motion.button key={mood}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMood(mood)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all"
                      style={{
                        background: selected ? cfg.bg : "transparent",
                        border: `2px solid ${selected ? cfg.color : "transparent"}`,
                      }}>
                      <span className="text-2xl">{cfg.emoji}</span>
                      <span className="text-xs font-semibold" style={{ color: selected ? cfg.color : "#94a3b8" }}>
                        {cfg.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Notes (optional)</label>
                <textarea value={moodNote} onChange={e => setMoodNote(e.target.value)}
                  placeholder="What's on your mind?" rows={3}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)", color: "#1e293b" }} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowMoodLog(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500"
                  style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.6)" }}>
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleLogMood}
                  disabled={!selectedMood || savingMood}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
                  {savingMood ? "Saving..." : "Log Mood"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise modal */}
      <AnimatePresence>
        {activeExercise && (
          <ExerciseModal exercise={activeExercise} onClose={() => setActiveExercise(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}