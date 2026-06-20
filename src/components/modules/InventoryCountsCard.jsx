import React from 'react';
import Card from '../ui/Card.jsx';
import AnimatedNumber from '../ui/AnimatedNumber.jsx';
import { useDashboard } from '../../context/DashboardContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';

function WeeklyMiniTable({ title, weeks, total, tone }) {
  return (
    <div className="flex-1">
      <h3 className="mb-2 flex items-baseline justify-between text-sm font-semibold text-slate-200">
        <span>{title} PTD</span>
        <span className={`font-mono text-base ${tone}`}>
          <AnimatedNumber value={total} formatter={formatCurrency} />
        </span>
      </h3>
      <div className="grid grid-cols-4 gap-1.5">
        {weeks.map((w, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-2 py-2 text-center"
          >
            <div className="text-[10px] uppercase tracking-wide text-slate-500">W{i + 1}</div>
            <div className={`mt-1 text-xs font-semibold tabular-nums ${w >= 0 ? 'text-good' : 'text-bad'}`}>
              {formatCurrency(w)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InventoryCountsCard({ onDrilldown }) {
  const { state } = useDashboard();
  const cycle = state.weeklyCycleCounts;
  const scrap = state.weeklyScrapTransactions;

  return (
    <Card clickable onClick={(e) => onDrilldown?.(e, 'inventory-counts')}>
      <div className="flex flex-col gap-5 sm:flex-row">
        <WeeklyMiniTable title="Cycle Counts" weeks={cycle.weeks} total={cycle.total} tone="text-accent" />
        <div className="hidden w-px self-stretch bg-white/[0.06] sm:block" />
        <WeeklyMiniTable title="Scrap Transactions" weeks={scrap.weeks} total={scrap.total} tone="text-bad" />
      </div>
    </Card>
  );
}
