'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/dashboard/Header';
import PeriodSelector from '@/components/dashboard/PeriodSelector';
import MetricsGrid from '@/components/metrics/MetricsGrid';
import MoodChart from '@/components/charts/MoodChart';
import TimelineTable from '@/components/timeline/TimelineTable';
import { MoodEntry, DateRangeType } from '@/types/mood';
import { parseAllEntries } from '@/lib/moodParser';
import { calculateMoodMetrics } from '@/lib/moodMetrics';
import { filterByDateRange, getDateRangeLabel } from '@/lib/dateUtils';

export default function HomePage() {
  const [rawEntries, setRawEntries] = useState<MoodEntry[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeType>('3months');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/mood?limit=1000&sort=-Datum');

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        setRawEntries(data.list || []);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Nepodařilo se načíst data. Zkuste prosím obnovit stránku.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Computed values
  const processedEntries = useMemo(() => {
    return parseAllEntries(rawEntries);
  }, [rawEntries]);

  const filteredEntries = useMemo(() => {
    return filterByDateRange(processedEntries, dateRange);
  }, [processedEntries, dateRange]);

  const metrics = useMemo(() => {
    return calculateMoodMetrics(filteredEntries);
  }, [filteredEntries]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Načítání dat...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Obnovit stránku
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        totalEntries={filteredEntries.length}
        dateRangeLabel={getDateRangeLabel(dateRange)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Period selector */}
        <PeriodSelector
          selectedRange={dateRange}
          onChange={setDateRange}
        />

        {/* Klinický přehled */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Klinický přehled</h2>
          <MetricsGrid metrics={metrics} />
        </section>

        {/* Mood chart */}
        <section>
          <MoodChart entries={filteredEntries} />
        </section>

        {/* Timeline */}
        <section>
          <TimelineTable entries={filteredEntries} />
        </section>

        {/* AI Placeholder (Fáze 3) */}
        <section className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50/50">
          <p className="text-blue-700 font-medium">
            🤖 AI Klinická analýza (připravujeme ve Fázi 3)
          </p>
          <p className="text-blue-600 text-sm mt-2">
            Red flags panel, smíšené stavy, spouštěče, body k diskuzi
          </p>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-600">
          Deník nálad v2.0.0 | Bipolární porucha II
        </div>
      </footer>
    </div>
  );
}
