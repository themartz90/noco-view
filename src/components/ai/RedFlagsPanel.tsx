'use client';

import { AlertCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { CriticalWarning } from '@/types/aiAnalysis';

interface RedFlagsPanelProps {
  warnings: CriticalWarning[];
}

export default function RedFlagsPanel({ warnings }: RedFlagsPanelProps) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟠';
      case 'info':
        return '🔵';
      default:
        return '⚪';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-orange-50 border-orange-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-gradient-to-r from-red-400 to-red-600';
      case 'medium':
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
      case 'info':
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  // Extract percentage from metric string (e.g., "80% dní" -> 80)
  const extractPercentage = (metric: string): number => {
    const match = metric.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
  };

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-red-600 rounded-lg">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-red-900">
          🚨 UPOZORNĚNÍ PRO TOTO OBDOBÍ
        </h2>
      </div>

      {/* Grid layout for multiple warnings */}
      <div className={`grid gap-2 ${warnings.length > 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {warnings.map((warning, index) => {
          const percentage = extractPercentage(warning.metric);

          return (
            <div
              key={index}
              className={`group relative p-2.5 rounded-lg border ${getPriorityBg(warning.priority)} hover:shadow-md transition-all cursor-help`}
            >
              {/* Tooltip on hover */}
              <div className="invisible group-hover:visible absolute bottom-full left-0 right-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="leading-relaxed">{warning.description}</p>
                <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
              </div>

              {/* Line 1: Priority + Title + Metric + Info icon */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-base flex-shrink-0">{getPriorityEmoji(warning.priority)}</span>
                  <span className="font-bold text-sm text-gray-900 truncate">
                    {warning.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-xs font-bold text-gray-700">
                    {warning.metric}
                  </span>
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              {/* Line 2: Progress bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(warning.priority)} transition-all duration-500`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
