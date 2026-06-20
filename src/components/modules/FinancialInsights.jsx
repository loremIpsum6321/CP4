import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card.jsx';
import AnimatedNumber from '../ui/AnimatedNumber.jsx';
import { useDashboard } from '../../context/DashboardContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';

function TopItemCell({ item, tone }) {
  if (!item) {
    return (
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-3 text-center text-sm text-slate-600">
        —
      </div>
    );
  }
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-3"
    >
      <div className="truncate text-xs font-medium text-slate-300">{item.name}</div>
      <div className={`mt-1 text-sm font-bold tabular-nums ${tone}`}>{formatCurrency(item.cost)}</div>
    </motion.div>
  );
}

export default function FinancialInsights({ onDrilldown }) {
  const {
    state,
    selectors: { financialTotalPTD },
    updateComments,
  } = useDashboard();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(state.dashboardComments.text);

  const topCycle = state.topCycleCounts.items || [];
  const topScrap = state.topScrap.items || [];

  const saveComments = () => {
    updateComments(draft);
    setEditing(false);
  };

  return (
    <Card>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div
          className="cursor-pointer rounded-2xl border border-accent/20 bg-accent/[0.04] px-5 py-4"
          onClick={(e) => onDrilldown?.(e, 'financial-total')}
        >
          <div className="text-[11px] uppercase tracking-wide text-accent/80">Total Inventory Adj. (PTD)</div>
          <AnimatedNumber
            value={financialTotalPTD}
            formatter={formatCurrency}
            className={`mt-1 block text-3xl font-extrabold ${financialTotalPTD >= 0 ? 'text-good' : 'text-bad'}`}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <TopItemCell key={`cycle-${i}`} item={topCycle[i]} tone="text-accent" />
          ))}
          {[0, 1, 2].map((i) => (
            <TopItemCell key={`scrap-${i}`} item={topScrap[i]} tone="text-bad" />
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Comments</h4>
          {!editing && (
            <button
              onClick={() => {
                setDraft(state.dashboardComments.text);
                setEditing(true);
              }}
              className="text-[11px] font-medium text-accent hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-accent/50"
            />
            <div className="flex gap-2">
              <button
                onClick={saveComments}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-ink-950"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{state.dashboardComments.text}</p>
        )}
      </div>
    </Card>
  );
}
