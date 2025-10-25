'use client';

import { useState, useEffect } from 'react';
import { Brain, Loader2, AlertCircle, Sparkles, Activity, TrendingUp, Shield, MessageSquare, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface AIAnalysisProps {
  entries: any[]; // MoodEntry[] from parent
}

interface AnalysisCache {
  timestamp: number;
  periodKey: string;
  analysis: any;
  usage: any;
}

type SectionKey = 'overview' | 'events' | 'safety' | 'discussion';

// Utility to safely display numeric values
const safeNum = (val: any, fallback: string = 'N/A'): string => {
  if (val === null || val === undefined || val === 'NaN' || (typeof val === 'number' && isNaN(val))) {
    return fallback;
  }
  return String(val);
};

export default function AIAnalysis({ entries }: AIAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(new Set(['overview']));

  // Generate cache key based on period (last 3 months of current entries)
  const generateCacheKey = () => {
    if (entries.length === 0) return '';
    const dates = entries.map(e => e.Datum).sort();
    return `${dates[0]}_${dates[dates.length - 1]}_${entries.length}`;
  };

  // Load analysis from NocoDB on mount
  useEffect(() => {
    const cacheKey = generateCacheKey();
    if (!cacheKey) return;

    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/ai-analysis?period_key=${encodeURIComponent(cacheKey)}`);
        if (!response.ok) {
          console.error('Failed to fetch analysis');
          return;
        }

        const data = await response.json();
        if (data.found) {
          setAnalysis(data.analysis);
          setUsage(data.usage);
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
          const saveResponse = await fetch('/api/ai-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              period_key: generateCacheKey(),
              analysis: result.analysis,
              usage: result.usage,
            }),
          });

          if (!saveResponse.ok) {
            console.error('Failed to save analysis to NocoDB');
          }
        } catch (saveErr) {
          console.error('Error saving to NocoDB:', saveErr);
          // Don't fail the whole operation if save fails
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
    // Just clear local state - NocoDB keeps history
    // Running analysis again will create a new record
    setAnalysis(null);
    setUsage(null);
  };

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              AI Klinický souhrn
            </h2>
            <p className="text-sm text-gray-600">
              Analýza posledních 3 měsíců pomocí GPT-4.1 Mini
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

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Chyba při analýze</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {analysis && (
        <div className="space-y-3">
          {/* Metadata Header */}
          {usage && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-gray-700">
                    <strong className="text-purple-700">{analysis.period?.from}</strong> – <strong className="text-purple-700">{analysis.period?.to}</strong>
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
            </div>
          )}

          {/* Accordion Sections */}
          <div className="space-y-3">
            {/* Overview Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('overview')}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Klíčové metriky a příznaky</h3>
                </div>
                {expandedSections.has('overview') ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {expandedSections.has('overview') && (
                <div className="p-4 bg-white space-y-4">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-700">{safeNum(analysis.metrics?.mood?.['days_ge_+2'], '0')}</div>
                      <div className="text-xs text-gray-600 mt-1">Hypománie (≥+2)</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-700">{safeNum(analysis.metrics?.mood?.['days_le_-2'], '0')}</div>
                      <div className="text-xs text-gray-600 mt-1">Deprese (≤-2)</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-700">{safeNum(analysis.metrics?.mood?.longest_streak_nonzero, '0')}</div>
                      <div className="text-xs text-gray-600 mt-1">Max streak (dny)</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-700">{safeNum(analysis.metrics?.sleep?.outliers_lt5, '0')}</div>
                      <div className="text-xs text-gray-600 mt-1">Spánek &lt;5h</div>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-indigo-700">{safeNum(analysis.metrics?.sleep?.outliers_gt9_10, '0')}</div>
                      <div className="text-xs text-gray-600 mt-1">Spánek &gt;9h</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-700">{safeNum(analysis.metrics?.stress?.days_ge4, '0')}</div>
                      <div className="text-xs text-gray-600 mt-1">Vysoký stres (≥4)</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-amber-700">{safeNum(analysis.metrics?.overload?.avg_0_3, '0')}</div>
                      <div className="text-xs text-gray-600 mt-1">Průměr přetížení</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-slate-700">{safeNum(analysis.metrics?.sleep?.quality_mode, 'N/A')}</div>
                      <div className="text-xs text-gray-600 mt-1">Kvalita spánku</div>
                    </div>
                  </div>

                  {/* Symptoms Section */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Příznaky</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="text-xs font-bold text-purple-900 mb-2">Hypomanické (top)</div>
                        <ul className="space-y-1 text-xs text-gray-700">
                          {analysis.symptoms?.hypomanic_top?.map((s: any, i: number) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-purple-600 text-xs">•</span>
                              <span>{s.label} <strong className="text-purple-700">({s.count})</strong></span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                        <div className="text-xs font-bold text-pink-900 mb-2">Depresivní (top)</div>
                        <ul className="space-y-1 text-xs text-gray-700">
                          {analysis.symptoms?.depressive_top?.map((s: any, i: number) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-pink-600 text-xs">•</span>
                              <span>{s.label} <strong className="text-pink-700">({s.count})</strong></span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {analysis.symptoms?.mixed_features?.present && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="text-xs font-bold text-amber-900 mb-1">Smíšené rysy</div>
                        <p className="text-xs text-amber-800">{analysis.symptoms.mixed_features.note}</p>
                      </div>
                    )}
                  </div>

                  {/* What Helped Section */}
                  {analysis.helped_top && analysis.helped_top.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Co pomohlo</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.helped_top.map((h: any, i: number) => (
                          <div key={i} className="bg-green-50 border border-green-200 rounded px-3 py-1.5">
                            <span className="text-xs text-gray-700">
                              {h.label} <strong className="text-green-700">({h.count})</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Events Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('events')}
                className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-gray-900">Události a vzorce</h3>
                </div>
                {expandedSections.has('events') ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {expandedSections.has('events') && (
                <div className="p-4 bg-white space-y-2">
                  {analysis.events
                    ?.filter((e: any) => e.count > 0)
                    .map((event: any, i: number) => (
                      <div key={i} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-semibold text-orange-900 text-sm capitalize">
                              {event.category.replace(/_/g, ' ')}
                            </div>
                            <p className="text-xs text-gray-700 mt-1">
                              <strong className="text-orange-700">{event.count}×</strong> •
                              do 24–72h: <span className="text-gray-800">{event.post_24_72h_trend}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Safety Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('safety')}
                className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-gray-900">Bezpečnost / Red flags</h3>
                </div>
                {expandedSections.has('safety') ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {expandedSections.has('safety') && (
                <div className="p-4 bg-white space-y-2">
                  {analysis.red_flags?.map((flag: string, i: number) => (
                    <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-800">{flag}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discussion Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('discussion')}
                className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900">Body k diskuzi na kontrole</h3>
                </div>
                {expandedSections.has('discussion') ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {expandedSections.has('discussion') && (
                <div className="p-4 bg-white space-y-2">
                  {analysis.discussion_points?.map((point: string, i: number) => (
                    <div key={i} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <p className="text-xs text-gray-800 flex-1">{point}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!analysis && !error && !loading && (
        <div className="text-center py-8 text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">
            Klikněte na „Spustit analýzu" pro generování klinického souhrnu
          </p>
          <p className="text-xs mt-1 text-gray-400">
            Analýza je manuální a výsledek se ukládá do cache
          </p>
        </div>
      )}
    </div>
  );
}
