import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ pct = 0, tone = 'accent', height = 'h-2' }) {
  const toneClass =
    tone === 'good' ? 'bg-good' : tone === 'warn' ? 'bg-warn' : tone === 'bad' ? 'bg-bad' : 'bg-accent';

  return (
    <div className={`w-full overflow-hidden rounded-full bg-white/[0.06] ${height}`}>
      <motion.div
        className={`h-full rounded-full ${toneClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
      />
    </div>
  );
}
