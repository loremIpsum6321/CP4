import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import AnimatedNumber from '../ui/AnimatedNumber.jsx';
import { useDashboard } from '../../context/DashboardContext.jsx';
import { formatDatePretty, classifyByDate } from '../../utils/dateHelpers.js';

const ROW_TONE = {
  late: 'border-l-2 border-l-bad bg-bad-bg/30',
  today: 'border-l-2 border-l-good bg-good-bg/20',
  future: 'border-l-2 border-l-transparent',
  unknown: 'border-l-2 border-l-transparent',
};

export default function LateLoads() {
  const {
    state,
    selectors: { lateLoadCounts },
  } = useDashboard();
  const loads = state.lateLoads.loads || [];

  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Late Loads</h2>
        <div className="flex gap-2">
          <Badge tone="bad">
            <AnimatedNumber value={lateLoadCounts.late} /> Late
          </Badge>
          <Badge tone="good">
            <AnimatedNumber value={lateLoadCounts.today} /> Today
          </Badge>
          <Badge tone="neutral">
            <AnimatedNumber value={lateLoadCounts.future} /> Upcoming
          </Badge>
        </div>
      </div>

      {loads.length === 0 ? (
        <EmptyState icon="🚚" title="No late load data" hint="Drop late_loads.csv to populate" />
      ) : (
        <div className="max-h-72 overflow-y-auto rounded-xl border border-white/[0.05]">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-ink-800/95 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Material #</th>
                <th className="px-3 py-2">PO Number</th>
                <th className="px-3 py-2">Vendor</th>
                <th className="px-3 py-2">Open Qty</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((row, i) => {
                const bucket = classifyByDate(row.date);
                return (
                  <motion.tr
                    key={`${row.poNumber}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.025 }}
                    className={`border-t border-white/[0.04] hover:bg-white/[0.03] ${ROW_TONE[bucket]}`}
                  >
                    <td className="px-3 py-2 text-slate-300">{formatDatePretty(row.date)}</td>
                    <td className="px-3 py-2 font-medium text-slate-200">{row.materialNo || 'N/A'}</td>
                    <td className="px-3 py-2 text-slate-400">{row.poNumber || 'N/A'}</td>
                    <td className="px-3 py-2 text-slate-400">{row.vendor || 'N/A'}</td>
                    <td className="px-3 py-2 text-slate-400">{row.openQty ?? 'N/A'}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
