"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { severityConfig } from "../data/categories";
import type { Condition } from "../data/conditions";

interface Props {
  condition: Condition;
  onClick: () => void;
  index: number;
}

export default function ConditionCard({ condition, onClick, index }: Props) {
  const sev = severityConfig[condition.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 200, damping: 24 }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
      onClick={onClick}
      className="rounded-2xl p-5 cursor-pointer relative overflow-hidden"
      style={{
        background: "white",
        border: "1px solid rgba(203,213,225,0.5)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>

      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
        style={{ background: condition.color, opacity: 0.08 }} />

      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: condition.bg }}>
          {condition.icon}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: sev.bg, color: sev.color }}>
            {sev.label}
          </span>
          <span className="text-xs text-slate-400">{condition.icd10}</span>
        </div>
      </div>

      <h3 className="font-bold text-slate-900 mb-1 text-sm">{condition.name}</h3>
      <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
        {condition.overview}
      </p>

      {condition.related.length > 0 && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {condition.symptoms.slice(0, 2).map(s => (
            <span key={s} className="px-1.5 py-0.5 rounded text-xs"
              style={{ background: "#f1f5f9", color: "#64748b" }}>
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid rgba(203,213,225,0.3)" }}>
        <span className="text-xs text-slate-400 truncate max-w-[60%]">{condition.prevalence}</span>
        <span className="flex items-center gap-1 text-xs font-semibold flex-shrink-0"
          style={{ color: condition.color }}>
          Learn more <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
}