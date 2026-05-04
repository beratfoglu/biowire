"use client";

import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const mockNews = [
  {
    id: 1,
    category: "Global Health",
    title: "WHO detects new variant in ongoing global flu outbreak",
    summary: "The World Health Organization has reported a new influenza variant spreading across Southeast Asia.",
    time: "2 hours ago",
    color: "var(--bw-primary)",
  },
  {
    id: 2,
    category: "Research",
    title: "Groundbreaking immunotherapy method opens new doors in cancer treatment",
    summary: "Harvard Medical School researchers have developed a new method targeting tumor cells with precision.",
    time: "5 hours ago",
    color: "var(--bw-teal)",
  },
  {
    id: 3,
    category: "Public Health",
    title: "Diabetes cases in Turkey reach 5-year peak",
    summary: "Ministry of Health data shows a 23% increase in type-2 diabetes diagnoses nationwide.",
    time: "1 day ago",
    color: "var(--bw-primary-dark)",
  },
  {
    id: 4,
    category: "Nutrition",
    title: "Mediterranean diet's impact on heart health confirmed",
    summary: "A 15-year comprehensive study shows the Mediterranean diet reduces cardiovascular risk by 30%.",
    time: "2 days ago",
    color: "var(--bw-teal)",
  },
  {
    id: 5,
    category: "Technology",
    title: "AI makes early Alzheimer's detection possible years in advance",
    summary: "A model developed at MIT can detect Alzheimer's up to 6 years before symptoms appear.",
    time: "3 days ago",
    color: "var(--bw-primary)",
  },
  {
    id: 6,
    category: "Mental Health",
    title: "Post-pandemic anxiety rates remain elevated globally",
    summary: "New research shows anxiety disorders have increased by 45% since 2020 across 40 countries.",
    time: "4 days ago",
    color: "var(--bw-primary-dark)",
  },
];

