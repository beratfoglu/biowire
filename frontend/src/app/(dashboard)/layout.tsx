"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/biochat", label: "BioChat", icon: "🩺" },
  { href: "/feed", label: "Health Feed", icon: "📰" },
  { href: "/library", label: "Health Library", icon: "📚" },
  { href: "/symptoms", label: "Symptom Log", icon: "📓" },
  { href: "/medications", label: "Medications", icon: "💊" },
  { href: "/vitals", label: "Vitals", icon: "❤️" },
  { href: "/records", label: "Medical Records", icon: "📋" },
  { href: "/mental-health", label: "Mental Health", icon: "🧠" },
  { href: "/womens-health", label: "Women's Health", icon: "🌸" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex" style={{ background: "var(--db-bg)" }}>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 h-full z-40 flex flex-col overflow-hidden"
        style={{ background: "var(--db-surface)", borderRight: "1px solid var(--db-border)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: "1px solid var(--db-border)" }}>
          {!collapsed && (
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", color: "var(--db-cyan)" }}>
              bio<span style={{ color: "var(--db-pink)" }}>wire</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg flex items-center justify-center ml-auto"
            style={{ background: "var(--db-cyan-dim)", color: "var(--db-cyan)", fontSize: "14px" }}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1"
                  style={{
                    background: isActive ? "var(--db-cyan-dim)" : "transparent",
                    border: isActive ? "1px solid var(--db-border-hover)" : "1px solid transparent",
                  }}
                >
                  <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && (
                    <span style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.88rem",
                      color: isActive ? "var(--db-cyan)" : "var(--db-text-muted)",
                      fontWeight: isActive ? 500 : 400,
                      whiteSpace: "nowrap"
                    }}>
                      {item.label}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4" style={{ borderTop: "1px solid var(--db-border)" }}>
          <Link href="/">
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
            >
              <span style={{ fontSize: "16px" }}>🚪</span>
              {!collapsed && (
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "var(--db-text-dim)" }}>
                  Sign Out
                </span>
              )}
            </motion.div>
          </Link>
        </div>
      </motion.aside>

      {/* Main content */}
      <main
        className="flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 260, background: "var(--db-bg)" }}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
          style={{
            background: "rgba(10,22,40,0.88)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid var(--db-border)"
          }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--db-text)" }}>
            {navItems.find(i => i.href === pathname)?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--db-cyan), var(--db-pink))", color: "white", fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600 }}>
              B
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}