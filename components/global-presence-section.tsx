"use client";

import { WorldMap } from "@/components/ui/world-map";
import { motion } from "framer-motion";

// Alubond project cities — 90+ countries served
const ALUBOND_ROUTES = [
  {
    // USA HQ → Dubai (primary hub)
    start: { lat: 33.749, lng: -84.388, label: "Atlanta, USA" },
    end:   { lat: 25.2048, lng: 55.2708, label: "Dubai, UAE" },
  },
  {
    // Dubai → Doha (GCC expansion)
    start: { lat: 25.2048, lng: 55.2708, label: "Dubai, UAE" },
    end:   { lat: 25.2854, lng: 51.531, label: "Doha, Qatar" },
  },
  {
    // Dubai → Nairobi (Africa)
    start: { lat: 25.2048, lng: 55.2708, label: "Dubai, UAE" },
    end:   { lat: -1.2921, lng: 36.8219, label: "Nairobi, Kenya" },
  },
  {
    // London → Istanbul (Europe)
    start: { lat: 51.5074, lng: -0.1278, label: "London, UK" },
    end:   { lat: 41.0082, lng: 28.9784, label: "Istanbul, Turkey" },
  },
  {
    // Istanbul → Dubai (connecting corridors)
    start: { lat: 41.0082, lng: 28.9784, label: "Istanbul, Turkey" },
    end:   { lat: 25.2048, lng: 55.2708, label: "Dubai, UAE" },
  },
  {
    // Barcelona → London (Western Europe)
    start: { lat: 41.3851, lng: 2.1734, label: "Barcelona, Spain" },
    end:   { lat: 51.5074, lng: -0.1278, label: "London, UK" },
  },
  {
    // Dubai → Mumbai (South Asia)
    start: { lat: 25.2048, lng: 55.2708, label: "Dubai, UAE" },
    end:   { lat: 19.076, lng: 72.8777, label: "Mumbai, India" },
  },
  {
    // USA → Belgrade (Eastern Europe)
    start: { lat: 33.749, lng: -84.388, label: "Atlanta, USA" },
    end:   { lat: 44.8176, lng: 20.4633, label: "Belgrade, Serbia" },
  },
];

const STATS = [
  { value: "90+", label: "Countries" },
  { value: "50K+", label: "Projects Delivered" },
  { value: "35+", label: "Years of Excellence" },
  { value: "6", label: "Continents" },
];

export function GlobalPresenceSection() {
  return (
    <section className="w-full bg-white py-24 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-xs font-semibold tracking-[0.28em] uppercase text-[#F7941D] mb-4"
          >
            Global Reach
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-['Barlow_Condensed'] text-5xl md:text-7xl font-extrabold tracking-tight uppercase text-[#1D1D1F] leading-none"
          >
            Built Across{" "}
            <span className="text-[#F7941D]">
              {"the World".split("").map((char, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block"
                  initial={{ y: -8, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.035 }}
                  viewport={{ once: true }}
                >
                  {char === " " ? "\u00a0" : char}
                </motion.span>
              ))}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            viewport={{ once: true }}
            className="mt-5 text-base md:text-lg text-[#6E6E73] max-w-2xl mx-auto leading-relaxed"
          >
            From the towers of Dubai to the facades of Barcelona, Alubond panels
            protect and define skylines across 90+ countries — trusted by
            architects, contractors, and developers worldwide.
          </motion.p>
        </div>

        {/* World Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <WorldMap dots={ALUBOND_ROUTES} lineColor="#F7941D" />
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[rgba(0,0,0,0.09)] pt-12"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-1"
            >
              <span className="font-['Barlow_Condensed'] text-4xl md:text-5xl font-extrabold tracking-tight text-[#F7941D]">
                {stat.value}
              </span>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6E6E73]">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
