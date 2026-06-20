import React, { useState, useCallback } from 'react';
import Canvas from './components/layout/Canvas.jsx';
import ControlDeck from './components/layout/ControlDeck.jsx';
import MainStage from './components/layout/MainStage.jsx';
import Dropzone from './components/modules/Dropzone.jsx';
import ProductionGrid from './components/modules/ProductionGrid.jsx';
import InventoryVault from './components/modules/InventoryVault.jsx';
import MetricDrilldown from './components/modules/MetricDrilldown.jsx';
import GenieOverlay from './components/ui/GenieOverlay.jsx';
import SlideDrawer from './components/ui/SlideDrawer.jsx';
import { useDashboard } from './context/DashboardContext.jsx';

function eventOrigin(e) {
  if (!e) return null;
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;
  return { x, y };
}

export default function App() {
  const { state, setActivePanel, closePanel, setDrilldown } = useDashboard();
  const [origin, setOrigin] = useState(null);

  const openProduction = useCallback(
    (e) => {
      setOrigin(eventOrigin(e));
      setActivePanel('production');
    },
    [setActivePanel]
  );

  const openInventory = useCallback(
    (e) => {
      setOrigin(eventOrigin(e));
      setActivePanel('inventory');
    },
    [setActivePanel]
  );

  const handleDrilldown = useCallback(
    (e, metric) => {
      setOrigin(eventOrigin(e));
      setDrilldown(metric);
    },
    [setDrilldown]
  );

  return (
    <Canvas>
      <Dropzone />
      <ControlDeck onOpenProduction={openProduction} onOpenInventory={openInventory} />
      <MainStage onDrilldown={handleDrilldown} />

      <GenieOverlay
        isOpen={state.activePanel === 'production'}
        onClose={closePanel}
        origin={origin}
        label="Production Grid"
      >
        <ProductionGrid />
      </GenieOverlay>

      <SlideDrawer
        isOpen={state.activePanel === 'inventory'}
        onClose={closePanel}
        label="Inventory Vault"
      >
        <InventoryVault />
      </SlideDrawer>

      <GenieOverlay
        isOpen={!!state.drilldownMetric}
        onClose={() => setDrilldown(null)}
        origin={origin}
        label={state.drilldownMetric === 'financial-total' ? 'Financial Insights' : 'Inventory Counts'}
      >
        <MetricDrilldown metric={state.drilldownMetric} />
      </GenieOverlay>
    </Canvas>
  );
}
