import React from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-accent text-ink-950 hover:bg-accent-soft shadow-glow-accent',
  ghost: 'bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] border border-white/10',
  subtle: 'bg-transparent text-slate-400 hover:text-slate-200',
};

export default function Button({
  children,
  onClick,
  variant = 'ghost',
  className = '',
  active = false,
  ...rest
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`relative rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-150 ${VARIANTS[variant]} ${
        active ? 'ring-2 ring-accent/50' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
