import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * ============================================================
 * RAW FILE READING
 * Converts an uploaded .xlsx / .csv File into a plain
 * array-of-arrays matrix (row 0 = headers).
 * ============================================================
 */
export async function readFileAsMatrix(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) {
    return readCSVAsMatrix(file);
  }
  return readXLSXAsMatrix(file);
}

function readCSVAsMatrix(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}

async function readXLSXAsMatrix(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' });
}

/**
 * ============================================================
 * HEADER NORMALIZATION + MATCHING HELPERS
 * ============================================================
 */
function normalizeHeader(h) {
  return String(h ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function headerRowIncludesAll(headerRow, required) {
  const normalized = headerRow.map(normalizeHeader);
  return required.every((req) =>
    normalized.some((h) => h === req.toLowerCase() || h.includes(req.toLowerCase()))
  );
}

function headerRowExactSet(headerRow, required) {
  const normalized = headerRow.map(normalizeHeader).filter(Boolean);
  const requiredLower = required.map((r) => r.toLowerCase());
  return (
    requiredLower.every((r) => normalized.includes(r)) &&
    normalized.length <= requiredLower.length + 2
  );
}

function findColIndex(headerRow, matchers) {
  const normalized = headerRow.map(normalizeHeader);
  for (const matcher of matchers) {
    const idx = normalized.findIndex((h) => h.includes(matcher.toLowerCase()));
    if (idx !== -1) return idx;
  }
  return -1;
}

function toObjectRows(headerRow, dataRows) {
  return dataRows
    .filter((row) => row.some((cell) => cell !== '' && cell !== null && cell !== undefined))
    .map((row) => {
      const obj = {};
      headerRow.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });
}

/**
 * ============================================================
 * DATASET TYPE KEYS (mirror these in DashboardContext)
 * ============================================================
 */
export const DATASET_TYPES = {
  INVENTORY: 'inventory',
  MOVEMENTS: 'movements',
  COID: 'coid',
  VAR_REPORT: 'varReport',
  ATS: 'ats',
  COGI_ERRORS: 'cogiErrors',
  WEEKLY_CYCLE_COUNTS: 'weeklyCycleCounts',
  WEEKLY_SCRAP_TRANSACTIONS: 'weeklyScrapTransactions',
  DASHBOARD_COMMENTS: 'dashboardComments',
  INGREDIENTS_STATUS: 'ingredientsStatus',
  LATE_LOADS: 'lateLoads',
  MATERIAL_SHORTAGES: 'materialShortages',
  RAILCARS: 'railcars',
  TOP_CYCLE_COUNTS: 'topCycleCounts',
  TOP_SCRAP: 'topScrap',
  UNKNOWN: 'unknown',
};

/**
 * ============================================================
 * FINGERPRINTING
 * Given a raw matrix (row0 = header), determine which dataset
 * this file represents. fileNameHint helps disambiguate the
 * legacy formats that share identical headers (W1-W4 / ItemName+CostValue).
 * ============================================================
 */
export function fingerprintMatrix(matrix, fileNameHint = '') {
  if (!matrix || matrix.length === 0) return DATASET_TYPES.UNKNOWN;
  const headerRow = matrix[0].map((h) => String(h ?? '').trim());
  const lowerName = fileNameHint.toLowerCase();

  // --- Primary SAP-style exports (most specific, check first) ---
  if (headerRowIncludesAll(headerRow, ['Docs entered up to', 'SLED/BBD', 'AGE(days)'])) {
    return DATASET_TYPES.INVENTORY;
  }
  if (headerRowIncludesAll(headerRow, ['Movement Type', 'Material Document', 'Reason for Movement'])) {
    return DATASET_TYPES.MOVEMENTS;
  }
  if (headerRowIncludesAll(headerRow, ['Order', 'System Status', 'Qty Delivered'])) {
    return DATASET_TYPES.COID;
  }
  if (
    headerRowIncludesAll(headerRow, [
      'Process Order',
      'Quantity variance With Scrap',
      'Value of Variance with Scrap',
    ])
  ) {
    return DATASET_TYPES.VAR_REPORT;
  }

  // --- Legacy CSV formats ---
  if (headerRowExactSet(headerRow, ['Area', 'Count'])) {
    return DATASET_TYPES.COGI_ERRORS;
  }
  if (headerRowExactSet(headerRow, ['Comments'])) {
    return DATASET_TYPES.DASHBOARD_COMMENTS;
  }
  if (headerRowExactSet(headerRow, ['Timeframe', 'Status'])) {
    return DATASET_TYPES.INGREDIENTS_STATUS;
  }
  if (headerRowIncludesAll(headerRow, ['Date', 'Type', 'Material No.', 'PO Number'])) {
    return DATASET_TYPES.LATE_LOADS;
  }
  if (headerRowIncludesAll(headerRow, ['Material', 'ShortQuantity', 'ETA'])) {
    return DATASET_TYPES.MATERIAL_SHORTAGES;
  }
  if (headerRowIncludesAll(headerRow, ['RailNumber', 'Material', 'Location'])) {
    return DATASET_TYPES.RAILCARS;
  }
  if (headerRowExactSet(headerRow, ['W1', 'W2', 'W3', 'W4'])) {
    if (lowerName.includes('scrap')) return DATASET_TYPES.WEEKLY_SCRAP_TRANSACTIONS;
    if (lowerName.includes('cycle')) return DATASET_TYPES.WEEKLY_CYCLE_COUNTS;
    // ambiguous - default, caller can offer a manual toggle
    return DATASET_TYPES.WEEKLY_CYCLE_COUNTS;
  }
  if (headerRowExactSet(headerRow, ['ItemName', 'CostValue'])) {
    if (lowerName.includes('scrap')) return DATASET_TYPES.TOP_SCRAP;
    if (lowerName.includes('cycle')) return DATASET_TYPES.TOP_CYCLE_COUNTS;
    return DATASET_TYPES.TOP_CYCLE_COUNTS;
  }
  if (headerRowExactSet(headerRow, ['ats']) || headerRowExactSet(headerRow, ['ATS'])) {
    return DATASET_TYPES.ATS;
  }
  // single-column numeric file named ats.csv with no real header
  if (headerRow.length === 1 && lowerName.includes('ats')) {
    return DATASET_TYPES.ATS;
  }

  return DATASET_TYPES.UNKNOWN;
}

/**
 * ============================================================
 * PER-TYPE TRANSFORMERS
 * Convert the raw matrix into a clean, typed payload ready
 * to drop into DashboardContext state.
 * ============================================================
 */
function transformInventory(matrix) {
  const [headerRow, ...rows] = matrix;
  const objects = toObjectRows(headerRow, rows);
  const idxMaterial = findColIndex(headerRow, ['material', 'description']);
  const idxBatch = findColIndex(headerRow, ['batch']);
  const idxDocsEntered = findColIndex(headerRow, ['docs entered up to']);
  const idxSled = findColIndex(headerRow, ['sled/bbd', 'sled']);
  const idxAge = findColIndex(headerRow, ['age(days)', 'age']);
  const idxQty = findColIndex(headerRow, ['unrestricted', 'quantity', 'qty']);

  const items = rows
    .filter((row) => row.some((c) => c !== '' && c !== null && c !== undefined))
    .map((row) => ({
      material: idxMaterial !== -1 ? row[idxMaterial] : row[0],
      batch: idxBatch !== -1 ? row[idxBatch] : '',
      docsEnteredUpTo: idxDocsEntered !== -1 ? row[idxDocsEntered] : '',
      sled: idxSled !== -1 ? row[idxSled] : '',
      ageDays: idxAge !== -1 ? Number(row[idxAge]) || 0 : 0,
      quantity: idxQty !== -1 ? Number(row[idxQty]) || 0 : 0,
      raw: row,
    }));

  return { headers: headerRow, items, objects };
}

function transformMovements(matrix) {
  const [headerRow, ...rows] = matrix;
  const idxType = findColIndex(headerRow, ['movement type']);
  const idxDoc = findColIndex(headerRow, ['material document']);
  const idxReason = findColIndex(headerRow, ['reason for movement']);
  const idxMaterial = findColIndex(headerRow, ['material', 'description']);
  const idxDate = findColIndex(headerRow, ['posting date', 'date']);
  const idxQty = findColIndex(headerRow, ['quantity', 'qty']);
  const idxValue = findColIndex(headerRow, ['value', 'amount']);

  const all = [];
  const cycleCounts = [];
  const scrap = [];

  rows
    .filter((row) => row.some((c) => c !== '' && c !== null && c !== undefined))
    .forEach((row) => {
      const movementTypeRaw = idxType !== -1 ? String(row[idxType] ?? '').trim() : '';
      const movementCode = (movementTypeRaw.match(/\d{3}/) || [])[0] || movementTypeRaw;
      const record = {
        movementType: movementTypeRaw,
        movementCode,
        materialDocument: idxDoc !== -1 ? row[idxDoc] : '',
        reason: idxReason !== -1 ? row[idxReason] : '',
        material: idxMaterial !== -1 ? row[idxMaterial] : '',
        date: idxDate !== -1 ? row[idxDate] : '',
        quantity: idxQty !== -1 ? Number(row[idxQty]) || 0 : 0,
        value: idxValue !== -1 ? Number(row[idxValue]) || 0 : 0,
        raw: row,
      };
      all.push(record);
      if (movementCode === '701' || movementCode === '702') {
        cycleCounts.push(record);
      } else if (movementCode === '551' || movementCode === '555') {
        scrap.push(record);
      }
    });

  return { headers: headerRow, all, cycleCounts, scrap };
}

function transformCOID(matrix) {
  const [headerRow, ...rows] = matrix;
  const idxOrder = findColIndex(headerRow, ['order']);
  const idxStatus = findColIndex(headerRow, ['system status']);
  const idxQtyDelivered = findColIndex(headerRow, ['qty delivered']);
  const idxQtyTarget = findColIndex(headerRow, ['target qty', 'order quantity', 'total qty']);
  const idxMaterial = findColIndex(headerRow, ['material', 'description']);

  const orders = rows
    .filter((row) => row.some((c) => c !== '' && c !== null && c !== undefined))
    .map((row) => ({
      order: idxOrder !== -1 ? row[idxOrder] : '',
      systemStatus: idxStatus !== -1 ? row[idxStatus] : '',
      qtyDelivered: idxQtyDelivered !== -1 ? Number(row[idxQtyDelivered]) || 0 : 0,
      qtyTarget: idxQtyTarget !== -1 ? Number(row[idxQtyTarget]) || 0 : 0,
      material: idxMaterial !== -1 ? row[idxMaterial] : '',
      raw: row,
    }));

  return { headers: headerRow, orders };
}

function transformVarReport(matrix) {
  const [headerRow, ...rows] = matrix;
  const idxOrder = findColIndex(headerRow, ['process order']);
  const idxQtyVar = findColIndex(headerRow, ['quantity variance with scrap']);
  const idxValueVar = findColIndex(headerRow, ['value of variance with scrap']);
  const idxMaterial = findColIndex(headerRow, ['material', 'description']);

  const variances = rows
    .filter((row) => row.some((c) => c !== '' && c !== null && c !== undefined))
    .map((row) => ({
      processOrder: idxOrder !== -1 ? row[idxOrder] : '',
      qtyVariance: idxQtyVar !== -1 ? Number(row[idxQtyVar]) || 0 : 0,
      valueVariance: idxValueVar !== -1 ? Number(row[idxValueVar]) || 0 : 0,
      material: idxMaterial !== -1 ? row[idxMaterial] : '',
      raw: row,
    }));

  return { headers: headerRow, variances };
}

function transformWeeklyTotals(matrix) {
  const [, ...rows] = matrix;
  const row = rows.find((r) => r.some((c) => c !== '' && c !== null && c !== undefined)) || [];
  const weeks = [0, 1, 2, 3].map((i) => Number(row[i]) || 0);
  return { weeks, total: weeks.reduce((a, b) => a + b, 0) };
}

function transformCogiErrors(matrix) {
  const [, ...rows] = matrix;
  let batching = 0;
  let packaging = 0;
  rows.forEach((row) => {
    const area = String(row[0] ?? '').toLowerCase().trim();
    const count = Number(row[1]) || 0;
    if (area === 'batching') batching += count;
    else if (area === 'packaging') packaging += count;
  });
  return { batching, packaging };
}

function transformAts(matrix) {
  const [headerRow, ...rows] = matrix;
  // handle headerless single-value files where the "header" IS the value
  const headerLooksNumeric = headerRow.length === 1 && !Number.isNaN(parseFloat(headerRow[0]));
  let value = 0;
  if (headerLooksNumeric) {
    value = parseFloat(headerRow[0]) || 0;
  } else if (rows.length > 0) {
    value = parseFloat(rows[0][0]) || 0;
  }
  return { value };
}

function transformComments(matrix) {
  const [headerRow, ...rows] = matrix;
  const headerLooksLikeComment = headerRow.length === 1 && headerRow[0] && headerRow[0].toLowerCase() !== 'comments';
  const lines = [];
  if (headerLooksLikeComment) lines.push(headerRow[0]);
  rows.forEach((row) => {
    if (row[0]) lines.push(row[0]);
  });
  return { text: lines.join('\n').trim() || 'No comments available.' };
}

function transformIngredientsStatus(matrix) {
  const [, ...rows] = matrix;
  const result = { '24hr': 'bad', '48hr': 'bad' };
  rows.forEach((row) => {
    const timeframe = String(row[0] ?? '').toLowerCase().trim();
    const statusText = String(row[1] ?? '').toLowerCase().trim() || 'crit';
    let mapped = 'bad';
    if (statusText === 'ok' || statusText === 'good') mapped = 'good';
    else if (statusText === 'caution' || statusText === 'warning') mapped = 'warn';
    if (timeframe === '24hr') result['24hr'] = mapped;
    else if (timeframe === '48hr') result['48hr'] = mapped;
  });
  return result;
}

function transformLateLoads(matrix) {
  const [headerRow, ...rows] = matrix;
  const idxDate = findColIndex(headerRow, ['date']);
  const idxMatNo = findColIndex(headerRow, ['material no']);
  const idxPO = findColIndex(headerRow, ['po number']);
  const idxVendor = findColIndex(headerRow, ['vendor']);
  const idxDesc = findColIndex(headerRow, ['description']);
  const idxQty = findColIndex(headerRow, ['open qty', 'qty']);

  const loads = rows
    .filter((row) => row.some((c) => c !== '' && c !== null && c !== undefined))
    .map((row) => ({
      date: idxDate !== -1 ? row[idxDate] : row[0],
      materialNo: idxMatNo !== -1 ? row[idxMatNo] : row[2],
      poNumber: idxPO !== -1 ? row[idxPO] : row[3],
      vendor: idxVendor !== -1 ? row[idxVendor] : row[4],
      description: idxDesc !== -1 ? row[idxDesc] : row[5],
      openQty: idxQty !== -1 ? row[idxQty] : row[6],
      raw: row,
    }));

  return { loads };
}

function transformMaterialShortages(matrix) {
  const [headerRow, ...rows] = matrix;
  const idxMaterial = findColIndex(headerRow, ['material']);
  const idxShortQty = findColIndex(headerRow, ['shortquantity', 'short quantity']);
  const idxEta = findColIndex(headerRow, ['eta']);
  const idxRunOut = findColIndex(headerRow, ['run out', 'runout']);

  const shortages = rows
    .filter((row) => row.some((c) => c !== '' && c !== null && c !== undefined))
    .map((row) => ({
      material: idxMaterial !== -1 ? row[idxMaterial] : row[0],
      shortQty: idxShortQty !== -1 ? row[idxShortQty] : row[1],
      eta: idxEta !== -1 ? row[idxEta] : row[2],
      runOut: idxRunOut !== -1 ? row[idxRunOut] : row[3],
    }));

  return { shortages };
}

function transformRailcars(matrix) {
  const [headerRow, ...rows] = matrix;
  const idxRail = findColIndex(headerRow, ['railnumber', 'rail number', 'rail #']);
  const idxMaterial = findColIndex(headerRow, ['material']);
  const idxLocation = findColIndex(headerRow, ['location']);
  const idxBol = findColIndex(headerRow, ['bol']);
  const idxRomer = findColIndex(headerRow, ['romer']);
  const idxReleased = findColIndex(headerRow, ['released']);

  const railcars = rows
    .filter((row) => row.some((c) => c !== '' && c !== null && c !== undefined))
    .map((row, i) => ({
      id: `rc-${i}-${Date.now()}`,
      railNumber: idxRail !== -1 ? row[idxRail] : row[0],
      material: idxMaterial !== -1 ? row[idxMaterial] : row[1],
      location: (idxLocation !== -1 ? row[idxLocation] : row[2]) || 'N/A',
      bol: String(idxBol !== -1 ? row[idxBol] : row[3]).toLowerCase() === 'true',
      romer: String(idxRomer !== -1 ? row[idxRomer] : row[4]).toLowerCase() === 'true',
      released: String(idxReleased !== -1 ? row[idxReleased] : row[5]).toLowerCase() === 'true',
    }));

  return { railcars };
}

function transformTopItems(matrix) {
  const [, ...rows] = matrix;
  const items = rows
    .filter((row) => row.some((c) => c !== '' && c !== null && c !== undefined))
    .slice(0, 3)
    .map((row) => ({
      name: row[0] || 'N/A',
      cost: Number(row[1]) || 0,
    }));
  return { items };
}

/**
 * ============================================================
 * PUBLIC ENTRY POINT
 * Reads + fingerprints + transforms a single File object.
 * ============================================================
 */
export async function processFile(file) {
  try {
    const matrix = await readFileAsMatrix(file);
    if (!matrix || matrix.length === 0) {
      return { type: DATASET_TYPES.UNKNOWN, fileName: file.name, error: 'Empty file' };
    }
    const type = fingerprintMatrix(matrix, file.name);
    let payload;

    switch (type) {
      case DATASET_TYPES.INVENTORY:
        payload = transformInventory(matrix);
        break;
      case DATASET_TYPES.MOVEMENTS:
        payload = transformMovements(matrix);
        break;
      case DATASET_TYPES.COID:
        payload = transformCOID(matrix);
        break;
      case DATASET_TYPES.VAR_REPORT:
        payload = transformVarReport(matrix);
        break;
      case DATASET_TYPES.WEEKLY_CYCLE_COUNTS:
      case DATASET_TYPES.WEEKLY_SCRAP_TRANSACTIONS:
        payload = transformWeeklyTotals(matrix);
        break;
      case DATASET_TYPES.COGI_ERRORS:
        payload = transformCogiErrors(matrix);
        break;
      case DATASET_TYPES.ATS:
        payload = transformAts(matrix);
        break;
      case DATASET_TYPES.DASHBOARD_COMMENTS:
        payload = transformComments(matrix);
        break;
      case DATASET_TYPES.INGREDIENTS_STATUS:
        payload = transformIngredientsStatus(matrix);
        break;
      case DATASET_TYPES.LATE_LOADS:
        payload = transformLateLoads(matrix);
        break;
      case DATASET_TYPES.MATERIAL_SHORTAGES:
        payload = transformMaterialShortages(matrix);
        break;
      case DATASET_TYPES.RAILCARS:
        payload = transformRailcars(matrix);
        break;
      case DATASET_TYPES.TOP_CYCLE_COUNTS:
      case DATASET_TYPES.TOP_SCRAP:
        payload = transformTopItems(matrix);
        break;
      default:
        payload = { headers: matrix[0], rowCount: matrix.length - 1 };
    }

    return { type, fileName: file.name, payload };
  } catch (error) {
    console.error(`Failed to process file ${file.name}:`, error);
    return { type: DATASET_TYPES.UNKNOWN, fileName: file.name, error: error.message };
  }
}

/**
 * Process multiple dropped/selected files in parallel.
 */
export async function processFiles(fileList) {
  const files = Array.from(fileList);
  return Promise.all(files.map(processFile));
}
