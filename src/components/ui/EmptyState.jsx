import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({ icon = '📂', title, hint }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-2 py-10 text-center"
    >
      <span className="text-3xl opacity-40">{icon}</span>
      <p className="text-sm font-medium text-slate-400">{title}</p>
      {hint && <p className="text-xs text-slate-600">{hint}</p>}
    </motion.div>
  );
}
