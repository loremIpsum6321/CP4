import React from 'react';
import { motion } from 'framer-motion';
import { DATE_RANGE_MODES } from '../../utils/dateHelpers.js';
import { useDashboard } from '../../context/DashboardContext.jsx';

const OPTIONS = [
  { key: DATE_RANGE_MODES.H24, label: '24h' },
  { key: DATE_RANGE_MODES.H48, label: '48h' },
  { key: DATE_RANGE_MODES.CURRENT_PERIOD, label: 'Current Period' },
];

export default function DateRangeToggle() {
  const { state, setDateRangeMode } = useDashboard();

  return (
    <div className="flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
      {OPTIONS.map((opt) => {
        const active = state.dateRangeMode === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => setDateRangeMode(opt.key)}
            className="relative rounded-full px-3 py-1.5 text-xs font-semibold text-slate-300"
          >
            {active && (
              <motion.span
                layoutId="date-range-pill"
                className="absolute inset-0 rounded-full bg-accent"
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              />
            )}
            <span className={`relative z-10 ${active ? 'text-ink-950' : 'hover:text-white'}`}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
