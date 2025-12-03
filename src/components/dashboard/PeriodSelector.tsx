'use client';

import { Calendar } from 'lucide-react';
import { DateRangeType } from '@/types/mood';
import { DATE_RANGE_OPTIONS } from '@/lib/dateUtils';

interface PeriodSelectorProps {
  selectedRange: DateRangeType;
  onChange: (range: DateRangeType) => void;
}

export default function PeriodSelector({ selectedRange, onChange }: PeriodSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Období</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {DATE_RANGE_OPTIONS.map(option => (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${selectedRange === option.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
