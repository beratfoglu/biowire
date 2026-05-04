"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

const quickActions = [
  { label: "Start BioChat",  description: "Describe your symptoms",   href: "/biochat",     icon: "🩺", color: "var(--db-cyan)",  borderColor: "rgba(6,182,212,0.3)"   },
  { label: "Log Symptoms",   description: "Record how you feel today", href: "/symptoms",    icon: "📓", color: "var(--db-pink)",  borderColor: "rgba(236,72,153,0.3)"  },
  { label: "Add Medication", description: "Track your medications",    href: "/medications", icon: "💊", color: "var(--db-cyan)",  borderColor: "rgba(6,182,212,0.3)"   },
  { label: "Health Library", description: "Learn about conditions",    href: "/library",     icon: "📚", color: "var(--db-pink)",  borderColor: "rgba(236,72,153,0.3)"  },
];

interface DashStats {
  activeMeds: number;
  symptomLogs: number;
  latestMood: string | null;
  latestMoodTime: string | null;
  recentSymptoms: { symptoms: string[]; logged_at: string; severity: number }[];
  recentMeds: { name: string; dosage: string; created_at: string }[];
  userName: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashStats>({
    activeMeds: 0,
    symptomLogs: 0,
    latestMood: null,
    latestMoodTime: null,
    recentSymptoms: [],
    recentMeds: [],
    userName: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const userName = user.user_metadata?.full_name?.split(" ")[0] || "there";

        const [medsRes, symptomsRes, moodRes, profileRes] = await Promise.all([
          supabase.from("medications").select("name, dosage, created_at").eq("user_id", user.id).eq("active", true).order("created_at", { ascending: false }),
          supabase.from("symptom_logs").select("symptoms, logged_at, severity").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(5),
          supabase.from("mood_logs").select("mood, logged_at").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(1),
          supabase.from("profiles").select("full_name").eq("id", user.id).single(),
        ]);

        const resolvedName = profileRes.data?.full_name?.split(" ")[0] || userName;

        setStats({
          activeMeds: medsRes.data?.length || 0,
          symptomLogs: symptomsRes.data?.length || 0,
          latestMood: moodRes.data?.[0]?.mood || null,
          latestMoodTime: moodRes.data?.[0]?.logged_at || null,
          recentSymptoms: symptomsRes.data || [],
          recentMeds: medsRes.data?.slice(0, 3) || [],
          userName: resolvedName,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const moodEmoji: Record<string, string> = {
    great: "😄", good: "🙂", okay: "😐", bad: "😔", terrible: "😢"
  };
  const moodColor: Record<string, string> = {
    great: "#22c55e", good: "#84cc16", okay: "#f59e0b", bad: "#f97316", terrible: "#e11d48"
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const statCards = [
    {
      label: "Active Medications",
      value: loading ? "—" : String(stats.activeMeds),
      unit: "active",
      color: "var(--db-cyan)", bg: "var(--db-cyan-dim)", icon: "💊"
    },
    {
      label: "Recent Symptoms",
      value: loading ? "—" : String(stats.symptomLogs),
      unit: "logged",
      color: "var(--db-pink)", bg: "var(--db-pink-dim)", icon: "📓"
    },
    {
      label: "Latest Mood",
      value: loading ? "—" : stats.latestMood ? moodEmoji[stats.latestMood] : "—",
      unit: stats.latestMood || "not logged",
      color: stats.latestMood ? moodColor[stats.latestMood] : "var(--db-cyan)",
      bg: "var(--db-cyan-dim)", icon: "🧠"
    },
    {
      label: "Today",
      value: new Date().toLocaleDateString("en", { day: "numeric", month: "short" }),
      unit: new Date().toLocaleDateString("en", { weekday: "long" }),
      color: "var(--db-pink)", bg: "var(--db-pink-dim)", icon: "📅"
    },
  ];

  return (
    <div className="flex flex-col gap-8">

      {/* Welcome */}
      <FadeUp>
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", color: "var(--db-cyan-soft)", marginBottom: "4px" }}>
            {getGreeting()}, {loading ? "..." : stats.userName} 👋
          </h2>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--db-text-muted)", fontSize: "0.95rem" }}>
            Here's your health overview for today.
          </p>
        </div>
      </FadeUp>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {statCards.map((stat, i) => (
          <FadeUp key={i} delay={i * 0.1}>
            <div className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, var(--db-surface) 60%, ${stat.bg})`,
                border: `1px solid ${i % 2 === 0 ? "rgba(6,182,212,0.25)" : "rgba(236,72,153,0.25)"}`,
              }}>
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full"
                style={{ background: stat.bg, filter: "blur(8px)" }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontSize: "20px" }}>{stat.icon}</span>
                  <motion.div className="w-2 h-2 rounded-full" style={{ background: stat.color }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }} />
                </div>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                  <span style={{ fontSize: "0.9rem", color: "var(--db-text-muted)", fontFamily: "var(--font-body)", marginLeft: "4px" }}>
                    {stat.unit}
                  </span>
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--db-text-muted)", marginTop: "4px" }}>
                  {stat.label}
                </p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>

      {/* Quick actions */}
      <FadeUp delay={0.3}>
        <div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--db-text)", marginBottom: "16px" }}>
            Quick Actions
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            {quickActions.map((action, i) => (
              <motion.a key={i} href={action.href}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: "var(--db-surface-2)", border: `1px solid ${action.borderColor}`, textDecoration: "none" }}>
                <span style={{ fontSize: "22px" }}>{action.icon}</span>
                <div>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: action.color }}>{action.label}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--db-text-muted)", marginTop: "2px" }}>{action.description}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* Two column — recent symptoms + recent meds */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <FadeUp delay={0.4}>
          <div className="rounded-2xl p-6"
            style={{ background: "var(--db-surface)", border: "1px solid rgba(236,72,153,0.2)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--db-pink-soft)", marginBottom: "16px" }}>
              Recent Symptoms
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
              </div>
            ) : stats.recentSymptoms.length === 0 ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--db-text-dim)" }}>
                No symptoms logged yet.
              </p>
            ) : (
              stats.recentSymptoms.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 py-3"
                  style={{ borderBottom: i < stats.recentSymptoms.length - 1 ? "1px solid var(--db-border)" : "none" }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: entry.severity >= 7 ? "#e11d48" : "var(--db-pink)" }} />
                  <div className="flex-1">
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--db-text)" }}>
                      {entry.symptoms.slice(0, 2).join(", ")}
                      {entry.symptoms.length > 2 && ` +${entry.symptoms.length - 2}`}
                    </p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--db-text-dim)", marginTop: "2px" }}>
                      Severity {entry.severity}/10 · {timeAgo(entry.logged_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </FadeUp>

        <FadeUp delay={0.45}>
          <div className="rounded-2xl p-6"
            style={{ background: "var(--db-surface)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--db-cyan-soft)", marginBottom: "16px" }}>
              Active Medications
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              </div>
            ) : stats.recentMeds.length === 0 ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--db-text-dim)" }}>
                No medications added yet.
              </p>
            ) : (
              stats.recentMeds.map((med, i) => (
                <div key={i} className="flex items-start gap-3 py-3"
                  style={{ borderBottom: i < stats.recentMeds.length - 1 ? "1px solid var(--db-border)" : "none" }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--db-cyan)" }} />
                  <div className="flex-1">
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--db-text)" }}>
                      {med.name} — {med.dosage}
                    </p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--db-text-dim)", marginTop: "2px" }}>
                      Added {timeAgo(med.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </FadeUp>
      </div>

    </div>
  );
}