// Reusable fade-up on scroll
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Floating bubbles — GPU accelerated
function Bubbles({ count = 6, dark = false }: { count?: number; dark?: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${18 + i * 16}px`,
            height: `${18 + i * 16}px`,
            background: dark ? "rgba(29,158,117,0.07)" : "rgba(159,225,203,0.3)",
            left: `${5 + i * 16}%`,
            top: `${12 + (i % 4) * 20}%`,
            border: `1px solid ${dark ? "rgba(29,158,117,0.12)" : "rgba(93,202,165,0.25)"}`,
            willChange: "transform",
          }}
          animate={{ y: [0, -16, 0] }}
          transition={{
            duration: 5 + i * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.6,
          }}
        />
      ))}
    </div>
  );
}

// EKG line — draws once on mount
function EKGLine() {
  const pathRef = useRef<SVGPolylineElement>(null);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const length = el.getTotalLength();
    el.style.strokeDasharray = `${length}`;
    el.style.strokeDashoffset = `${length}`;
    const anim = el.animate(
      [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
      {
        duration: 2000,
        easing: "cubic-bezier(0.4,0,0.2,1)",
        fill: "forwards",
        iterations: Infinity,
        delay: 0,
      }
    );
    // FIX: cleanup animation on unmount so back-nav doesn't leave ghost animations
    return () => anim.cancel();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.2 }}
    >
      <svg width="300" height="70" viewBox="0 0 300 70" style={{ overflow: "visible" }}>
        <polyline
          ref={pathRef}
          points="0,35 55,35 75,35 85,8 96,62 103,18 110,35 130,35 300,35"
          fill="none"
          stroke="#1D9E75"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.circle
          cx="85"
          cy="8"
          r="4"
          fill="#5DCAA5"
          animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "85px 8px" }}
        />
      </svg>
    </motion.div>
  );
}

// Single news item
function NewsItem({ news, i, dark }: { news: typeof mockNews[0]; i: number; dark: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ backgroundColor: dark ? "rgba(29,158,117,0.05)" : "rgba(209,238,229,0.5)" }}
      className="flex gap-5 py-6 rounded-xl"
      style={{
        borderBottom: `1px solid ${dark ? "rgba(29,158,117,0.18)" : "rgba(159,225,203,0.55)"}`,
        cursor: "default",
        willChange: "transform",
      }}
    >
      <div className="flex flex-col items-center gap-2 pt-1" style={{ minWidth: "65px" }}>
        <motion.div
          className="rounded-full flex-shrink-0"
          style={{ width: "10px", height: "10px", background: news.color }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        />
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.7rem",
            color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {news.time}
        </p>
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: news.color,
          }}
        >
          {news.category}
        </span>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.05rem",
            color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
            lineHeight: 1.45,
          }}
        >
          {news.title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.88rem",
            color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
            lineHeight: 1.7,
          }}
        >
          {news.summary}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Weather data type ───────────────────────────────────────────────────────
type WeatherData = {
  temp: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  uv: number;
  aqi: number;
  pollen: string;
  city: string;
};

const WEATHER_CACHE_KEY = "bw_env_data";
const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes in ms

function EnvBento({ dark }: { dark: boolean }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // ── FIX 1: sessionStorage cache — skip API on back-nav ──────────────
      try {
        const raw = sessionStorage.getItem(WEATHER_CACHE_KEY);
        if (raw) {
          const { data, ts } = JSON.parse(raw) as { data: WeatherData; ts: number };
          if (Date.now() - ts < WEATHER_CACHE_TTL) {
            setWeather(data);
            setLoading(false);
            return;
          }
        }
      } catch {
        // sessionStorage unavailable or corrupted — proceed to fetch
      }

      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => {
          const timeout = setTimeout(() => rej(new Error("timeout")), 3000);
          navigator.geolocation.getCurrentPosition(
            (p) => { clearTimeout(timeout); res(p); },
            (e) => { clearTimeout(timeout); rej(e); },
            { timeout: 3000, maximumAge: 60000 }
          );
        });
        const { latitude, longitude } = pos.coords;

        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const geoData = await geoRes.json();
        const city =
          geoData.address.city ||
          geoData.address.town ||
          geoData.address.village ||
          "Your City";

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,uv_index,weather_code&timezone=auto`
        );
        const weatherData = await weatherRes.json();
        const current = weatherData.current;

        const aqiRes = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,birch_pollen,grass_pollen,mugwort_pollen`
        );
        const aqiData = await aqiRes.json();
        const aqiCurrent = aqiData.current;

        const maxPollen = Math.max(
          aqiCurrent.birch_pollen ?? 0,
          aqiCurrent.grass_pollen ?? 0,
          aqiCurrent.mugwort_pollen ?? 0
        );
        const pollenLevel =
          maxPollen < 10 ? "Low" :
          maxPollen < 50 ? "Moderate" :
          maxPollen < 200 ? "High" : "Very High";

        const code = current.weather_code;
        const condition =
          code === 0 ? "Clear Sky" :
          code <= 3 ? "Partly Cloudy" :
          code <= 48 ? "Foggy" :
          code <= 67 ? "Rainy" :
          code <= 77 ? "Snowy" :
          code <= 82 ? "Showers" : "Thunderstorm";

        const result: WeatherData = {
          temp: Math.round(current.temperature_2m),
          feelsLike: Math.round(current.apparent_temperature),
          humidity: current.relative_humidity_2m,
          condition,
          windSpeed: Math.round(current.wind_speed_10m),
          uv: Math.round(current.uv_index),
          aqi: Math.round(aqiCurrent.european_aqi),
          pollen: pollenLevel,
          city,
        };

        setWeather(result);
        // ── FIX 1b: write to cache with timestamp ──────────────────────────
        try {
          sessionStorage.setItem(
            WEATHER_CACHE_KEY,
            JSON.stringify({ data: result, ts: Date.now() })
          );
        } catch { /* storage full or unavailable */ }

      } catch {
        const fallback: WeatherData = {
          temp: 22,
          feelsLike: 20,
          humidity: 55,
          condition: "Partly Cloudy",
          windSpeed: 14,
          uv: 5,
          aqi: 42,
          pollen: "Moderate",
          city: "Your City",
        };
        setWeather(fallback);
        try {
          sessionStorage.setItem(
            WEATHER_CACHE_KEY,
            JSON.stringify({ data: fallback, ts: Date.now() })
          );
        } catch { /* ignore */ }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const aqiLabel = (aqi: number) =>
    aqi <= 20 ? "Good" : aqi <= 40 ? "Fair" : aqi <= 60 ? "Moderate" : aqi <= 80 ? "Poor" : "Very Poor";

  const aqiColor = (aqi: number) =>
    aqi <= 20 ? "var(--bw-primary)" : aqi <= 40 ? "var(--bw-teal)" : aqi <= 60 ? "#EF9F27" : "#E24B4A";

  const uvLabel = (uv: number) =>
    uv <= 2 ? "Low" : uv <= 5 ? "Moderate" : uv <= 7 ? "High" : uv <= 10 ? "Very High" : "Extreme";

  const uvColor = (uv: number) =>
    uv <= 2 ? "var(--bw-primary)" : uv <= 5 ? "var(--bw-teal)" : uv <= 7 ? "#EF9F27" : "#E24B4A";

  const pollenColor = (p: string) =>
    p === "Low" ? "var(--bw-primary)" : p === "Moderate" ? "var(--bw-teal)" : p === "High" ? "#EF9F27" : "#E24B4A";

  const healthTip = (w: WeatherData | null) => {
    if (!w) return "";
    if (w.aqi > 60) return "Air quality is poor today. Consider staying indoors or wearing a mask.";
    if (w.uv > 7) return "UV index is very high. Apply SPF 50+ sunscreen and limit sun exposure.";
    if (w.pollen === "High" || w.pollen === "Very High") return "Pollen levels are elevated. Allergy sufferers should take precautions.";
    if (w.humidity > 80) return "High humidity today. Stay hydrated and avoid intense outdoor exercise.";
    return "Environmental conditions look good today. A great day to go outside!";
  };

  const cardBase = {
    background: dark ? "rgba(29,158,117,0.07)" : "white",
    border: `1px solid ${dark ? "rgba(29,158,117,0.18)" : "var(--bw-teal-soft)"}`,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          className="w-8 h-8 rounded-full"
          style={{ border: "2px solid var(--bw-primary)", borderTopColor: "transparent" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 1fr",
        gridTemplateRows: "auto auto auto",
        gap: "1.25rem",
      }}
    >
      {/* Date & Day card */}
      <FadeUp delay={0.02}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{ ...cardBase, gridRow: "span 2", minHeight: "380px", cursor: "default" }}
        >
          <motion.div
            className="absolute -right-16 -bottom-16 rounded-full pointer-events-none"
            style={{ width: "220px", height: "220px", background: "var(--bw-primary)", opacity: 0.05 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--bw-primary)" }} />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                  }}
                >
                  {weather.city}
                </span>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1rem",
                    color: "var(--bw-primary)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}
                >
                  {new Date().toLocaleDateString("en-US", { weekday: "long" })}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "3.5rem",
                    color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                    lineHeight: 1,
                  }}
                >
                  {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                    marginTop: "6px",
                  }}
                >
                  {new Date().getFullYear()}
                </p>
              </motion.div>
              <div className="flex gap-6 mt-8">
                {[
                  { label: "Sunrise", value: "06:24" },
                  { label: "Sunset", value: "19:51" },
                ].map((s, i) => (
                  <div key={i}>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.72rem",
                        color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "1.1rem",
                        color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                      }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="mt-6 rounded-2xl px-4 py-3"
              style={{
                background: dark ? "rgba(29,158,117,0.1)" : "var(--bw-teal-lightest)",
                border: `1px solid ${dark ? "rgba(29,158,117,0.2)" : "var(--bw-teal-soft)"}`,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {healthTip(weather)}
              </p>
            </div>
          </div>
        </motion.div>
      </FadeUp>

      {/* Weather card */}
      <FadeUp delay={0.05}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{ ...cardBase, cursor: "default" }}
        >
          <motion.div
            className="absolute -right-8 -top-8 rounded-full pointer-events-none"
            style={{ width: "100px", height: "100px", background: "var(--bw-primary)", opacity: 0.05 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10">
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.75rem",
                color: "var(--bw-primary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Weather
            </p>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "3.5rem",
                color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                lineHeight: 1,
              }}
            >
              {weather.temp}°
            </motion.span>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1rem",
                color: "var(--bw-primary)",
                marginTop: "4px",
              }}
            >
              {weather.condition}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                marginTop: "2px",
              }}
            >
              Feels like {weather.feelsLike}° · {weather.humidity}% humidity
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                marginTop: "2px",
              }}
            >
              Wind {weather.windSpeed} km/h
            </p>
          </div>
        </motion.div>
      </FadeUp>

      {/* AQI card */}
      <FadeUp delay={0.08}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="rounded-3xl p-6"
          style={{ ...cardBase, cursor: "default" }}
        >
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.75rem",
              color: "var(--bw-primary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Air Quality
          </p>
          <div className="flex items-end gap-2 mb-4">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "3rem",
                color: aqiColor(weather.aqi),
                lineHeight: 1,
              }}
            >
              {weather.aqi}
            </motion.span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.82rem",
                color: aqiColor(weather.aqi),
                marginBottom: "6px",
              }}
            >
              {aqiLabel(weather.aqi)}
            </span>
          </div>
          <div
            className="rounded-full overflow-hidden"
            style={{ height: "5px", background: dark ? "rgba(29,158,117,0.1)" : "var(--bw-teal-lightest)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: aqiColor(weather.aqi) }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((weather.aqi / 100) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </FadeUp>

      {/* UV card */}
      <FadeUp delay={0.1}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="rounded-3xl p-6"
          style={{ ...cardBase, cursor: "default" }}
        >
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.75rem",
              color: "var(--bw-primary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            UV Index
          </p>
          <div className="flex items-end gap-2 mb-4">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "3rem",
                color: uvColor(weather.uv),
                lineHeight: 1,
              }}
            >
              {weather.uv}
            </motion.span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.82rem",
                color: uvColor(weather.uv),
                marginBottom: "6px",
              }}
            >
              {uvLabel(weather.uv)}
            </span>
          </div>
          <div
            className="rounded-full overflow-hidden"
            style={{ height: "5px", background: dark ? "rgba(29,158,117,0.1)" : "var(--bw-teal-lightest)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: uvColor(weather.uv) }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((weather.uv / 11) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </FadeUp>

      {/* Pollen card */}
      <FadeUp delay={0.12}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="rounded-3xl p-6"
          style={{ ...cardBase, cursor: "default" }}
        >
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.75rem",
              color: "var(--bw-primary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Pollen
          </p>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
              color: pollenColor(weather.pollen),
            }}
          >
            {weather.pollen}
          </motion.span>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
              marginTop: "6px",
            }}
          >
            Birch · Grass · Mugwort
          </p>
        </motion.div>
      </FadeUp>

      {/* Skin Advisory card */}
      <FadeUp delay={0.14}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="rounded-3xl p-6"
          style={{ ...cardBase, cursor: "default" }}
        >
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.75rem",
              color: "var(--bw-primary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Skin Advisory
          </p>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.6rem",
              color:
                weather.humidity < 30
                  ? "#E24B4A"
                  : weather.humidity > 70
                  ? "#EF9F27"
                  : "var(--bw-primary)",
            }}
          >
            {weather.humidity < 30 ? "Dry" : weather.humidity > 70 ? "Humid" : "Balanced"}
          </motion.span>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
              marginTop: "6px",
              lineHeight: 1.6,
            }}
          >
            {weather.humidity < 30
              ? "Low humidity — moisturize and stay hydrated."
              : weather.humidity > 70
              ? "High humidity — skin may feel oily. Stay cool."
              : "Humidity is at a comfortable level for skin health."}
          </p>
        </motion.div>
      </FadeUp>

      {/* Daily Schedule — spans 2 cols */}
      <FadeUp delay={0.16}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="rounded-3xl p-6"
          style={{ ...cardBase, gridColumn: "span 2", cursor: "default" }}
        >
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.75rem",
              color: "var(--bw-primary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Daily Health Schedule
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            {[
              {
                time: "Morning",
                icon: "🌅",
                tips: ["10 min light walk", "Eat a protein-rich breakfast", "Take your medications"],
              },
              {
                time: "Afternoon",
                icon: "☀️",
                tips: [
                  "Stay hydrated",
                  "Take a 5 min posture break",
                  weather.uv > 5 ? "Avoid direct sun exposure" : "Fresh air walk recommended",
                ],
              },
              {
                time: "Evening",
                icon: "🌙",
                tips: ["Avoid screens 1h before bed", "Light stretching", "Review tomorrow's plan"],
              },
            ].map((period, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                className="rounded-2xl p-4"
                style={{
                  background: dark ? "rgba(29,158,117,0.08)" : "var(--bw-teal-lightest)",
                  border: `1px solid ${dark ? "rgba(29,158,117,0.15)" : "var(--bw-teal-soft)"}`,
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.9rem",
                    color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                    marginBottom: "10px",
                  }}
                >
                  {period.icon} {period.time}
                </p>
                <div className="flex flex-col gap-2">
                  {period.tips.map((tip, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                        style={{ background: "var(--bw-primary)" }}
                      />
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.78rem",
                          color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                          lineHeight: 1.5,
                        }}
                      >
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </FadeUp>

      {/* Health Advisory card */}
      <FadeUp delay={0.18}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="rounded-3xl p-6"
          style={{ background: "var(--bw-primary)", cursor: "default" }}
        >
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Health Advisory
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.88rem",
              color: "white",
              lineHeight: 1.65,
            }}
          >
            {healthTip(weather)}
          </p>
        </motion.div>
      </FadeUp>
    </div>
  );
}

export default function Home() {
  const [dark, setDark] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -40]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // FIX 2: destroy scrollYProgress motion value on unmount
  // prevents Framer Motion ghost listeners on back-navigation
  useEffect(() => {
    return () => {
      scrollYProgress.destroy();
    };
  }, [scrollYProgress]);

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: dark ? "var(--bw-bg-dark)" : "var(--bw-bg-light)" }}
    >
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          background: dark ? "rgba(13,31,26,0.88)" : "rgba(247,255,254,0.88)",
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${dark ? "var(--bw-primary-deeper)" : "var(--bw-teal-soft)"}`,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            color: "var(--bw-primary)",
          }}
        >
          bio<span style={{ color: dark ? "var(--bw-teal)" : "var(--bw-primary-dark)" }}>wire</span>
        </span>
        <div className="flex gap-4 items-center">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setDark(!dark)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: dark ? "var(--bw-primary-deeper)" : "var(--bw-teal-lightest)",
              border: "1px solid var(--bw-teal-soft)",
            }}
          >
            <span style={{ fontSize: "15px" }}>{dark ? "☀️" : "🌙"}</span>
          </motion.button>

          {/* FIX 3: <a> → <Link> everywhere for client-side navigation */}
          <Link
            href="/login"
            style={{
              color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
            }}
          >
            Sign In
          </Link>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 rounded-full text-white"
              style={{ background: "var(--bw-primary)", fontFamily: "var(--font-body)", fontSize: "0.95rem" }}
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed left-0 z-[100]"
        style={{
          top: 0,
          scaleX: scrollYProgress,
          transformOrigin: "left",
          background: "linear-gradient(90deg, #085041, #1D9E75, #5DCAA5, #9FE1CB)",
          width: "100%",
          height: "4px",
          boxShadow: "0 0 12px #1D9E75, 0 0 4px #5DCAA5",
        }}
      />

      {/* Hero */}
      <motion.section
        style={{ y: heroY }}
        className="flex flex-col items-center justify-center text-center px-6 gap-8 relative"
      >
        <div
          style={{ minHeight: "100vh", paddingTop: "6rem" }}
          className="flex flex-col items-center justify-center gap-8 relative w-full"
        >
          <Bubbles count={8} dark={dark} />
          <EKGLine />

          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
              color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
              lineHeight: 1.1,
              maxWidth: "700px",
            }}
          >
            Understand Your <span style={{ color: "var(--bw-primary)" }}>Health.</span>
            <br />
            Find the Right <span style={{ color: "var(--bw-primary)" }}>Care.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.15rem",
              color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
              maxWidth: "500px",
              lineHeight: 1.8,
            }}
          >
            Describe your symptoms, discover which specialist to see. Track your health history and stay
            informed with global health news.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex gap-4"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3 rounded-full text-white font-medium"
                style={{
                  background: "var(--bw-primary)",
                  fontFamily: "var(--font-body)",
                  fontSize: "1rem",
                }}
              >
                Get Started
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3 rounded-full font-medium"
              style={{
                border: "1.5px solid var(--bw-teal)",
                color: dark ? "var(--bw-teal)" : "var(--bw-primary-dark)",
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
              }}
            >
              How It Works
            </motion.button>
          </motion.div>

          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent, ${
                dark ? "var(--bw-primary-deeper)" : "var(--bw-teal-lightest)"
              })`,
            }}
          />
        </div>
      </motion.section>

      {/* Environment Section */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: dark ? "var(--bw-bg-dark)" : "var(--bw-bg-light)" }}
      >
        <Bubbles count={5} dark={dark} />
        <div className="relative z-10" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <FadeUp>
            <div className="mb-12 text-center">
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                }}
              >
                Your Environment, <span style={{ color: "var(--bw-primary)" }}>Today</span>
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                  marginTop: "0.75rem",
                }}
              >
                Real-time environmental health data for your location.
              </p>
            </div>
          </FadeUp>
          <EnvBento dark={dark} />
        </div>
      </section>

      {/* Health News Feed */}
      <section
        className="py-24 relative"
        style={{ background: dark ? "var(--bw-primary-deeper)" : "var(--bw-teal-lightest)" }}
      >
        <Bubbles count={5} dark={dark} />
        <div
          className="relative z-10"
          style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}
        >
          <FadeUp>
            <div className="mb-12 text-center">
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                }}
              >
                Global Health <span style={{ color: "var(--bw-primary)" }}>Feed</span>
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                  marginTop: "0.75rem",
                }}
              >
                Stay up to date with the latest health developments from around the world.
              </p>
            </div>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 260px", gap: "4rem" }}>
            {/* Left sidebar */}
            <FadeUp delay={0.1}>
              <div className="flex flex-col gap-4">
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.8rem",
                    color: "var(--bw-primary)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Categories
                </p>
                {[
                  "Global Health",
                  "Research",
                  "Public Health",
                  "Nutrition",
                  "Technology",
                  "Mental Health",
                ].map((cat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="flex items-center gap-3 py-2"
                    style={{
                      borderBottom: `1px solid ${
                        dark ? "rgba(29,158,117,0.15)" : "rgba(159,225,203,0.5)"
                      }`,
                      cursor: "default",
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--bw-primary)" }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.9rem",
                        color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                      }}
                    >
                      {cat}
                    </span>
                  </motion.div>
                ))}

                <div
                  className="mt-4 rounded-2xl p-5"
                  style={{
                    background: dark ? "rgba(29,158,117,0.08)" : "white",
                    border: `1px solid ${dark ? "rgba(29,158,117,0.2)" : "var(--bw-teal-soft)"}`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.75rem",
                      color: "var(--bw-primary)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "12px",
                    }}
                  >
                    Today
                  </p>
                  {[
                    { label: "New Articles", value: "24" },
                    { label: "WHO Updates", value: "3" },
                    { label: "Studies", value: "11" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-2"
                      style={{
                        borderBottom: `1px solid ${
                          dark ? "rgba(29,158,117,0.1)" : "rgba(159,225,203,0.4)"
                        }`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.82rem",
                          color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                        }}
                      >
                        {stat.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "1rem",
                          color: "var(--bw-primary)",
                        }}
                      >
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Center feed */}
            <div className="flex flex-col">
              {mockNews.map((news, i) => (
                <NewsItem key={news.id} news={news} i={i} dark={dark} />
              ))}
            </div>

            {/* Right sidebar */}
            <FadeUp delay={0.15}>
              <div className="flex flex-col gap-5">
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: dark ? "rgba(29,158,117,0.08)" : "white",
                    border: `1px solid ${dark ? "rgba(29,158,117,0.2)" : "var(--bw-teal-soft)"}`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.75rem",
                      color: "var(--bw-primary)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "12px",
                    }}
                  >
                    Trending
                  </p>
                  {[
                    { tag: "#Immunotherapy", count: "1.2k" },
                    { tag: "#MentalHealth", count: "980" },
                    { tag: "#AIinHealth", count: "754" },
                    { tag: "#Nutrition", count: "612" },
                  ].map((trend, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex justify-between items-center py-2"
                      style={{
                        borderBottom: `1px solid ${
                          dark ? "rgba(29,158,117,0.1)" : "rgba(159,225,203,0.4)"
                        }`,
                        cursor: "default",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.85rem",
                          color: "var(--bw-primary)",
                        }}
                      >
                        {trend.tag}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.75rem",
                          color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                        }}
                      >
                        {trend.count}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: dark ? "rgba(29,158,117,0.08)" : "white",
                    border: `1px solid ${dark ? "rgba(29,158,117,0.2)" : "var(--bw-teal-soft)"}`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.75rem",
                      color: "var(--bw-primary)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "12px",
                    }}
                  >
                    Sources
                  </p>
                  {["WHO", "CDC", "PubMed", "Medscape"].map((source, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex items-center gap-3 py-2"
                      style={{
                        borderBottom: `1px solid ${
                          dark ? "rgba(29,158,117,0.1)" : "rgba(159,225,203,0.4)"
                        }`,
                        cursor: "default",
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: "var(--bw-teal-lightest)",
                          border: "1px solid var(--bw-teal-soft)",
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--bw-primary)" }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.85rem",
                          color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                        }}
                      >
                        {source}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-2xl p-5" style={{ background: "var(--bw-primary)" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.65)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    Daily Tip
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.88rem",
                      color: "white",
                      lineHeight: 1.65,
                    }}
                  >
                    Drinking 2L of water daily reduces fatigue by up to 20% and improves cognitive
                    performance.
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="relative overflow-hidden"
        style={{ background: dark ? "var(--bw-bg-dark)" : "var(--bw-bg-light)" }}
      >
        <Bubbles count={6} dark={dark} />

        {/* Bento Grid */}
        <div
          className="relative z-10 py-24"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "6rem 2rem" }}
        >
          <FadeUp>
            <div className="mb-16 text-center">
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                }}
              >
                Everything You Need to{" "}
                <span style={{ color: "var(--bw-primary)" }}>Stay Healthy</span>
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                  marginTop: "0.75rem",
                }}
              >
                Biowire brings together AI, health data, and expert guidance in one place.
              </p>
            </div>
          </FadeUp>

          {/* Bento */}
          <div className="grid gap-5" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
            {/* BioChat — large left */}
            <FadeUp delay={0.05}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="rounded-3xl p-8 relative overflow-hidden"
                style={{
                  background: dark ? "var(--bw-primary-deeper)" : "var(--bw-teal-lightest)",
                  border: `1px solid ${dark ? "rgba(29,158,117,0.25)" : "var(--bw-teal-soft)"}`,
                  gridRow: "span 2",
                  minHeight: "420px",
                  cursor: "default",
                }}
              >
                <div className="absolute bottom-8 left-0 right-0 opacity-20 pointer-events-none">
                  <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none">
                    <motion.polyline
                      points="0,30 80,30 110,30 125,5 140,55 150,15 160,30 190,30 400,30"
                      fill="none"
                      stroke="#1D9E75"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeInOut",
                      }}
                    />
                  </svg>
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                      style={{ background: "var(--bw-primary)" }}
                    >
                      <span style={{ fontSize: "22px" }}>🩺</span>
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "2rem",
                        color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                        marginBottom: "12px",
                        lineHeight: 1.2,
                      }}
                    >
                      BioChat
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "1rem",
                        color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                        lineHeight: 1.75,
                        maxWidth: "320px",
                      }}
                    >
                      Describe your symptoms in plain language. Our AI — powered by fuzzy logic —
                      evaluates severity, suggests the right specialist, and tells you how urgent it is.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-col gap-2">
                    {[
                      { text: "I've had chest pain for 3 days...", fromUser: true },
                      {
                        text: "Based on your symptoms, I recommend seeing a cardiologist within 48 hours.",
                        fromUser: false,
                      },
                    ].map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: msg.fromUser ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1 + i * 0.4 }}
                        className="rounded-2xl px-4 py-2.5 max-w-xs"
                        style={{
                          background: msg.fromUser
                            ? "var(--bw-primary)"
                            : dark
                            ? "rgba(29,158,117,0.15)"
                            : "white",
                          alignSelf: msg.fromUser ? "flex-end" : "flex-start",
                          border: msg.fromUser
                            ? "none"
                            : `1px solid ${
                                dark ? "rgba(29,158,117,0.2)" : "var(--bw-teal-soft)"
                              }`,
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.78rem",
                            color: msg.fromUser
                              ? "white"
                              : dark
                              ? "var(--bw-teal-soft)"
                              : "var(--bw-text-muted)",
                            lineHeight: 1.5,
                          }}
                        >
                          {msg.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </FadeUp>

            {/* Health Dashboard */}
            <FadeUp delay={0.1}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="rounded-3xl p-7 relative overflow-hidden"
                style={{
                  background: dark ? "rgba(29,158,117,0.08)" : "white",
                  border: `1px solid ${dark ? "rgba(29,158,117,0.2)" : "var(--bw-teal-soft)"}`,
                  cursor: "default",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: dark ? "var(--bw-primary-deeper)" : "var(--bw-teal-lightest)",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>📊</span>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.4rem",
                    color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                    marginBottom: "8px",
                  }}
                >
                  Health Dashboard
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.88rem",
                    color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                    lineHeight: 1.65,
                  }}
                >
                  Track symptoms, medications, and your personal health score — all in one place.
                </p>

                <div className="mt-5 flex items-center gap-4">
                  <div className="relative w-14 h-14">
                    <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke={dark ? "rgba(29,158,117,0.15)" : "#E1F5EE"}
                        strokeWidth="3"
                      />
                      <motion.circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="#1D9E75"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="100"
                        initial={{ strokeDashoffset: 100 }}
                        animate={{ strokeDashoffset: 16 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "0.75rem",
                          color: "var(--bw-primary)",
                        }}
                      >
                        84
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "0.85rem",
                        color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                      }}
                    >
                      Health Score
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.75rem",
                        color: "var(--bw-primary)",
                      }}
                    >
                      Good condition
                    </p>
                  </div>
                </div>
              </motion.div>
            </FadeUp>

            {/* Health Library + Global Feed */}
            <FadeUp delay={0.15}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="rounded-3xl p-6 relative overflow-hidden"
                  style={{ background: "var(--bw-primary)", cursor: "default" }}
                >
                  <span style={{ fontSize: "22px" }}>📚</span>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.15rem",
                      color: "white",
                      margin: "10px 0 6px",
                    }}
                  >
                    Health Library
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.8rem",
                      color: "rgba(255,255,255,0.75)",
                      lineHeight: 1.6,
                    }}
                  >
                    Explore conditions and treatments. Let AI summarize what matters.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="rounded-3xl p-6 relative overflow-hidden"
                  style={{
                    background: dark ? "rgba(29,158,117,0.08)" : "white",
                    border: `1px solid ${dark ? "rgba(29,158,117,0.2)" : "var(--bw-teal-soft)"}`,
                    cursor: "default",
                  }}
                >
                  <span style={{ fontSize: "22px" }}>🌍</span>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.15rem",
                      color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                      margin: "10px 0 6px",
                    }}
                  >
                    Global Feed
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.8rem",
                      color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    Real-time news from WHO, CDC, PubMed and more.
                  </p>
                </motion.div>
              </div>
            </FadeUp>
          </div>
        </div>

        {/* Split Screen Reveals */}
        {[
          {
            title: "BioChat",
            subtitle: "AI-Powered Symptom Analysis",
            description:
              "Describe what you're feeling in plain language. Biowire's fuzzy logic engine evaluates severity, cross-references symptoms, and tells you exactly which specialist to see — and how soon.",
            tag: "Fuzzy Logic + Groq LLM",
            visual: (
              <div className="flex flex-col gap-3 w-full max-w-sm">
                {[
                  { text: "I've had sharp chest pain for 3 days.", user: true },
                  {
                    text: "Severity assessed: High. Recommended: Cardiologist within 48h.",
                    user: false,
                  },
                  { text: "Is it urgent?", user: true },
                  { text: "Yes. Please do not delay this visit.", user: false },
                ].map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 0.4 }}
                    className="rounded-2xl px-4 py-3"
                    style={{
                      background: msg.user
                        ? "var(--bw-primary)"
                        : dark
                        ? "rgba(29,158,117,0.12)"
                        : "white",
                      border: msg.user
                        ? "none"
                        : `1px solid ${dark ? "rgba(29,158,117,0.2)" : "var(--bw-teal-soft)"}`,
                      alignSelf: msg.user ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.85rem",
                        color: msg.user
                          ? "white"
                          : dark
                          ? "var(--bw-teal-soft)"
                          : "var(--bw-text-muted)",
                        lineHeight: 1.55,
                      }}
                    >
                      {msg.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            ),
          },
          {
            title: "Health Dashboard",
            subtitle: "Your Health, Visualized",
            description:
              "Log symptoms daily, track medications, and watch your personal health score evolve over time. Family profiles let you manage the health of your loved ones from a single account.",
            tag: "Personal + Family Profiles",
            visual: (
              <div className="w-full max-w-sm flex flex-col gap-4">
                {[
                  { label: "Health Score", value: 84, color: "var(--bw-primary)" },
                  { label: "Symptom Log", value: 67, color: "var(--bw-teal)" },
                  { label: "Medication", value: 92, color: "var(--bw-primary-dark)" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.82rem",
                          color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "0.85rem",
                          color: item.color,
                        }}
                      >
                        {item.value}
                      </span>
                    </div>
                    <div
                      className="rounded-full overflow-hidden"
                      style={{
                        height: "6px",
                        background: dark ? "rgba(29,158,117,0.1)" : "var(--bw-teal-lightest)",
                      }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
          {
            title: "Health Library",
            subtitle: "Knowledge at Your Fingertips",
            description:
              "Browse thousands of conditions, symptoms, and treatments. Paste any medical article and let AI distill it into clear, actionable insights — no medical degree required.",
            tag: "AI Summarization",
            visual: (
              <div className="w-full max-w-sm flex flex-col gap-3">
                {[
                  "Varicocele",
                  "Type-2 Diabetes",
                  "Anxiety Disorders",
                  "Mediterranean Diet",
                ].map((topic, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: dark ? "rgba(29,158,117,0.08)" : "white",
                      border: `1px solid ${
                        dark ? "rgba(29,158,117,0.18)" : "var(--bw-teal-soft)"
                      }`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: "var(--bw-primary)" }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.88rem",
                        color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                      }}
                    >
                      {topic}
                    </span>
                  </motion.div>
                ))}
              </div>
            ),
          },
        ].map((item, i) => (
          <div
            key={i}
            className="relative"
            style={{
              background:
                i % 2 === 0
                  ? dark
                    ? "var(--bw-primary-deeper)"
                    : "var(--bw-teal-lightest)"
                  : dark
                  ? "var(--bw-bg-dark)"
                  : "var(--bw-bg-light)",
            }}
          >
            <Bubbles count={3} dark={dark} />
            <div
              className="relative z-10 flex items-center gap-16 py-24"
              style={{
                maxWidth: "1100px",
                margin: "0 auto",
                padding: "6rem 2rem",
                flexDirection: i % 2 === 0 ? "row" : "row-reverse",
              }}
            >
              <FadeUp delay={0.05}>
                <div className="flex flex-col gap-5" style={{ flex: 1 }}>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: dark
                        ? "rgba(29,158,117,0.15)"
                        : "var(--bw-teal-lightest)",
                      color: "var(--bw-primary)",
                      fontFamily: "var(--font-body)",
                      width: "fit-content",
                      border: `1px solid ${
                        dark ? "rgba(29,158,117,0.25)" : "var(--bw-teal-soft)"
                      }`,
                    }}
                  >
                    {item.tag}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "clamp(2rem, 3.5vw, 3rem)",
                      color: dark ? "var(--bw-teal-lightest)" : "var(--bw-text-dark)",
                      lineHeight: 1.15,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.1rem",
                      color: "var(--bw-primary)",
                    }}
                  >
                    {item.subtitle}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "1rem",
                      color: dark ? "var(--bw-teal-soft)" : "var(--bw-text-muted)",
                      lineHeight: 1.8,
                      maxWidth: "420px",
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </FadeUp>

              <FadeUp delay={0.15}>
                <div
                  className="flex items-center justify-center rounded-3xl p-8 w-full overflow-hidden"
                  style={{
                    flex: 1,
                    background: dark ? "rgba(29,158,117,0.06)" : "white",
                    border: `1px solid ${
                      dark ? "rgba(29,158,117,0.15)" : "var(--bw-teal-soft)"
                    }`,
                    minHeight: "280px",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  {item.visual}
                </div>
              </FadeUp>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section
        className="relative overflow-hidden py-32"
        style={{ background: "var(--bw-primary-deeper)" }}
      >
        <Bubbles count={4} dark={true} />

        <div className="absolute inset-0 flex items-center pointer-events-none opacity-10">
          <svg width="100%" height="120" viewBox="0 0 1400 120" preserveAspectRatio="none">
            <motion.polyline
              points="0,60 200,60 280,60 320,10 360,110 390,25 420,60 520,60 700,60 780,60 820,10 860,110 890,25 920,60 1020,60 1200,60 1240,10 1280,110 1310,25 1340,60 1400,60"
              fill="none"
              stroke="#5DCAA5"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: "easeInOut",
              }}
            />
          </svg>
        </div>

        <FadeUp>
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-8 text-center px-6">
            <div className="flex gap-12 mb-4">
              {[
                { value: "50K+", label: "Users" },
                { value: "120+", label: "Conditions" },
                { value: "98%", label: "Satisfaction" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "2.2rem",
                      color: "var(--bw-teal-lightest)",
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.8rem",
                      color: "var(--bw-teal-soft)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <div style={{ width: "40px", height: "1px", background: "rgba(93,202,165,0.4)" }} />

            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2.2rem, 5vw, 4rem)",
                color: "var(--bw-teal-lightest)",
                lineHeight: 1.1,
              }}
            >
              Take Control of Your
              <br />
              <span style={{ color: "var(--bw-primary)" }}>Health Today.</span>
            </h2>

            <p
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--bw-teal-soft)",
                fontSize: "1.05rem",
                lineHeight: 1.8,
                maxWidth: "480px",
              }}
            >
              Join thousands of users who trust Biowire to understand their health, find the right
              care, and stay informed — every day.
            </p>

            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--bw-primary)", opacity: 0.3 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative px-12 py-4 rounded-full text-white font-medium"
                  style={{
                    background: "var(--bw-primary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "1.05rem",
                  }}
                >
                  Create Your Free Account
                </motion.button>
              </Link>
            </div>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                color: "rgba(159,225,203,0.5)",
              }}
            >
              No credit card required · Free forever for individuals
            </p>
          </div>
        </FadeUp>
      </section>

      {/* Footer */}
      <footer style={{ background: dark ? "#060f0d" : "var(--bw-bg-dark)" }}>
        <div
          className="grid gap-12 py-16 px-8"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
          }}
        >
          {/* Brand col */}
          <div className="flex flex-col gap-5">
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.6rem",
                color: "var(--bw-primary)",
              }}
            >
              bio<span style={{ color: "var(--bw-teal)" }}>wire</span>
            </span>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.88rem",
                color: "var(--bw-text-muted)",
                lineHeight: 1.75,
                maxWidth: "260px",
              }}
            >
              Your personal health assistant. Understand your symptoms, find the right care, and
              stay informed — every day.
            </p>
            <div className="flex gap-3 mt-2">
              {["GitHub", "Instagram", "LinkedIn"].map((s, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.18 }}
                  className="px-3 py-1.5 rounded-lg cursor-default"
                  style={{
                    background: "rgba(29,158,117,0.08)",
                    border: "1px solid rgba(29,158,117,0.15)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      color: "var(--bw-teal-soft)",
                    }}
                  >
                    {s}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Product col */}
          <div className="flex flex-col gap-4">
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.8rem",
                color: "var(--bw-primary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Product
            </p>
            {[
              "BioChat",
              "Health Dashboard",
              "Health Library",
              "Global Feed",
              "Symptom Log",
              "Medications",
            ].map((item, i) => (
              <motion.p
                key={i}
                whileHover={{ x: 3 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  color: "var(--bw-text-muted)",
                  cursor: "default",
                }}
              >
                {item}
              </motion.p>
            ))}
          </div>

          {/* Resources col */}
          <div className="flex flex-col gap-4">
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.8rem",
                color: "var(--bw-primary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Resources
            </p>
            {["WHO", "CDC", "PubMed", "Medscape", "e-Nabiz", "MHRS"].map((item, i) => (
              <motion.p
                key={i}
                whileHover={{ x: 3 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  color: "var(--bw-text-muted)",
                  cursor: "default",
                }}
              >
                {item}
              </motion.p>
            ))}
          </div>

          {/* Legal col */}
          <div className="flex flex-col gap-4">
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.8rem",
                color: "var(--bw-primary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Legal
            </p>
            {["Privacy Policy", "Terms of Service", "Cookie Policy", "Disclaimer"].map(
              (item, i) => (
                <motion.p
                  key={i}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    color: "var(--bw-text-muted)",
                    cursor: "default",
                  }}
                >
                  {item}
                </motion.p>
              )
            )}

            <div
              className="mt-4 rounded-xl p-3"
              style={{
                background: "rgba(29,158,117,0.06)",
                border: "1px solid rgba(29,158,117,0.12)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem",
                  color: "rgba(159,225,203,0.45)",
                  lineHeight: 1.6,
                }}
              >
                Biowire does not provide medical advice. Always consult a qualified healthcare
                professional.
              </p>
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between px-8 py-5"
          style={{
            borderTop: "1px solid rgba(29,158,117,0.1)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              color: "rgba(159,225,203,0.35)",
            }}
          >
            © 2026 Biowire. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--bw-primary)" }}
            />
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                color: "rgba(159,225,203,0.35)",
              }}
            >
              Built with care for your health.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}