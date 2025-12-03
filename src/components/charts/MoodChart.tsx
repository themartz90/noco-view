'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ProcessedMoodEntry } from '@/types/mood';
import { getMoodColor } from '@/lib/moodParser';
import MoodChartTooltip from './MoodChartTooltip';

interface MoodChartProps {
  entries: ProcessedMoodEntry[];
}

export default function MoodChart({ entries }: MoodChartProps) {
  // Příprava dat pro Recharts (reverse = oldest first)
  const chartData = [...entries]
    .reverse()
    .map(entry => ({
      date: entry.dateString,
      dateLabel: entry.dateLabel,
      mood: entry.mood,
      overload: entry.overload,
      entry, // Celý entry pro tooltip
    }));

  // Custom dot - velikost dle overload
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const radius = 3 + payload.overload * 1.5; // 3-7.5px
    const color = getMoodColor(payload.mood).replace('bg-', '').replace(' text-white', '');

    // Tailwind to hex (aproximace)
    const colorMap: { [key: string]: string } = {
      'red-900': '#7f1d1d',
      'red-700': '#b91c1c',
      'red-400': '#f87171',
      'green-600': '#16a34a',
      'blue-400': '#60a5fa',
      'blue-700': '#1d4ed8',
      'blue-900': '#1e3a8a',
      'gray-500': '#6b7280',
    };

    const hexColor = colorMap[color] || '#6b7280';

    return (
      <circle cx={cx} cy={cy} r={radius} fill={hexColor} stroke="white" strokeWidth={1} />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Vývoj nálady
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="dateLabel"
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            domain={[-3, 3]}
            ticks={[-3, -2, -1, 0, 1, 2, 3]}
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />

          {/* Reference lines */}
          <ReferenceLine y={0} stroke="#16a34a" strokeWidth={2} strokeDasharray="5 5" />
          <ReferenceLine y={-2} stroke="#b91c1c" strokeDasharray="3 3" />
          <ReferenceLine y={2} stroke="#1d4ed8" strokeDasharray="3 3" />

          <Tooltip content={<MoodChartTooltip />} />

          <Line
            type="monotone"
            dataKey="mood"
            stroke="#0891b2"
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-700 rounded-full" />
          <span>Deprese</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded-full" />
          <span>Stabilní</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-700 rounded-full" />
          <span>Hypománie</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Velikost:</span>
          <div className="w-3 h-3 bg-gray-400 rounded-full" />
          <span>Přetížení</span>
        </div>
      </div>
    </div>
  );
}
