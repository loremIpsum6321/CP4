import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { DATASET_TYPES, processFiles } from '../utils/dataParser.js';
import { DATE_RANGE_MODES, isWithinDateRange, daysUntil } from '../utils/dateHelpers.js';
import { safeNumber } from '../utils/formatters.js';

const DashboardContext = createContext(null);

const initialState = {
  dateRangeMode: DATE_RANGE_MODES.CURRENT_PERIOD,
  activePanel: null, // 'production' | 'inventory' | null
  drilldownMetric: null, // for legacy metric genie-zoom modal
  lastUpdated: null,
  recentFiles: [], // [{ fileName, type, timestamp }]
  dropError: null,

  [DATASET_TYPES.ATS]: { value: 0 },
  [DATASET_TYPES.COGI_ERRORS]: { batching: 0, packaging: 0 },
  [DATASET_TYPES.WEEKLY_CYCLE_COUNTS]: { weeks: [0, 0, 0, 0], total: 0 },
  [DATASET_TYPES.WEEKLY_SCRAP_TRANSACTIONS]: { weeks: [0, 0, 0, 0], total: 0 },
  [DATASET_TYPES.DASHBOARD_COMMENTS]: { text: 'No comments yet. Drop a comments export to populate.' },
  [DATASET_TYPES.INGREDIENTS_STATUS]: { '24hr': 'bad', '48hr': 'bad' },
  [DATASET_TYPES.LATE_LOADS]: { loads: [] },
  [DATASET_TYPES.MATERIAL_SHORTAGES]: { shortages: [] },
  [DATASET_TYPES.RAILCARS]: { railcars: [] },
  [DATASET_TYPES.TOP_CYCLE_COUNTS]: { items: [] },
  [DATASET_TYPES.TOP_SCRAP]: { items: [] },

  [DATASET_TYPES.INVENTORY]: { headers: [], items: [] },
  [DATASET_TYPES.MOVEMENTS]: { headers: [], all: [], cycleCounts: [], scrap: [] },
  [DATASET_TYPES.COID]: { headers: [], orders: [] },
  [DATASET_TYPES.VAR_REPORT]: { headers: [], variances: [] },
};

function reducer(state, action) {
  switch (action.type) {
    case 'INGEST_RESULTS': {
      const next = { ...state };
      const log = [...state.recentFiles];
      let hadError = null;

      action.results.forEach((result) => {
        if (result.error || result.type === DATASET_TYPES.UNKNOWN) {
          hadError = `"${result.fileName}" wasn't recognized — check its headers.`;
          log.unshift({ fileName: result.fileName, type: 'unrecognized', timestamp: Date.now() });
          return;
        }
        next[result.type] = result.payload;
        log.unshift({ fileName: result.fileName, type: result.type, timestamp: Date.now() });
      });

      next.recentFiles = log.slice(0, 12);
      next.lastUpdated = Date.now();
      next.dropError = hadError;
      return next;
    }
    case 'SET_DATE_RANGE_MODE':
      return { ...state, dateRangeMode: action.mode };
    case 'SET_ACTIVE_PANEL':
      return { ...state, activePanel: state.activePanel === action.panel ? null : action.panel };
    case 'CLOSE_PANEL':
      return { ...state, activePanel: null };
    case 'SET_DRILLDOWN':
      return { ...state, drilldownMetric: action.metric };
    case 'CLEAR_DROP_ERROR':
      return { ...state, dropError: null };
    case 'UPDATE_COGI':
      return {
        ...state,
        [DATASET_TYPES.COGI_ERRORS]: { ...state[DATASET_TYPES.COGI_ERRORS], [action.field]: action.value },
      };
    case 'UPDATE_ATS':
      return { ...state, [DATASET_TYPES.ATS]: { value: action.value } };
    case 'UPDATE_COMMENTS':
      return { ...state, [DATASET_TYPES.DASHBOARD_COMMENTS]: { text: action.text } };
    case 'UPDATE_INGREDIENT_STATUS':
      return {
        ...state,
        [DATASET_TYPES.INGREDIENTS_STATUS]: {
          ...state[DATASET_TYPES.INGREDIENTS_STATUS],
          [action.timeframe]: action.value,
        },
      };
    case 'CYCLE_RAILCAR_LOCATION': {
      const railcars = state[DATASET_TYPES.RAILCARS].railcars.map((rc) => {
        if (rc.id !== action.id) return rc;
        const loc = (rc.location || '').toLowerCase();
        let next = 'Site';
        if (loc.includes('site')) next = 'Yard';
        else if (loc.includes('yard')) next = 'Transit';
        else if (loc.includes('transit')) next = 'Site';
        return { ...rc, location: next };
      });
      return { ...state, [DATASET_TYPES.RAILCARS]: { railcars } };
    }
    case 'TOGGLE_RAILCAR_FLAG': {
      const railcars = state[DATASET_TYPES.RAILCARS].railcars.map((rc) =>
        rc.id === action.id ? { ...rc, [action.field]: !rc[action.field] } : rc
      );
      return { ...state, [DATASET_TYPES.RAILCARS]: { railcars } };
    }
    default:
      return state;
  }
}

