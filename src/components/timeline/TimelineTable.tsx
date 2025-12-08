'use client';

import { useState } from 'react';
import { ProcessedMoodEntry } from '@/types/mood';
import TimelineRow from './TimelineRow';

interface TimelineTableProps {
  entries: ProcessedMoodEntry[];
}

export default function TimelineTable({ entries }: TimelineTableProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const toggleRow = (dateString: string) => {
    setExpandedDate(prev => prev === dateString ? null : dateString);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Záznamy</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase" style={{ width: '12%' }}>Datum</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase" style={{ width: '10%' }}>Nálada</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase" style={{ width: '14%' }}>Přetížení</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase" style={{ width: '12%' }}>Spánek</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase" style={{ width: '10%' }}>Stres</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase" style={{ width: '14%' }}>Příznaky</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase" style={{ width: '28%' }}>Spouštěč</th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry, index) => (
              <TimelineRow
                key={entry.dateString}
                entry={entry}
                isExpanded={expandedDate === entry.dateString}
                onToggle={() => toggleRow(entry.dateString)}
                isEven={index % 2 === 0}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
