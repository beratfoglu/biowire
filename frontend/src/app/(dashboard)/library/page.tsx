"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, Bookmark, BookmarkCheck } from "lucide-react";
import { conditions } from "./data/conditions";
import type { Condition } from "./data/conditions";
import { categories } from "./data/categories";
import ConditionCard from "./components/ConditionCard";
import DetailModal from "./components/DetailModal";
import { supabase } from "@/lib/supabase";

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selected, setSelected] = useState<Condition | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "bookmarks">("all");

  // Load bookmarks from Supabase on mount
  useEffect(() => {
    async function loadBookmarks() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("library_bookmarks")
        .select("condition_id")
        .eq("user_id", user.id);
      if (data) {
        setBookmarks(new Set(data.map(b => b.condition_id)));
      }
    }
    loadBookmarks();
  }, []);

  const toggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isBookmarked = bookmarks.has(id);

    // Optimistic update
    setBookmarks(prev => {
      const next = new Set(prev);
      isBookmarked ? next.delete(id) : next.add(id);
      return next;
    });

    if (isBookmarked) {
      await supabase
        .from("library_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("condition_id", id);
    } else {
      await supabase
        .from("library_bookmarks")
        .insert({ user_id: user.id, condition_id: id });
    }
  };

  const filtered = useMemo(() => {
    return conditions.filter(c => {
      if (activeTab === "bookmarks" && !bookmarks.has(c.id)) return false;
      if (activeCategory !== "all" && c.category !== activeCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.overview.toLowerCase().includes(q) ||
          c.symptoms.some(s => s.toLowerCase().includes(q)) ||
          c.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, activeCategory, activeTab, bookmarks]);

  const stats = useMemo(() => ({
    total:    conditions.length,
    critical: conditions.filter(c => c.severity === "critical").length,
    high:     conditions.filter(c => c.severity === "high").length,
    cats:     categories.length - 1,
  }), []);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Health Library</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Comprehensive clinical guides on conditions, symptoms, and treatments
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: "#f1f5f9" }}>
            {[
              { key: "all",       label: "All" },
              { key: "bookmarks", label: `Saved · ${bookmarks.size}` },
            ].map(t => (
              <button key={t.key}
                onClick={() => setActiveTab(t.key as "all" | "bookmarks")}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: activeTab === t.key ? "white" : "transparent",
                  color: activeTab === t.key ? "#6366f1" : "#64748b",
                  boxShadow: activeTab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.15)" }}>
            <BookOpen className="w-3.5 h-3.5" />
            {conditions.length} conditions
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search conditions, symptoms, treatments..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
        />
        {search && (
          <button onClick={() => setSearch("")}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => {
          const Icon = cat.icon;
          const active = activeCategory === cat.id;
          const count = cat.id === "all"
            ? conditions.length
            : conditions.filter(c => c.category === cat.id).length;
          return (
            <motion.button key={cat.id}
              whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                background: active ? cat.color : "white",
                color: active ? "white" : "#64748b",
                border: `1px solid ${active ? cat.color : "rgba(203,213,225,0.6)"}`,
                boxShadow: active ? `0 4px 12px ${cat.bg}` : "0 1px 3px rgba(0,0,0,0.05)",
              }}>
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
              <span className="ml-0.5 opacity-70">· {count}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {[
          { label: "Total Conditions", value: stats.total,    color: "#6366f1" },
          { label: "Critical",         value: stats.critical, color: "#e11d48" },
          { label: "High Risk",        value: stats.high,     color: "#f97316" },
          { label: "Categories",       value: stats.cats,     color: "#0891b2" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4 text-center"
            style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Results count */}
      {(search || activeCategory !== "all") && (
        <p className="text-xs text-slate-400">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
          {search && <span> for "<span className="font-semibold text-slate-600">{search}</span>"</span>}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl"
          style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)" }}>
          <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">
            {activeTab === "bookmarks" ? "No saved conditions yet." : "No conditions found."}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {activeTab === "bookmarks" ? "Bookmark a condition to save it here." : "Try a different search term or category."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => (
              <div key={c.id} className="relative group">
                <ConditionCard
                  condition={c}
                  onClick={() => setSelected(c)}
                  index={i}
                />
                <button
                  onClick={e => toggleBookmark(c.id, e)}
                  className="absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  style={{
                    background: bookmarks.has(c.id) ? "#6366f1" : "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(203,213,225,0.4)",
                  }}>
                  {bookmarks.has(c.id)
                    ? <BookmarkCheck className="w-3.5 h-3.5 text-white" />
                    : <Bookmark className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <DetailModal
            condition={selected}
            onClose={() => setSelected(null)}
            allConditions={conditions}
            onNavigate={(c) => setSelected(c)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}