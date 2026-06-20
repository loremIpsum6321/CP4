import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const genieSpring = { type: 'spring', stiffness: 260, damping: 22, mass: 0.9 };

/**
 * GenieOverlay
 * A full-viewport scrim + panel that "warps" open from a transform-origin
 * point (typically the element that was clicked), scaling/skewing in like
 * a MacBook window genie effect, then settling with a soft jelly bounce.
 */
export default function GenieOverlay({ isOpen, onClose, origin, children, label }) {
  const originStyle = origin
    ? { transformOrigin: `${origin.x}% ${origin.y}%` }
    : { transformOrigin: '50% 50%' };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-10"
          initial="closed"
          animate="open"
          exit="closed"
        >
          <motion.div
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            style={originStyle}
            variants={{
              closed: { opacity: 0, scale: 0.15, skewY: 6, borderRadius: 48 },
              open: { opacity: 1, scale: 1, skewY: 0, borderRadius: 24 },
            }}
            transition={genieSpring}
            className="glass-panel relative z-10 flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 shadow-panel"
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
