'use client';

import { useState, useEffect } from 'react';
import { MoodEntry, MoodApiResponse } from '@/types/mood';
import TimelineEntry from '@/components/TimelineEntry';
import KpiSummary from '@/components/KpiSummary';
import MoodChart from '@/components/MoodChart';
import AIAnalysis from '@/components/AIAnalysis';
import { Filter, Calendar, Loader2 } from 'lucide-react';
import { subMonths, isAfter, parseISO, isBefore } from 'date-fns';

type DateRange = '1month' | '2months' | '3months' | '6months' | '1year' | 'all';

export default function Home() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('3months');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMoodData();
  }, []);

  useEffect(() => {
    filterByDateRange();
  }, [dateRange, entries]);

  const fetchMoodData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/mood');

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst data');
      }

      const data: MoodApiResponse = await response.json();
      setEntries(data.list || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba');
    } finally {
      setLoading(false);
    }
  };

  const filterByDateRange = () => {
    if (dateRange === 'all') {
      setFilteredEntries(entries);
      return;
    }

    const now = new Date();
    let cutoffDate: Date;

    switch (dateRange) {
      case '1month':
        cutoffDate = subMonths(now, 1);
        break;
      case '2months':
        cutoffDate = subMonths(now, 2);
        break;
      case '3months':
        cutoffDate = subMonths(now, 3);
        break;
      case '6months':
        cutoffDate = subMonths(now, 6);
        break;
      case '1year':
        cutoffDate = subMonths(now, 12);
        break;
      default:
        cutoffDate = subMonths(now, 3);
    }

    const filtered = entries.filter((entry) => {
      try {
        const entryDate = parseISO(entry.Datum);
        return isAfter(entryDate, cutoffDate);
      } catch {
        return false;
      }
    });

    setFilteredEntries(filtered);
  };

  const getDateRangeLabel = (range: DateRange): string => {
    const labels: Record<DateRange, string> = {
      '1month': '1 měsíc',
      '2months': '2 měsíce',
      '3months': '3 měsíce',
      '6months': '6 měsíců',
      '1year': '1 rok',
      'all': 'Vše',
    };
    return labels[range];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="w-16 h-16" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-primary-600">Deník</span> nálad
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Bipolární porucha - Přehled záznamů
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Period Header */}
      {!loading && !error && filteredEntries.length > 0 && (
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Zobrazeno období: <span className="text-primary-600">{getDateRangeLabel(dateRange)}</span>
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  ({filteredEntries.length} záznamů)
                </p>
              </div>
              <a
                href="#entries"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Zobrazit záznamy
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Filtrovat podle období:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['1month', '2months', '3months', '6months', '1year', 'all'] as DateRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {getDateRangeLabel(range)}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* KPI Summary */}
      {!loading && !error && filteredEntries.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <KpiSummary entries={filteredEntries} />
        </div>
      )}

      {/* Mood Chart */}
      {!loading && !error && filteredEntries.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <MoodChart entries={filteredEntries} />
        </div>
      )}

      {/* AI Analysis */}
      {!loading && !error && entries.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <AIAnalysis entries={entries} />
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <span className="ml-3 text-gray-600">Načítám data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">Chyba při načítání dat</p>
            <p className="text-red-600 text-sm mt-2">{error}</p>
            <button
              onClick={fetchMoodData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Zkusit znovu
            </button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Žádné záznamy pro vybrané období</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto" id="entries">
            {/* Helper Text */}
            <div className="mb-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              💡 <span className="font-semibold text-lg">Tip:</span> Klikněte na jakýkoliv záznam pro zobrazení detailních informací
            </div>

            {/* Timeline Container with Spine */}
            <div className="relative pl-12">
              {/* Vertical Timeline Spine */}
              <div className="absolute left-[30px] top-0 bottom-0 w-1 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 rounded-full"></div>

              {/* Timeline Entries */}
              <div className="space-y-6">
                {filteredEntries.map((entry, index) => (
                  <div
                    key={`${entry.Datum}-${index}`}
                    id={`entry-${entry.Datum}`}
                    className={index % 2 === 0 ? '' : 'bg-slate-50/30 -mx-8 px-8 py-3 rounded-lg'}
                  >
                    <TimelineEntry entry={entry} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Deník nálad - Vizualizace pro psychiatrické konzultace
          </p>
        </div>
      </footer>
    </div>
  );
}