export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const ingestFiles = useCallback(async (fileList) => {
    const results = await processFiles(fileList);
    dispatch({ type: 'INGEST_RESULTS', results });
    return results;
  }, []);

  const setDateRangeMode = useCallback((mode) => dispatch({ type: 'SET_DATE_RANGE_MODE', mode }), []);
  const setActivePanel = useCallback((panel) => dispatch({ type: 'SET_ACTIVE_PANEL', panel }), []);
  const closePanel = useCallback(() => dispatch({ type: 'CLOSE_PANEL' }), []);
  const setDrilldown = useCallback((metric) => dispatch({ type: 'SET_DRILLDOWN', metric }), []);
  const clearDropError = useCallback(() => dispatch({ type: 'CLEAR_DROP_ERROR' }), []);
  const updateCogi = useCallback((field, value) => dispatch({ type: 'UPDATE_COGI', field, value }), []);
  const updateAts = useCallback((value) => dispatch({ type: 'UPDATE_ATS', value }), []);
  const updateComments = useCallback((text) => dispatch({ type: 'UPDATE_COMMENTS', text }), []);
  const updateIngredientStatus = useCallback(
    (timeframe, value) => dispatch({ type: 'UPDATE_INGREDIENT_STATUS', timeframe, value }),
    []
  );
  const cycleRailcarLocation = useCallback((id) => dispatch({ type: 'CYCLE_RAILCAR_LOCATION', id }), []);
  const toggleRailcarFlag = useCallback((id, field) => dispatch({ type: 'TOGGLE_RAILCAR_FLAG', id, field }), []);

  /* ===========================================================
   * DERIVED / MEMOIZED SELECTORS
   * =========================================================== */

  // Movements filtered to the active date range
  const filteredMovements = useMemo(() => {
    const { all = [] } = state[DATASET_TYPES.MOVEMENTS];
    if (all.length === 0) return { cycleCounts: [], scrap: [] };
    const cycleCounts = [];
    const scrap = [];
    all.forEach((m) => {
      const inRange = m.date ? isWithinDateRange(m.date, state.dateRangeMode) : true;
      if (!inRange) return;
      if (m.movementCode === '701' || m.movementCode === '702') cycleCounts.push(m);
      else if (m.movementCode === '551' || m.movementCode === '555') scrap.push(m);
    });
    return { cycleCounts, scrap };
  }, [state[DATASET_TYPES.MOVEMENTS], state.dateRangeMode]);

  const movementTotals = useMemo(() => {
    const cycleTotal = filteredMovements.cycleCounts.reduce((sum, m) => sum + safeNumber(m.value), 0);
    const scrapTotal = filteredMovements.scrap.reduce((sum, m) => sum + safeNumber(m.value), 0);
    const worstCycle = [...filteredMovements.cycleCounts]
      .sort((a, b) => Math.abs(safeNumber(b.value)) - Math.abs(safeNumber(a.value)))
      .slice(0, 3);
    const worstScrap = [...filteredMovements.scrap]
      .sort((a, b) => Math.abs(safeNumber(b.value)) - Math.abs(safeNumber(a.value)))
      .slice(0, 3);
    return {
      cycleTotal,
      scrapTotal,
      cycleCount: filteredMovements.cycleCounts.length,
      scrapCount: filteredMovements.scrap.length,
      worstCycle,
      worstScrap,
    };
  }, [filteredMovements]);

  // Expiring materials, soonest-first, derived from Inventory dataset
  const expiringMaterials = useMemo(() => {
    const items = state[DATASET_TYPES.INVENTORY].items || [];
    return [...items]
      .map((item) => ({ ...item, daysToExpiry: daysUntil(item.sled) }))
      .filter((item) => item.daysToExpiry !== null)
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [state[DATASET_TYPES.INVENTORY]]);

  // Process orders combining COID status with VAR REPORT variance, target vs actual
  const productionOrders = useMemo(() => {
    const orders = state[DATASET_TYPES.COID].orders || [];
    const variances = state[DATASET_TYPES.VAR_REPORT].variances || [];
    const varianceByOrder = new Map(variances.map((v) => [String(v.processOrder).trim(), v]));

    return orders.map((order) => {
      const variance = varianceByOrder.get(String(order.order).trim());
      const target = order.qtyTarget || 0;
      const actual = order.qtyDelivered || 0;
      const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
      return {
        ...order,
        variance,
        progressPct: pct,
      };
    });
  }, [state[DATASET_TYPES.COID], state[DATASET_TYPES.VAR_REPORT]]);

  // Late loads bucketed counts
  const lateLoadCounts = useMemo(() => {
    const loads = state[DATASET_TYPES.LATE_LOADS].loads || [];
    let late = 0;
    let today = 0;
    let future = 0;
    loads.forEach((l) => {
      const diff = daysUntil(l.date);
      if (diff === null) return;
      if (diff < 0) late++;
      else if (diff === 0) today++;
      else future++;
    });
    return { late, today, future };
  }, [state[DATASET_TYPES.LATE_LOADS]]);

  const railcarCounts = useMemo(() => {
    const cars = state[DATASET_TYPES.RAILCARS].railcars || [];
    const onSite = cars.filter((c) => (c.location || '').toLowerCase().includes('site')).length;
    const inYard = cars.filter((c) => (c.location || '').toLowerCase().includes('yard')).length;
    return { onSite, inYard, total: onSite + inYard, raw: cars.length };
  }, [state[DATASET_TYPES.RAILCARS]]);

  const financialTotalPTD = useMemo(() => {
    const cycleTotal = state[DATASET_TYPES.WEEKLY_CYCLE_COUNTS].total || 0;
    const scrapTotal = state[DATASET_TYPES.WEEKLY_SCRAP_TRANSACTIONS].total || 0;
    return cycleTotal + scrapTotal;
  }, [state[DATASET_TYPES.WEEKLY_CYCLE_COUNTS], state[DATASET_TYPES.WEEKLY_SCRAP_TRANSACTIONS]]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      ingestFiles,
      setDateRangeMode,
      setActivePanel,
      closePanel,
      setDrilldown,
      clearDropError,
      updateCogi,
      updateAts,
      updateComments,
      updateIngredientStatus,
      cycleRailcarLocation,
      toggleRailcarFlag,
      selectors: {
        filteredMovements,
        movementTotals,
        expiringMaterials,
        productionOrders,
        lateLoadCounts,
        railcarCounts,
        financialTotalPTD,
      },
    }),
    [
      state,
      ingestFiles,
      setDateRangeMode,
      setActivePanel,
      closePanel,
      setDrilldown,
      clearDropError,
      updateCogi,
      updateAts,
      updateComments,
      updateIngredientStatus,
      cycleRailcarLocation,
      toggleRailcarFlag,
      filteredMovements,
      movementTotals,
      expiringMaterials,
      productionOrders,
      lateLoadCounts,
      railcarCounts,
      financialTotalPTD,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within a DashboardProvider');
  return ctx;
}

export { DATASET_TYPES };
