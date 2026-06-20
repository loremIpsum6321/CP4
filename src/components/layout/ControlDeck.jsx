import React from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext.jsx';
import DateRangeToggle from '../ui/DateRangeToggle.jsx';
import StatusDropdown from '../ui/StatusDropdown.jsx';
import Button from '../ui/Button.jsx';

function CogiInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
        className={`w-12 bg-transparent text-right text-sm font-bold outline-none tabular-nums ${
          value > 0 ? 'text-bad' : 'text-good'
        }`}
      />
    </div>
  );
}

export default function ControlDeck({ onOpenProduction, onOpenInventory }) {
  const { state, updateCogi, updateAts, updateIngredientStatus } = useDashboard();

  const atsValue = state.ats.value;
  const atsTone = atsValue < 92 ? 'text-bad' : 'text-good';

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1700px] flex-wrap items-center gap-4 px-6 py-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <motion.div
            className="h-2.5 w-2.5 rounded-full bg-accent"
            animate={{ boxShadow: ['0 0 0px #00c4a7', '0 0 14px #00c4a7', '0 0 0px #00c4a7'] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
          <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-white">DDS Super Dashboard</span>
        </div>

        <div className="hidden h-8 w-px bg-white/10 lg:block" />

        {/* COGIs */}
        <div className="flex items-center gap-2">
          <span className="mr-1 text-[11px] uppercase tracking-wide text-slate-500">COGIs</span>
          <CogiInput
            label="Batching"
            value={state.cogiErrors.batching}
            onChange={(v) => updateCogi('batching', v)}
          />
          <CogiInput
            label="Packaging"
            value={state.cogiErrors.packaging}
            onChange={(v) => updateCogi('packaging', v)}
          />
        </div>

        <div className="hidden h-8 w-px bg-white/10 lg:block" />

        {/* ATS */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">ATS</span>
          <input
            type="number"
            value={atsValue}
            onChange={(e) => updateAts(parseFloat(e.target.value) || 0)}
            className={`w-14 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-right text-sm font-bold outline-none tabular-nums ${atsTone}`}
          />
          <span className={`text-sm font-bold ${atsTone}`}>%</span>
        </div>

        <div className="hidden h-8 w-px bg-white/10 lg:block" />

        {/* Ingredient Status */}
        <div className="flex items-center gap-3">
          <StatusDropdown
            label="24hr"
            value={state.ingredientsStatus['24hr']}
            onChange={(v) => updateIngredientStatus('24hr', v)}
          />
          <StatusDropdown
            label="48hr"
            value={state.ingredientsStatus['48hr']}
            onChange={(v) => updateIngredientStatus('48hr', v)}
          />
        </div>

        <div className="flex-1" />

        {/* Date Range + Panel Triggers */}
        <DateRangeToggle />
        <Button variant="ghost" onClick={onOpenProduction}>
          🏭 Production Grid
        </Button>
        <Button variant="primary" onClick={onOpenInventory}>
          🗄️ Inventory Vault
        </Button>
      </div>
    </header>
  );
}
