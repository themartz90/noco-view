'use client';

import { useState, useEffect } from 'react';
import { Brain, Loader2, AlertCircle, Sparkles, Calendar, Activity } from 'lucide-react';
import RedFlagsPanel from './ai/RedFlagsPanel';
import MixedStateIndicator from './ai/MixedStateIndicator';
import TriggersSection from './ai/TriggersSection';
import { AIAnalysisResponse } from '@/types/aiAnalysis';

interface AIAnalysisProps {
  entries: any[]; // MoodEntry[] from parent
}

export default function AIAnalysisNew({ entries }: AIAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const [cacheInfo, setCacheInfo] = useState<{ key: string; fuzzyMatched: boolean } | null>(null);

  // Generate cache key based on period (last 3 months of current entries)
  const generateCacheKey = async () => {
    if (entries.length === 0) return '';

    const { getLastThreeMonths } = await import('@/lib/aiTransformer');
    const threeMonthEntries = getLastThreeMonths(entries);

    if (threeMonthEntries.length === 0) return '';

    const dates = threeMonthEntries.map(e => e.Datum).sort();
    return `${dates[0]}_${dates[dates.length - 1]}_${threeMonthEntries.length}`;
  };

  // Load analysis from NocoDB on mount
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const cacheKey = await generateCacheKey();
        if (!cacheKey) return;

        // Try exact match first
        let response = await fetch(`/api/ai-analysis?period_key=${encodeURIComponent(cacheKey)}`);
        if (!response.ok) {
          console.error('Failed to fetch analysis');
          return;
        }

        let data = await response.json();

        // If not found, try fuzzy matching (±5 days tolerance)
        if (!data.found) {
          response = await fetch(`/api/ai-analysis?period_key=${encodeURIComponent(cacheKey)}&fuzzy=true`);
          if (response.ok) {
            data = await response.json();
          }
        }

        if (data.found) {
          setAnalysis(data.analysis);
          setUsage(data.usage);
          setCacheInfo({
            key: data.cache_key || cacheKey,
            fuzzyMatched: data.fuzzy_matched || false,
          });
        }
      } catch (err) {
        console.error('Failed to load analysis from NocoDB:', err);
      }
    };

    fetchAnalysis();
  }, [entries]);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // Transform entries to AI format
      const { transformForAI, getLastThreeMonths } = await import('@/lib/aiTransformer');

      const threeMonthEntries = getLastThreeMonths(entries);

      if (threeMonthEntries.length === 0) {
        setError('Není dostatek dat za poslední 3 měsíce');
        setLoading(false);
        return;
      }

      const aiData = transformForAI(threeMonthEntries);

      // Call API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: aiData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze');
      }

      const result = await response.json();

      if (result.success) {
        setAnalysis(result.analysis);
        setUsage(result.usage);

        // Save to NocoDB for cross-device access
        try {
          const cacheKey = await generateCacheKey();
          const saveResponse = await fetch('/api/ai-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              period_key: cacheKey,
              analysis: result.analysis,
              usage: result.usage,
            }),
          });

          if (saveResponse.ok) {
            setCacheInfo({
              key: cacheKey,
              fuzzyMatched: false,
            });
          } else {
            console.error('Failed to save analysis to NocoDB');
          }
        } catch (saveErr) {
          console.error('Error saving to NocoDB:', saveErr);
        }
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Nepodařilo se provést analýzu');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    setAnalysis(null);
    setUsage(null);
    setCacheInfo(null);
  };

  // Format date range for display (Czech format: d.M.-d.M.)
  const formatDateRange = (cacheKey: string) => {
    const match = cacheKey.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{4})-(\d{2})-(\d{2})_(\d+)$/);
    if (!match) return '';

    const [, y1, m1, d1, y2, m2, d2] = match;
    const start = `${parseInt(d1)}.${parseInt(m1)}.`;
    const end = `${parseInt(d2)}.${parseInt(m2)}.`;

    return `${start}–${end}`;
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                AI Klinická Analýza
              </h2>
              <p className="text-sm text-gray-600">
                Specializovaná analýza pro bipolární poruchu II pomocí GPT-4.1 Mini
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {analysis && (
              <button
                onClick={clearCache}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Vymazat cache
              </button>
            )}
            <button
              onClick={runAnalysis}
              disabled={loading || entries.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Zpracovávám...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {analysis ? 'Znovu analyzovat' : 'Spustit analýzu'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metadata */}
        {usage && analysis && cacheInfo && (
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-gray-700">
                    Období: <strong className="text-purple-700">{formatDateRange(cacheInfo.key)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-gray-700">
                    <strong className="text-blue-700">{analysis.period?.coverage_days}/{analysis.period?.total_days}</strong> dní
                  </span>
                </div>
                <div className="text-gray-500">
                  {usage.total_tokens} tokenů
                </div>
              </div>
              {cacheInfo.fuzzyMatched && (
                <div className="text-xs text-orange-600 font-medium">
                  📌 Zobrazena uložená analýza
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Chyba při analýze</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !error && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">
              Klikněte na „Spustit analýzu" pro generování klinického souhrnu podle Opus strategie
            </p>
            <p className="text-xs mt-1 text-gray-400">
              Analýza zahrnuje: Kritická upozornění • Smíšené stavy • Spouštěče • Body k diskuzi
            </p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Critical Warnings */}
          {analysis.critical_warnings && analysis.critical_warnings.length > 0 && (
            <RedFlagsPanel warnings={analysis.critical_warnings} />
          )}

          {/* Mixed States */}
          {analysis.mixed_states && analysis.mixed_states.frequency_percent > 0 && (
            <MixedStateIndicator mixedStates={analysis.mixed_states} />
          )}

          {/* Triggers and What Helped */}
          <TriggersSection
            triggers={analysis.triggers || []}
            helped={analysis.helped_top || []}
          />
        </div>
      )}
    </div>
  );
}
