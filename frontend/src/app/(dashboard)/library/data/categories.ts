import {
  BookOpen, Heart, Brain, Wind, Shield,
  Droplets, Bone, Eye, Smile, Zap, Activity, Sun
} from "lucide-react";

export interface Category {
  id: string;
  label: string;
  icon: any;
  color: string;
  bg: string;
}

export const categories: Category[] = [
  { id: "all",            label: "All Conditions",  icon: BookOpen,  color: "#6366f1", bg: "rgba(99,102,241,0.08)"  },
  { id: "cardiology",     label: "Cardiology",      icon: Heart,     color: "#e11d48", bg: "rgba(225,29,72,0.08)"   },
  { id: "neurology",      label: "Neurology",       icon: Brain,     color: "#8b5cf6", bg: "rgba(139,92,246,0.08)"  },
  { id: "respiratory",    label: "Respiratory",     icon: Wind,      color: "#06b6d4", bg: "rgba(6,182,212,0.08)"   },
  { id: "immunity",       label: "Immunity",        icon: Shield,    color: "#0891b2", bg: "rgba(8,145,178,0.08)"   },
  { id: "endocrine",      label: "Endocrine",       icon: Droplets,  color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
  { id: "musculo",        label: "Musculoskeletal", icon: Bone,      color: "#64748b", bg: "rgba(100,116,139,0.08)" },
  { id: "ophthalmology",  label: "Ophthalmology",   icon: Eye,       color: "#10b981", bg: "rgba(16,185,129,0.08)"  },
  { id: "mental",         label: "Mental Health",   icon: Smile,     color: "#a855f7", bg: "rgba(168,85,247,0.08)"  },
  { id: "gastro",         label: "Gastroenterology",icon: Activity,  color: "#f97316", bg: "rgba(249,115,22,0.08)"  },
  { id: "dermatology",    label: "Dermatology",     icon: Sun,       color: "#ec4899", bg: "rgba(236,72,153,0.08)"  },
  { id: "oncology",       label: "Oncology",        icon: Zap,       color: "#dc2626", bg: "rgba(220,38,38,0.08)"   },
];

export const severityConfig = {
  low:      { label: "Low Risk",      color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  medium:   { label: "Moderate Risk", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  high:     { label: "High Risk",     color: "#f97316", bg: "rgba(249,115,22,0.1)"  },
  critical: { label: "Critical",      color: "#e11d48", bg: "rgba(225,29,72,0.1)"   },
};