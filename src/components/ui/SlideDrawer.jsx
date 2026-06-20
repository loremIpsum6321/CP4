import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const drawerSpring = { type: 'spring', stiffness: 300, damping: 26, mass: 0.9 };

export default function SlideDrawer({ isOpen, onClose, children, label, side = 'right' }) {
  const closedX = side === 'right' ? '100%' : '-100%';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-40 flex justify-end" initial="closed" animate="open" exit="closed">
          <motion.div
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            variants={{ open: { x: 0 }, closed: { x: closedX } }}
            transition={drawerSpring}
            className="glass-panel relative z-10 flex h-full w-full max-w-xl flex-col border-l border-white/10 shadow-panel"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">{label}</h2>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-slate-300 hover:bg-white/[0.12]"
                aria-label="Close"
              >
                ✕
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
