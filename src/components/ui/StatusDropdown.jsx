import React from 'react';
import { motion } from 'framer-motion';
import Badge from './Badge.jsx';

const OPTIONS = [
  { value: 'good', label: 'Good', tone: 'good' },
  { value: 'warn', label: 'Caution', tone: 'warn' },
  { value: 'bad', label: 'Crit', tone: 'bad' },
];

export default function StatusDropdown({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>}
      <div className="flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
        {OPTIONS.map((opt) => {
          const isActive = opt.value === value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => onChange?.(opt.value)}
              whileTap={{ scale: 0.92 }}
              className="relative rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300"
            >
              {isActive && (
                <motion.span
                  layoutId={`status-pill-${label || 'default'}`}
                  className={`absolute inset-0 rounded-full ${
                    opt.tone === 'good' ? 'bg-good' : opt.tone === 'warn' ? 'bg-warn' : 'bg-bad'
                  }`}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                />
              )}
              <span className={`relative z-10 ${isActive ? 'text-ink-950' : ''}`}>{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
