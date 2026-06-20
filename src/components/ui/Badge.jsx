import React from 'react';
import { motion } from 'framer-motion';

const TONE_CLASSES = {
  good: 'bg-good-bg text-good border-good-border',
  warn: 'bg-warn-bg text-warn border-warn-border',
  bad: 'bg-bad-bg text-bad border-bad-border',
  neutral: 'bg-white/[0.06] text-slate-300 border-white/10',
  accent: 'bg-accent/10 text-accent border-accent/30',
};

export default function Badge({ tone = 'neutral', children, className = '', pulse = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${TONE_CLASSES[tone]} ${className}`}
    >
      {pulse && (
        <motion.span
          className={`h-1.5 w-1.5 rounded-full ${
            tone === 'good' ? 'bg-good' : tone === 'warn' ? 'bg-warn' : tone === 'bad' ? 'bg-bad' : 'bg-accent'
          }`}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {children}
    </span>
  );
}
