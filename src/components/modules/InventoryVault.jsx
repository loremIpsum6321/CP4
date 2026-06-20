import React from 'react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge.jsx';
import AnimatedNumber from '../ui/AnimatedNumber.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { useDashboard } from '../../context/DashboardContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { humanRangeLabel } from '../../utils/dateHelpers.js';

function expiryTone(days) {
  if (days < 0) return 'bad';
  if (days <= 14) return 'bad';
  if (days <= 30) return 'warn';
  return 'good';
}

function SummaryStat({ label, value, formatter, tone }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center">
      <AnimatedNumber value={value} formatter={formatter} className={`block text-xl font-bold ${tone}`} />
      <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

export default function InventoryVault() {
  const {
    state,
    selectors: { movementTotals, expiringMaterials },
  } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Movement window: <span className="text-accent">{humanRangeLabel(state.dateRangeMode)}</span>
        </p>
      </div>

      {/* Scrap (551/555) */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-white">Scrap &nbsp;<span className="text-slate-500 font-normal">(551 / 555)</span></h3>
        <div className="grid grid-cols-2 gap-3">
          <SummaryStat label="Total Value" value={movementTotals.scrapTotal} formatter={formatCurrency} tone="text-bad" />
          <SummaryStat label="Transactions" value={movementTotals.scrapCount} tone="text-slate-200" />
        </div>
      </section>

      {/* Cycle Counts (701/702) */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Cycle Counts &nbsp;<span className="text-slate-500 font-normal">(701 / 702)</span>
          </h3>
          <Badge tone="accent">{movementTotals.cycleCount} moves</Badge>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <SummaryStat label="Total Value" value={movementTotals.cycleTotal} formatter={formatCurrency} tone="text-accent" />
          <SummaryStat label="Transactions" value={movementTotals.cycleCount} tone="text-slate-200" />
        </div>
        {movementTotals.worstCycle.length === 0 ? (
          <EmptyState icon="📊" title="No cycle count movements in range" />
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Top 3 Worst</p>
            {movementTotals.worstCycle.map((m, i) => (
              <motion.div
                key={`${m.materialDocument}-${i}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm"
              >
                <span className="truncate text-slate-300">{m.material || m.materialDocument || 'N/A'}</span>
                <span className={m.value < 0 ? 'text-bad font-semibold' : 'text-good font-semibold'}>
                  {formatCurrency(m.value)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Expiring Materials */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-white">Expiring Materials</h3>
        {expiringMaterials.length === 0 ? (
          <EmptyState icon="⏳" title="No inventory SLED data yet" hint="Drop the Inventory export to populate" />
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {expiringMaterials.slice(0, 25).map((item, i) => {
              const tone = expiryTone(item.daysToExpiry);
              return (
                <motion.div
                  key={`${item.material}-${item.batch}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i, 8) * 0.03 }}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-200">{item.material || 'N/A'}</div>
                    <div className="truncate text-xs text-slate-500">Batch {item.batch || 'N/A'} · Age {item.ageDays}d</div>
                  </div>
                  <Badge tone={tone}>
                    {item.daysToExpiry < 0 ? `${Math.abs(item.daysToExpiry)}d overdue` : `${item.daysToExpiry}d left`}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
