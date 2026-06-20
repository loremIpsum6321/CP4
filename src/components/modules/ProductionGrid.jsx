import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { useDashboard } from '../../context/DashboardContext.jsx';
import { formatCurrency, formatNumber } from '../../utils/formatters.js';

function statusTone(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('compl') || s.includes('rel')) return 'good';
  if (s.includes('hold') || s.includes('block')) return 'bad';
  return 'warn';
}

export default function ProductionGrid() {
  const {
    selectors: { productionOrders },
  } = useDashboard();
  const [filter, setFilter] = useState('all');

  const filtered = productionOrders.filter((o) => {
    if (filter === 'variance') return o.variance && Math.abs(o.variance.qtyVariance) > 0;
    if (filter === 'open') return o.progressPct < 100;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          Process orders merged from <span className="text-accent">COID</span> status against{' '}
          <span className="text-accent">VAR REPORT</span> material variance.
        </p>
        <div className="flex gap-1.5 rounded-full border border-white/10 bg-white/[0.03] p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'open', label: 'In Progress' },
            { key: 'variance', label: 'Has Variance' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === opt.key ? 'bg-accent text-ink-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🏭"
          title="No process orders to show"
          hint="Drop COID and VAR REPORT exports to populate this view"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((order, i) => (
            <motion.div
              key={`${order.order}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 260, damping: 22 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-sm font-semibold text-white">{order.order || 'N/A'}</div>
                  <div className="truncate text-xs text-slate-500">{order.material || 'No material listed'}</div>
                </div>
                <Badge tone={statusTone(order.systemStatus)}>{order.systemStatus || 'Unknown'}</Badge>
              </div>

              <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {formatNumber(order.qtyDelivered)} / {formatNumber(order.qtyTarget)} units
                </span>
                <span className="font-semibold text-accent">{order.progressPct}%</span>
              </div>
              <ProgressBar
                pct={order.progressPct}
                tone={order.progressPct >= 100 ? 'good' : order.progressPct < 50 ? 'warn' : 'accent'}
              />

              {order.variance && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                  <span className="text-slate-500">Qty Variance</span>
                  <span className={order.variance.qtyVariance < 0 ? 'text-bad' : 'text-good'}>
                    {formatNumber(order.variance.qtyVariance)}
                  </span>
                  <span className="text-slate-500">Value Variance</span>
                  <span className={order.variance.valueVariance < 0 ? 'text-bad' : 'text-good'}>
                    {formatCurrency(order.variance.valueVariance)}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
