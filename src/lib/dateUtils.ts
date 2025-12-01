import { DateRangeType, DateRangeOption, ProcessedMoodEntry } from '@/types/mood';
import { subMonths, isAfter } from 'date-fns';

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { key: '1month', label: '1 měsíc', months: 1 },
  { key: '2months', label: '2 měsíce', months: 2 },
  { key: '3months', label: '3 měsíce', months: 3 },
  { key: '6months', label: '6 měsíců', months: 6 },
  { key: '1year', label: '1 rok', months: 12 },
  { key: 'all', label: 'Vše', months: null },
];

export function getDateRangeLabel(range: DateRangeType): string {
  return DATE_RANGE_OPTIONS.find(opt => opt.key === range)?.label || 'Vše';
}

export function filterByDateRange(
  entries: ProcessedMoodEntry[],
  range: DateRangeType
): ProcessedMoodEntry[] {
  const option = DATE_RANGE_OPTIONS.find(opt => opt.key === range);

  if (!option || option.months === null) {
    return entries; // Vše
  }

  const cutoffDate = subMonths(new Date(), option.months);
  return entries.filter(entry => isAfter(entry.date, cutoffDate));
}
