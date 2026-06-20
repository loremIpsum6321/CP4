import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { useDashboard } from '../../context/DashboardContext.jsx';
import { formatDatePretty } from '../../utils/dateHelpers.js';

export default function MaterialShortages() {
  const { state } = useDashboard();
  const shortages = state.materialShortages.shortages || [];

  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Material Shortages</h2>
        {shortages.length > 0 && <Badge tone={shortages.length > 5 ? 'bad' : 'warn'}>{shortages.length} open</Badge>}
      </div>

      {shortages.length === 0 ? (
        <EmptyState icon="📦" title="No shortages" hint="Drop a material_shortages export to populate" />
      ) : (
        <div className="max-h-72 overflow-y-auto rounded-xl border border-white/[0.05]">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-ink-800/95 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Material</th>
                <th className="px-3 py-2">Short Qty</th>
                <th className="px-3 py-2">Next ETA</th>
                <th className="px-3 py-2">Run Out</th>
              </tr>
            </thead>
            <tbody>
              {shortages.map((row, i) => (
                <motion.tr
                  key={`${row.material}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-t border-white/[0.04] hover:bg-white/[0.03]"
                >
                  <td className="px-3 py-2 font-medium text-slate-200">{row.material || 'N/A'}</td>
                  <td className="px-3 py-2 text-bad">{row.shortQty ?? 'N/A'}</td>
                  <td className="px-3 py-2 text-slate-400">{formatDatePretty(row.eta)}</td>
                  <td className="px-3 py-2 text-slate-400">{row.runOut ?? 'N/A'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
