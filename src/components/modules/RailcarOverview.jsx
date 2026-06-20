import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import AnimatedNumber from '../ui/AnimatedNumber.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { useDashboard } from '../../context/DashboardContext.jsx';

function LocationChip({ location, onClick }) {
  const loc = (location || '').toLowerCase();
  const tone = loc.includes('site') ? 'good' : loc.includes('yard') ? 'warn' : 'bad';
  return (
    <button onClick={onClick} className="cursor-pointer">
      <Badge tone={tone}>{location || 'N/A'}</Badge>
    </button>
  );
}

function FlagChip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${
        active ? 'bg-good-bg text-good' : 'bg-white/[0.04] text-slate-500'
      }`}
      title={label}
    >
      {active ? 'Yes' : 'No'}
    </button>
  );
}

export default function RailcarOverview() {
  const {
    state,
    selectors: { railcarCounts },
    cycleRailcarLocation,
    toggleRailcarFlag,
  } = useDashboard();

  const railcars = state.railcars.railcars || [];

  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Railcar Overview</h2>
        <Badge tone="accent">{railcarCounts.total} active</Badge>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: 'On Site', value: railcarCounts.onSite, tone: 'text-good' },
          { label: 'In Yard', value: railcarCounts.inYard, tone: 'text-warn' },
          { label: 'Grand Total', value: railcarCounts.total, tone: 'text-accent' },
        ].map((box) => (
          <motion.div
            key={box.label}
            whileHover={{ y: -2 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center"
          >
            <AnimatedNumber value={box.value} className={`block text-2xl font-bold ${box.tone}`} />
            <span className="mt-1 block text-[11px] uppercase tracking-wide text-slate-500">{box.label}</span>
          </motion.div>
        ))}
      </div>

      {railcars.length === 0 ? (
        <EmptyState icon="🚃" title="No railcar data yet" hint="Drop a railcars export to populate" />
      ) : (
        <div className="max-h-64 overflow-y-auto rounded-xl border border-white/[0.05]">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-ink-800/95 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Rail #</th>
                <th className="px-3 py-2">Material</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2 text-center">BOL</th>
                <th className="px-3 py-2 text-center">Romer</th>
                <th className="px-3 py-2 text-center">Released</th>
              </tr>
            </thead>
            <tbody>
              {railcars.map((rc) => (
                <motion.tr
                  key={rc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-white/[0.04] hover:bg-white/[0.03]"
                >
                  <td className="px-3 py-2 font-medium text-slate-200">{rc.railNumber || 'N/A'}</td>
                  <td className="px-3 py-2 text-slate-400">{rc.material || 'N/A'}</td>
                  <td className="px-3 py-2">
                    <LocationChip location={rc.location} onClick={() => cycleRailcarLocation(rc.id)} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <FlagChip active={rc.bol} label="BOL" onClick={() => toggleRailcarFlag(rc.id, 'bol')} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <FlagChip active={rc.romer} label="Romer" onClick={() => toggleRailcarFlag(rc.id, 'romer')} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <FlagChip
                      active={rc.released}
                      label="Released"
                      onClick={() => toggleRailcarFlag(rc.id, 'released')}
                    />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
