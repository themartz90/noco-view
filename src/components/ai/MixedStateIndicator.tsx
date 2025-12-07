'use client';

import { Zap } from 'lucide-react';
import { MixedStatesAnalysis } from '@/types/aiAnalysis';

interface MixedStateIndicatorProps {
  mixedStates: MixedStatesAnalysis;
}

export default function MixedStateIndicator({ mixedStates }: MixedStateIndicatorProps) {
  if (!mixedStates || mixedStates.frequency_percent === 0) {
    return null;
  }

  const barWidthPercent = Math.min(mixedStates.frequency_percent, 100);

  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-amber-500 rounded-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-amber-900">
          SMÍŠENÉ STAVY
        </h2>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-gray-700">Frekvence</span>
          <span className="text-xl font-bold text-amber-700">
            {mixedStates.frequency_percent}% dní
          </span>
        </div>
        <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${barWidthPercent}%` }}
          >
            {barWidthPercent > 20 && (
              <span className="text-xs font-bold text-white">
                {mixedStates.days_count}/{mixedStates.total_days} dní
              </span>
            )}
          </div>
        </div>
        {barWidthPercent <= 20 && (
          <div className="text-xs text-gray-600 mt-1 text-right">
            {mixedStates.days_count}/{mixedStates.total_days} dní
          </div>
        )}
      </div>

      {/* Top Combinations - Inline Tags */}
      {mixedStates.top_combinations && mixedStates.top_combinations.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-900 mb-2">
            Nejčastější kombinace:
          </h3>
          <div className="flex flex-wrap gap-2">
            {mixedStates.top_combinations.map((combo, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg"
              >
                <span className="flex-shrink-0 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-xs text-gray-800">{combo.combination}</span>
                <span className="text-xs font-bold text-amber-700">
                  ({combo.count}×)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Note */}
      <div className="mt-3 p-2 bg-amber-100/50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-900 leading-snug">
          ⚠️ <strong>Klinický význam:</strong> Smíšené stavy jsou klíčovým markerem BP II
          a vyžadují specifický terapeutický přístup.
        </p>
      </div>
    </div>
  );
}
