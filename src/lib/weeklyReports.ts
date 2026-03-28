import { Transaction } from '@/types/bizplus';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** Monday 00:00 of the week containing `date` (local time). */
export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Sales + expenses per weekday label for the current week (Mon–Sun). */
export function getCurrentWeekBuckets(transactions: Transaction[]): {
  day: string;
  sales: number;
  expenses: number;
}[] {
  const monday = startOfWeekMonday(new Date());
  const buckets = DAY_LABELS.map((label, i) => {
    const dayStart = new Date(monday);
    dayStart.setDate(monday.getDate() + i);
    return { label, dayStart, sales: 0, expenses: 0 };
  });

  for (const t of transactions) {
    const txnDate = new Date(t.date);
    const idx = buckets.findIndex((b) => sameCalendarDay(txnDate, b.dayStart));
    if (idx === -1) continue;
    if (t.type === 'income') buckets[idx].sales += t.amount;
    else buckets[idx].expenses += t.amount;
  }

  return buckets.map(({ label, sales, expenses }) => ({
    day: label,
    sales,
    expenses,
  }));
}

export function countDistinctIncomeDays(transactions: Transaction[]): number {
  const keys = new Set<string>();
  for (const t of transactions) {
    if (t.type !== 'income') continue;
    const d = new Date(t.date);
    d.setHours(0, 0, 0, 0);
    keys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  return keys.size;
}

/** Need more than one day of sales to infer a simple forecast. */
export function canShowSalesForecast(transactions: Transaction[]): boolean {
  return countDistinctIncomeDays(transactions) >= 2;
}

export type ForecastTrend = 'up' | 'down' | 'stable';

export function computeSalesForecastFromTransactions(transactions: Transaction[]): {
  predictedMin: number;
  predictedMax: number;
  trend: ForecastTrend;
  busyDays: string[];
  slowDays: string[];
} {
  const buckets = getCurrentWeekBuckets(transactions);
  const dailySales = buckets.map((b) => b.sales);
  const withIdx = buckets.map((b, i) => ({ day: b.day, sales: b.sales, i }));
  const nonZero = dailySales.filter((s) => s > 0);
  const avg =
    nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
  const predictedMin = Math.max(0, Math.floor(avg * 0.85));
  const predictedMax = Math.max(predictedMin, Math.ceil(avg * 1.15));

  const sorted = [...withIdx].sort((a, b) => b.sales - a.sales);
  const busyDays = sorted.slice(0, 2).map((x) => x.day);
  const slow = [...withIdx].sort((a, b) => a.sales - b.sales);
  const slowDays = slow.slice(0, 2).map((x) => x.day);

  const mid = Math.floor(buckets.length / 2);
  const firstHalf = buckets.slice(0, mid).reduce((s, b) => s + b.sales, 0);
  const secondHalf = buckets.slice(mid).reduce((s, b) => s + b.sales, 0);
  let trend: ForecastTrend = 'stable';
  if (secondHalf > firstHalf * 1.08) trend = 'up';
  else if (secondHalf < firstHalf * 0.92 && firstHalf > 0) trend = 'down';

  return { predictedMin, predictedMax, trend, busyDays, slowDays };
}

export function hasAnyTransactionData(transactions: Transaction[]): boolean {
  return transactions.length > 0;
}

/** Transactions whose date falls in the current calendar week (Mon–Sun, local time). */
export function getTransactionsThisWeek(transactions: Transaction[]): Transaction[] {
  const monday = startOfWeekMonday(new Date());
  const end = new Date(monday);
  end.setDate(monday.getDate() + 7);
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= monday && d < end;
  });
}

export type ExpenseCategoryRow = {
  name: string;
  amount: number;
};

export function getTopExpenseCategoriesThisWeek(
  transactions: Transaction[],
  limit = 5
): ExpenseCategoryRow[] {
  const monday = startOfWeekMonday(new Date());
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const d = new Date(t.date);
    if (d < monday || d > sunday) continue;
    const name = (t.category && t.category.trim()) || 'Other';
    map.set(name, (map.get(name) ?? 0) + t.amount);
  }

  return [...map.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}
