import React from 'react';
import { motion } from 'framer-motion';
import RailcarOverview from '../modules/RailcarOverview.jsx';
import MaterialShortages from '../modules/MaterialShortages.jsx';
import LateLoads from '../modules/LateLoads.jsx';
import InventoryCountsCard from '../modules/InventoryCountsCard.jsx';
import FinancialInsights from '../modules/FinancialInsights.jsx';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function MainStage({ onDrilldown }) {
  return (
    <motion.main
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-[1700px] px-6 py-8"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <motion.div variants={item} className="space-y-5">
          <MaterialShortages />
          <LateLoads />
        </motion.div>

        <motion.div variants={item} className="space-y-5">
          <RailcarOverview />
          <InventoryCountsCard onDrilldown={onDrilldown} />
        </motion.div>
      </div>

      <motion.div variants={item} className="mt-5">
        <FinancialInsights onDrilldown={onDrilldown} />
      </motion.div>
    </motion.main>
  );
}
