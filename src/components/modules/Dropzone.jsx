import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext.jsx';

export default function Dropzone() {
  const { ingestFiles } = useDashboard();
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState(null); // { kind: 'success'|'error', message }
  const dragCounter = useRef(0);
  const statusTimer = useRef(null);

  useEffect(() => {
    const onDragEnter = (e) => {
      e.preventDefault();
      if (e.dataTransfer?.types?.includes('Files')) {
        dragCounter.current += 1;
        setIsDragging(true);
      }
    };
    const onDragOver = (e) => {
      e.preventDefault();
    };
    const onDragLeave = (e) => {
      e.preventDefault();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDragging(false);
      }
    };
    const onDrop = async (e) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const valid = Array.from(files).filter((f) => /\.(csv|xlsx|xls)$/i.test(f.name));
      if (valid.length === 0) {
        showStatus('error', 'No .csv or .xlsx files detected in drop.');
        return;
      }

      showStatus('busy', `Processing ${valid.length} file${valid.length > 1 ? 's' : ''}…`);
      const results = await ingestFiles(valid);
      const unrecognized = results.filter((r) => r.error || r.type === 'unknown');
      if (unrecognized.length > 0) {
        showStatus(
          'error',
          `${results.length - unrecognized.length}/${results.length} files routed. ${unrecognized
            .map((u) => u.fileName)
            .join(', ')} unrecognized.`
        );
      } else {
        showStatus('success', `Routed ${results.length} file${results.length > 1 ? 's' : ''} successfully.`);
      }
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [ingestFiles]);

  const showStatus = useCallback((kind, message) => {
    clearTimeout(statusTimer.current);
    setStatus({ kind, message });
    if (kind !== 'busy') {
      statusTimer.current = setTimeout(() => setStatus(null), 4200);
    }
  }, []);

  return (
    <>
      {/* Full-screen drag-over veil */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="rounded-3xl border-2 border-dashed border-accent/60 bg-accent/[0.04] px-16 py-14 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-4 text-5xl"
              >
                📥
              </motion.div>
              <p className="text-lg font-semibold text-white">Drop to auto-route into DDS Super Dashboard</p>
              <p className="mt-1 text-sm text-slate-400">
                Headers are fingerprinted automatically — drop any mix of .xlsx / .csv exports at once.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast-style status pill */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className={`fixed bottom-6 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium shadow-panel backdrop-blur-xl ${
              status.kind === 'success'
                ? 'border-good-border bg-good-bg text-good'
                : status.kind === 'error'
                ? 'border-bad-border bg-bad-bg text-bad'
                : 'border-accent/30 bg-accent/10 text-accent'
            }`}
          >
            {status.kind === 'busy' && (
              <motion.span
                className="h-2 w-2 rounded-full bg-accent"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
            {status.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
