import React from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import AnimatedNumber from '../ui/AnimatedNumber.jsx';

function WeekBreakdownTable({ title, weeks, total, tone }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <span className={`font-mono text-lg font-bold ${tone}`}>{formatCurrency(total)}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {weeks.map((w, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 18 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center"
          >
            <div className="text-[10px] uppercase tracking-wide text-slate-500">Week {i + 1}</div>
            <div className={`mt-1 text-base font-bold tabular-nums ${w >= 0 ? 'text-good' : 'text-bad'}`}>
              {formatCurrency(w)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function MetricDrilldown({ metric }) {
  const { state, selectors } = useDashboard();

  if (metric === 'inventory-counts') {
    return (
      <div className="space-y-6">
        <p className="text-sm text-slate-400">
          Weekly period-to-date breakdown for cycle counts and scrap transactions.
        </p>
        <WeekBreakdownTable
          title="Cycle Counts PTD"
          weeks={state.weeklyCycleCounts.weeks}
          total={state.weeklyCycleCounts.total}
          tone="text-accent"
        />
        <WeekBreakdownTable
          title="Scrap Transactions PTD"
          weeks={state.weeklyScrapTransactions.weeks}
          total={state.weeklyScrapTransactions.total}
          tone="text-bad"
        />
      </div>
    );
  }

  if (metric === 'financial-total') {
    const topCycle = state.topCycleCounts.items || [];
    const topScrap = state.topScrap.items || [];
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-5 text-center">
          <div className="text-xs uppercase tracking-wide text-accent/80">Total Inventory Adjustment (PTD)</div>
          <AnimatedNumber
            value={selectors.financialTotalPTD}
            formatter={formatCurrency}
            className="mt-1 block text-4xl font-extrabold text-white"
          />
          <p className="mt-1 text-xs text-slate-500">Cycle Count PTD + Scrap Transaction PTD</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-accent">Top Cycle Count Items</h4>
            <div className="space-y-2">
              {topCycle.length === 0 && <p className="text-xs text-slate-600">No data yet.</p>}
              {topCycle.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm"
                >
                  <span className="truncate text-slate-300">{item.name}</span>
                  <span className="font-semibold text-accent">{formatCurrency(item.cost)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-bad">Top Scrap Items</h4>
            <div className="space-y-2">
              {topScrap.length === 0 && <p className="text-xs text-slate-600">No data yet.</p>}
              {topScrap.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm"
                >
                  <span className="truncate text-slate-300">{item.name}</span>
                  <span className="font-semibold text-bad">{formatCurrency(item.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <p className="text-sm text-slate-500">No detail view available for this metric.</p>;
}
