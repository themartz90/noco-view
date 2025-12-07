'use client';

import { TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';
import { Trigger, HelpedItem } from '@/types/aiAnalysis';

interface TriggersSectionProps {
  triggers: Trigger[];
  helped: HelpedItem[];
}

export default function TriggersSection({ triggers, helped }: TriggersSectionProps) {
  const getImpactColor = (score: number) => {
    if (score >= 8) return 'from-red-500 to-red-600';
    if (score >= 6) return 'from-orange-500 to-orange-600';
    if (score >= 4) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const formatChange = (value: number, type: 'mood' | 'stress') => {
    const icon = value > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
    const color = value > 0 ? 'text-red-600' : 'text-green-600';
    const prefix = value > 0 ? '+' : '';

    if (type === 'mood') {
      return (
        <span className={`flex items-center gap-1 ${color} text-xs font-semibold`}>
          {icon}
          {prefix}{value.toFixed(1)}
        </span>
      );
    } else {
      return (
        <span className={`flex items-center gap-1 ${color} text-xs font-semibold`}>
          {icon}
          {prefix}{value.toFixed(1)}
        </span>
      );
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-4">
      {/* Triggers - 2/3 width */}
      <div className="md:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-orange-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            HLAVNÍ SPOUŠTĚČE
          </h2>
        </div>

        {triggers && triggers.length > 0 ? (
          <div className="space-y-2">
            {triggers.map((trigger, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-2.5 hover:bg-gray-50 transition-colors"
              >
                {/* Header with icon and name */}
                <div className="flex items-start gap-2">
                  <span className="text-xl flex-shrink-0">{trigger.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900 uppercase text-xs">
                        {trigger.name}
                      </h3>
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {trigger.frequency}× za období
                      </span>
                    </div>

                    {/* Impact Meter */}
                    <div className="mb-1.5">
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-gray-600">Dopad:</span>
                        <span className="font-bold text-gray-900">{trigger.impact_score}/10</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getImpactColor(trigger.impact_score)} transition-all duration-500`}
                          style={{ width: `${(trigger.impact_score / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Changes */}
                    <div className="flex items-center gap-3 text-xs mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Δ nálada:</span>
                        {formatChange(trigger.mood_change, 'mood')}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Δ stres:</span>
                        {formatChange(trigger.stress_change, 'stress')}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">do</span>
                        <span className="font-semibold text-gray-900">{trigger.timeframe}</span>
                      </div>
                    </div>

                    {/* Examples */}
                    {trigger.examples && trigger.examples.length > 0 && (
                      <div className="text-xs text-gray-600 leading-snug">
                        <span className="font-medium">Typické: </span>
                        {trigger.examples.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-3">
            Nebyly identifikovány výrazné spouštěče v tomto období.
          </p>
        )}
      </div>

      {/* What Helped - 1/3 width */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">✓</span>
          <h2 className="text-base font-bold text-gray-900">
            CO POMÁHÁ
          </h2>
        </div>

        {helped && helped.length > 0 ? (
          <div className="space-y-1.5">
            {helped.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg"
              >
                <span className="text-xs text-gray-800">{item.label}</span>
                <span className="text-xs font-bold text-green-700">
                  {item.count}×
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-3">
            Žádné zaznamenané intervence.
          </p>
        )}
      </div>
    </div>
  );
}
