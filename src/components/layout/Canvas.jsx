import React from 'react';
import { useDashboard } from '../../context/DashboardContext.jsx';

export default function Canvas({ children }) {
  const { state } = useDashboard();

  return (
    <div className="relative min-h-screen">
      {/* Ambient grid backdrop */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {children}

      <footer className="mx-auto max-w-[1700px] px-6 py-6 text-center text-xs text-slate-600">
        Last updated:{' '}
        <span className="text-slate-400">
          {state.lastUpdated ? new Date(state.lastUpdated).toLocaleString() : '—'}
        </span>
      </footer>
    </div>
  );
}
