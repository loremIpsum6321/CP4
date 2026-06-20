import {
  startOfDay,
  subHours,
  isWithinInterval,
  previousSunday,
  isSunday,
  parseISO,
  isValid,
  differenceInCalendarDays,
  format,
} from 'date-fns';

/**
 * Date range mode keys used throughout the app.
 */
export const DATE_RANGE_MODES = {
  H24: '24h',
  H48: '48h',
  CURRENT_PERIOD: 'current_period',
};

/**
 * Resolve the "most recent Sunday at 00:00" anchor point.
 * If today IS Sunday, the period starts at today 00:00.
 */
export function getMostRecentSundayStart(now = new Date()) {
  if (isSunday(now)) {
    return startOfDay(now);
  }
  return startOfDay(previousSunday(now));
}

/**
 * Given a date range mode, return a { start, end } interval to filter records by.
 */
export function resolveDateRange(mode, now = new Date()) {
  switch (mode) {
    case DATE_RANGE_MODES.H24:
      return { start: subHours(now, 24), end: now };
    case DATE_RANGE_MODES.H48:
      return { start: subHours(now, 48), end: now };
    case DATE_RANGE_MODES.CURRENT_PERIOD:
    default:
      return { start: getMostRecentSundayStart(now), end: now };
  }
}

/**
 * Safely parse a wide variety of date string formats coming out of SAP-style
 * exports (YYYY-MM-DD, MM/DD/YYYY, DD.MM.YYYY, Excel serials already converted).
 */
export function safeParseDate(value) {
  if (value instanceof Date && isValid(value)) return value;
  if (value === null || value === undefined || value === '') return null;

  // Excel serial date number (e.g. 45123)
  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const ms = value * 24 * 60 * 60 * 1000;
    const d = new Date(excelEpoch.getTime() + ms);
    return isValid(d) ? d : null;
  }

  const str = String(value).trim();
  if (!str) return null;

  // ISO-ish first
  const iso = parseISO(str);
  if (isValid(iso)) return iso;

  // MM/DD/YYYY or M/D/YY
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    let [, m, d, y] = slashMatch;
    if (y.length === 2) y = `20${y}`;
    const parsed = new Date(Number(y), Number(m) - 1, Number(d));
    if (isValid(parsed)) return parsed;
  }

  // DD.MM.YYYY (common SAP format)
  const dotMatch = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (dotMatch) {
    let [, d, m, y] = dotMatch;
    if (y.length === 2) y = `20${y}`;
    const parsed = new Date(Number(y), Number(m) - 1, Number(d));
    if (isValid(parsed)) return parsed;
  }

  const fallback = new Date(str);
  return isValid(fallback) ? fallback : null;
}

/**
 * True if a given date value falls within the resolved range.
 */
export function isWithinDateRange(value, mode, now = new Date()) {
  const date = safeParseDate(value);
  if (!date) return false;
  const { start, end } = resolveDateRange(mode, now);
  try {
    return isWithinInterval(date, { start, end });
  } catch {
    return false;
  }
}

/**
 * Days remaining until a given date (negative = already past).
 */
export function daysUntil(value, now = new Date()) {
  const date = safeParseDate(value);
  if (!date) return null;
  return differenceInCalendarDays(startOfDay(date), startOfDay(now));
}

/**
 * Pretty "MMM d, yyyy" formatter, tolerant of bad input.
 */
export function formatDatePretty(value) {
  const date = safeParseDate(value);
  if (!date) return 'N/A';
  return format(date, 'MMM d, yyyy');
}

/**
 * "Late / Today / Upcoming" bucket classification used by Late Loads.
 */
export function classifyByDate(value, now = new Date()) {
  const diff = daysUntil(value, now);
  if (diff === null) return 'unknown';
  if (diff < 0) return 'late';
  if (diff === 0) return 'today';
  return 'future';
}

export function humanRangeLabel(mode) {
  switch (mode) {
    case DATE_RANGE_MODES.H24:
      return 'Last 24 Hours';
    case DATE_RANGE_MODES.H48:
      return 'Last 48 Hours';
    case DATE_RANGE_MODES.CURRENT_PERIOD:
    default:
      return 'Current Period';
  }
}
