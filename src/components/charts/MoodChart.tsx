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

  // Handler pro kliknutí na bod v grafu
  const handleDotClick = (data: any) => {
    if (data && data.entry) {
      const element = document.getElementById(`entry-${data.entry.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Prominent highlight with smooth transition
        const originalBg = element.style.backgroundColor;
        element.style.transition = 'background-color 0.3s ease';
        element.style.backgroundColor = '#a5f3fc'; // cyan-200

        setTimeout(() => {
          element.style.backgroundColor = originalBg;
          setTimeout(() => {
            element.style.transition = '';
            element.style.backgroundColor = '';
          }, 300);
        }, 2000);
      }
    }
  };

  // Custom dot - velikost dle overload
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const radius = 4 + payload.overload * 1.5; // 4-8.5px
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
      <g onClick={() => handleDotClick(payload)} style={{ cursor: 'pointer' }}>
        {/* Invisible larger click target */}
        <circle
          cx={cx}
          cy={cy}
          r={12}
          fill="transparent"
          style={{ pointerEvents: 'all' }}
        />
        {/* Visible dot */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={hexColor}
          stroke="white"
          strokeWidth={1}
          className="hover:opacity-80 transition-opacity"
          style={{ pointerEvents: 'none' }}
        />
      </g>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Vývoj nálady
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" style={{ pointerEvents: 'none' }} />

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
          <ReferenceLine y={0} stroke="#16a34a" strokeWidth={2} strokeDasharray="5 5" style={{ pointerEvents: 'none' }} />
          <ReferenceLine y={-2} stroke="#b91c1c" strokeDasharray="3 3" style={{ pointerEvents: 'none' }} />
          <ReferenceLine y={2} stroke="#1d4ed8" strokeDasharray="3 3" style={{ pointerEvents: 'none' }} />

          <Tooltip
            content={<MoodChartTooltip />}
            cursor={false}
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="mood"
            stroke="#0891b2"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legenda */}
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-700 rounded-full" />
            <span className="font-medium">Deprese</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded-full" />
            <span className="font-medium">Stabilní</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-700 rounded-full" />
            <span className="font-medium">Hypománie</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="font-medium">Velikost bodu = přetížení:</span>
          <div className="flex items-center gap-2">
            <svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#6b7280" /></svg>
            <span>0</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="14" height="14"><circle cx="7" cy="7" r="5.5" fill="#6b7280" /></svg>
            <span>1</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="16"><circle cx="8" cy="8" r="7" fill="#6b7280" /></svg>
            <span>2</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="18" height="18"><circle cx="9" cy="9" r="8.5" fill="#6b7280" /></svg>
            <span>3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
