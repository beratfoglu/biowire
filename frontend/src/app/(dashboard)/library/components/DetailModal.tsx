"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Info, AlertTriangle, Microscope, Pill, Shield,
  Stethoscope, ExternalLink, BookOpen, CheckCircle2, Loader2
} from "lucide-react";
import { severityConfig } from "../data/categories";
import type { Condition } from "../data/conditions";
import { useWikipedia } from "../hooks/useWikipedia";

interface Props {
  condition: Condition;
  onClose: () => void;
  allConditions: Condition[];
  onNavigate: (condition: Condition) => void;
}

const sections = [
  { id: "overview",     label: "Overview",      icon: Info },
  { id: "symptoms",     label: "Symptoms",      icon: AlertTriangle },
  { id: "diagnosis",    label: "Diagnosis",     icon: Microscope },
  { id: "treatment",    label: "Treatment",     icon: Pill },
  { id: "prevention",   label: "Prevention",    icon: Shield },
  { id: "when_to_seek", label: "When to Seek",  icon: Stethoscope },
];

export default function DetailModal({ condition, onClose, allConditions, onNavigate }: Props) {
  const [activeSection, setActiveSection] = useState("overview");
  const sev = severityConfig[condition.severity];
  const wiki = useWikipedia(condition.wikipedia_slug);

  const relatedConditions = condition.related
    .map(id => allConditions.find(c => c.id === id))
    .filter(Boolean) as Condition[];

  const content: Record<string, string[]> = {
    symptoms:     condition.symptoms,
    diagnosis:    condition.diagnosis,
    treatment:    condition.treatment,
    prevention:   condition.prevention,
    when_to_seek: condition.when_to_seek,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(10px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.94, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
        style={{ background: "white", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="relative p-6 flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${condition.bg}, rgba(255,255,255,0))` }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/60 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              {condition.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-xl font-black text-slate-900">{condition.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                  style={{ background: sev.bg, color: sev.color }}>
                  {sev.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold flex-shrink-0"
                  style={{ background: "rgba(203,213,225,0.4)", color: "#64748b" }}>
                  {condition.icd10}
                </span>
              </div>
              <p className="text-xs text-slate-400">{condition.prevalence}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {condition.risk_factors.slice(0, 5).map(rf => (
              <span key={rf} className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: "rgba(203,213,225,0.4)", color: "#64748b" }}>
                {rf}
              </span>
            ))}
            {condition.risk_factors.length > 5 && (
              <span className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: "rgba(203,213,225,0.4)", color: "#64748b" }}>
                +{condition.risk_factors.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto flex-shrink-0 px-2"
          style={{ borderBottom: "1px solid rgba(203,213,225,0.4)" }}>
          {sections.map(s => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className="flex items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  color: active ? condition.color : "#94a3b8",
                  borderBottom: active ? `2px solid ${condition.color}` : "2px solid transparent",
                }}>
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}>

              {activeSection === "overview" && (
                <div className="flex flex-col gap-5">
                  <div className="rounded-xl p-4" style={{ background: "#f8fafc", border: "1px solid rgba(203,213,225,0.4)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-3.5 h-3.5" style={{ color: condition.color }} />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wikipedia Summary</span>
                      {wiki.loading && <Loader2 className="w-3 h-3 text-slate-400 animate-spin ml-auto" />}
                    </div>
                    {wiki.loading ? (
                      <div className="flex flex-col gap-2">
                        {[100, 90, 80].map((w, i) => (
                          <div key={i} className="h-3 rounded animate-pulse"
                            style={{ background: "rgba(203,213,225,0.5)", width: `${w}%` }} />
                        ))}
                      </div>
                    ) : wiki.error || !wiki.extract ? (
                      <p className="text-sm text-slate-600 leading-relaxed">{condition.overview}</p>
                    ) : (
                      <p className="text-sm text-slate-700 leading-relaxed">{wiki.extract}</p>
                    )}
                    {!wiki.loading && !wiki.error && wiki.url && (
                      <a href={wiki.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold mt-3"
                        style={{ color: condition.color }}>
                        <ExternalLink className="w-3 h-3" /> Read full article on Wikipedia
                      </a>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Causes</p>
                    <ul className="flex flex-col gap-2">
                      {condition.causes.map((c, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                            style={{ background: condition.color }} />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {relatedConditions.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Related Conditions</p>
                      <div className="flex flex-wrap gap-2">
                        {relatedConditions.map(rc => (
                          <button key={rc.id}
                            onClick={() => onNavigate(rc)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                            style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.color}25` }}>
                            <span>{rc.icon}</span>
                            {rc.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "symptoms" && (
                <div className="flex flex-col gap-2">
                  {condition.symptoms.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl"
                      style={{ background: condition.bg, border: `1px solid ${condition.color}20` }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                        style={{ background: condition.color, color: "white" }}>
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === "when_to_seek" && (
                <div className="flex flex-col gap-3">
                  <div className="p-4 rounded-xl mb-2"
                    style={{ background: "rgba(225,29,72,0.05)", border: "1px solid rgba(225,29,72,0.15)" }}>
                    <p className="text-xs font-bold text-rose-600 mb-1">⚠️ Emergency Warning Signs</p>
                    <p className="text-xs text-slate-500">Seek immediate medical attention if you experience any of the following:</p>
                  </div>
                  {condition.when_to_seek.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl"
                      style={{ background: "rgba(225,29,72,0.04)", border: "1px solid rgba(225,29,72,0.12)" }}>
                      <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === "prevention" && (
                <div className="flex flex-col gap-2">
                  {condition.prevention.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl"
                      style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)" }}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              )}

              {(activeSection === "diagnosis" || activeSection === "treatment") && (
                <ul className="flex flex-col gap-1">
                  {content[activeSection].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 py-3"
                      style={{ borderBottom: "1px solid rgba(203,213,225,0.3)" }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                        style={{ background: condition.bg, color: condition.color }}>
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-700">{item}</p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}