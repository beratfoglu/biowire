"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bookmark, BookmarkCheck, TrendingUp, Sparkles,
  Heart, Brain, Apple, Shield, Microscope, Wind,
  Clock, ExternalLink, ChevronRight, Flame, X
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  summary: string;
  url?: string;
  category: string;
  source: string;
  source_type: string;
  read_time: number;
  published_at: string;
  trending: boolean;
  tags: string[];
  image_gradient: string;
  icon: string;
  image_url?: string;
}

const categories = [
  { id: "all",           label: "All",         icon: Sparkles,   color: "#6366f1", bg: "rgba(99,102,241,0.1)"  },
  { id: "Health News",   label: "Health News", icon: Heart,      color: "#e11d48", bg: "rgba(225,29,72,0.1)"   },
  { id: "Research",      label: "Research",    icon: Microscope, color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  { id: "Public Health", label: "Public Health",icon: Shield,    color: "#0891b2", bg: "rgba(8,145,178,0.1)"   },
  { id: "Neurology",     label: "Neurology",   icon: Brain,      color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
  { id: "Nutrition",     label: "Nutrition",   icon: Apple,      color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  { id: "Respiratory",   label: "Respiratory", icon: Wind,       color: "#06b6d4", bg: "rgba(6,182,212,0.1)"   },
];

const sourceBadgeConfig: Record<string, { color: string; bg: string }> = {
  WHO:           { color: "#0891b2", bg: "rgba(8,145,178,0.1)"   },
  CDC:           { color: "#16a34a", bg: "rgba(22,163,74,0.1)"   },
  PubMed:        { color: "#7c3aed", bg: "rgba(124,58,237,0.1)"  },
  NIH:           { color: "#b45309", bg: "rgba(180,83,9,0.1)"    },
  Harvard:       { color: "#dc2626", bg: "rgba(220,38,38,0.1)"   },
  Mayo:          { color: "#0369a1", bg: "rgba(3,105,161,0.1)"   },
  ScienceAlert:  { color: "#7c3aed", bg: "rgba(124,58,237,0.1)"  },
  "Science Daily":{ color: "#0891b2", bg: "rgba(8,145,178,0.1)" },
  NewsAPI:       { color: "#6366f1", bg: "rgba(99,102,241,0.1)"  },
};

const categoryGradients: Record<string, { gradient: string; icon: string }> = {
  "Health News":   { gradient: "linear-gradient(135deg, #fda4af 0%, #fb7185 50%, #e11d48 100%)", icon: "🏥" },
  "Research":      { gradient: "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)", icon: "🔬" },
  "Public Health": { gradient: "linear-gradient(135deg, #67e8f9 0%, #22d3ee 50%, #0891b2 100%)", icon: "🌍" },
  "Neurology":     { gradient: "linear-gradient(135deg, #ddd6fe 0%, #a78bfa 50%, #8b5cf6 100%)", icon: "🧠" },
  "Nutrition":     { gradient: "linear-gradient(135deg, #bbf7d0 0%, #4ade80 50%, #22c55e 100%)", icon: "🥗" },
  "Respiratory":   { gradient: "linear-gradient(135deg, #a5f3fc 0%, #22d3ee 50%, #06b6d4 100%)", icon: "🌬️" },
  "default":       { gradient: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #6366f1 100%)", icon: "📰" },
};

function enrichArticle(raw: any, index: number): Article {
  const catStyle = categoryGradients[raw.category] || categoryGradients["default"];
  const src = raw.source || "NewsAPI";
  const sourceKey = Object.keys(sourceBadgeConfig).find(k =>
    src.toLowerCase().includes(k.toLowerCase())
  ) || src;

  return {
    id: `${index}-${raw.published_at || Date.now()}`,
    title: raw.title,
    summary: raw.summary || "",
    url: raw.url,
    category: raw.category || "Health News",
    source: src,
    source_type: sourceKey,
    read_time: Math.max(2, Math.floor((raw.summary?.length || 200) / 200) + 2),
    published_at: raw.published_at || new Date().toISOString(),
    trending: index < 4,
    tags: raw.category ? [raw.category.toLowerCase().replace(" ", "-")] : ["health"],
    image_gradient: raw.image_url ? "" : catStyle.gradient,
    icon: catStyle.icon,
    image_url: raw.image_url,
  };
}

function ArticleCard({
  article, bookmarked, onBookmark, onExpand, index
}: {
  article: Article;
  bookmarked: boolean;
  onBookmark: (id: string) => void;
  onExpand: (article: Article) => void;
  index: number;
}) {
  const cat = categories.find(c => c.id === article.category) || categories[0];
  const src = sourceBadgeConfig[article.source_type] || { color: "#6366f1", bg: "rgba(99,102,241,0.1)" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 24 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      onClick={() => onExpand(article)}>

      {/* Header */}
      <div className="relative h-36 flex items-end p-4"
        style={{
          background: article.image_url ? `url(${article.image_url}) center/cover` : article.image_gradient,
        }}>
        {article.image_url && <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />}
        {!article.image_url && <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.15)" }} />}

        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          {article.trending && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.9)", color: "#f97316" }}>
              <Flame className="w-3 h-3" /> Trending
            </span>
          )}
        </div>

        <button
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: bookmarked ? "rgba(99,102,241,0.9)" : "rgba(255,255,255,0.8)" }}
          onClick={e => { e.stopPropagation(); onBookmark(article.id); }}>
          {bookmarked
            ? <BookmarkCheck className="w-4 h-4 text-white" />
            : <Bookmark className="w-4 h-4 text-slate-600" />}
        </button>

        <span className="text-3xl relative z-10">{article.icon}</span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: cat.bg, color: cat.color }}>
            {article.category}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: src.bg, color: src.color }}>
            {article.source_type}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
            <Clock className="w-3 h-3" /> {article.read_time} min
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 line-clamp-2">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
            {article.summary}
          </p>
        )}

        <div className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid rgba(203,213,225,0.4)" }}>
          <p className="text-xs text-slate-400">
            {(() => {
              try {
                return new Date(article.published_at).toLocaleDateString("en", { month: "short", day: "numeric" });
              } catch { return ""; }
            })()}
          </p>
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#6366f1" }}>
            Read more <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function ReadModal({ article, onClose }: { article: Article; onClose: () => void }) {
  const cat = categories.find(c => c.id === article.category) || categories[0];
  const src = sourceBadgeConfig[article.source_type] || { color: "#6366f1", bg: "rgba(99,102,241,0.1)" };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl"
        style={{ background: "white", boxShadow: "0 25px 80px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}>

        <div className="relative h-48 flex items-end p-6"
          style={{
            background: article.image_url ? `url(${article.image_url}) center/cover` : article.image_gradient,
          }}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.3)" }} />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.9)" }}>
            <X className="w-4 h-4 text-slate-700" />
          </button>
          <div className="relative z-10">
            <span className="text-4xl mb-2 block">{article.icon}</span>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.9)", color: cat.color }}>
                {article.category}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: src.bg, color: src.color }}>
                {article.source_type}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(85vh - 192px)" }}>
          <div className="flex items-center gap-3 mb-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.read_time} min read</span>
            <span>·</span>
            <span>{article.source}</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 leading-snug mb-4">{article.title}</h2>

          {article.summary && (
            <p className="text-sm text-slate-600 leading-relaxed mb-4 pb-4"
              style={{ borderBottom: "1px solid rgba(203,213,225,0.4)" }}>
              {article.summary}
            </p>
          )}

          <p className="text-sm text-slate-500 leading-relaxed mb-6 italic">
            Read the full article at the original source.
          </p>

          {article.url && (
            <a href={article.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold"
              style={{ color: "#6366f1" }}>
              <ExternalLink className="w-3.5 h-3.5" /> View original source
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FeedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"feed" | "bookmarks">("feed");
  const [expandedArticle, setExpandedArticle] = useState<Article | null>(null);

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch("http://127.0.0.1:8000/feed/?limit=20");
        const data = await res.json();
        const enriched = (data.articles || []).map(enrichArticle);
        setArticles(enriched);
      } catch (e) {
        console.error("Feed fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = articles.filter(a => {
    if (activeTab === "bookmarks") return bookmarks.has(a.id);
    if (activeCategory !== "all" && a.category !== activeCategory) return false;
    if (search &&
      !a.title.toLowerCase().includes(search.toLowerCase()) &&
      !(a.summary || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const trending = articles.filter(a => a.trending).slice(0, 3);

  return (
    <div className="flex gap-6">

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Health Feed</h2>
            <p className="text-slate-500 text-sm mt-0.5">Curated health news from trusted global sources</p>
          </div>
          <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: "#f1f5f9" }}>
            {[{ key: "feed", label: "Feed" }, { key: "bookmarks", label: `Saved · ${bookmarks.size}` }].map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key as "feed" | "bookmarks")}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: activeTab === t.key ? "white" : "transparent",
                  color: activeTab === t.key ? "#6366f1" : "#64748b",
                  boxShadow: activeTab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
          style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search articles, topics, conditions..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch("")}><X className="w-4 h-4 text-slate-400" /></button>}
        </div>

        {activeTab === "feed" && (
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const active = activeCategory === cat.id;
              return (
                <motion.button key={cat.id} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
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
                </motion.button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">
              {activeTab === "bookmarks" ? "No saved articles yet." : "No articles found."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((article, i) => (
                <ArticleCard key={article.id} article={article}
                  bookmarked={bookmarks.has(article.id)}
                  onBookmark={toggleBookmark}
                  onExpand={setExpandedArticle}
                  index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="flex-shrink-0 flex flex-col gap-4" style={{ width: "280px" }}>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div className="px-4 py-3.5 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(203,213,225,0.4)", background: "rgba(249,115,22,0.05)" }}>
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-bold text-slate-900">Trending Now</p>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(203,213,225,0.3)" }}>
            {trending.length === 0 ? (
              <div className="px-4 py-4">
                <p className="text-xs text-slate-400">Loading trending articles...</p>
              </div>
            ) : trending.map((a) => (
              <motion.div key={a.id} whileHover={{ x: 2 }}
                className="px-4 py-3.5 cursor-pointer"
                onClick={() => setExpandedArticle(a)}>
                <div className="flex gap-3">
                  <span className="text-xl flex-shrink-0">{a.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">{a.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{a.read_time} min · {a.source_type}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.15)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: "#6366f1" }} />
            <p className="text-sm font-bold text-slate-900">For You</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Articles personalized based on your health profile — conditions, medications, and symptoms.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["Health News", "Research", "Public Health"].map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-4"
          style={{ background: "white", border: "1px solid rgba(203,213,225,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Trusted Sources</p>
          <div className="flex flex-col gap-2">
            {(["WHO", "CDC", "PubMed", "ScienceAlert", "NewsAPI"] as const).map(src => {
              const cfg = sourceBadgeConfig[src] || { color: "#6366f1", bg: "rgba(99,102,241,0.1)" };
              const count = articles.filter(a => a.source_type === src).length;
              return (
                <div key={src} className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    {src}
                  </span>
                  <span className="text-xs text-slate-400">{count} articles</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {expandedArticle && (
          <ReadModal article={expandedArticle} onClose={() => setExpandedArticle(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}