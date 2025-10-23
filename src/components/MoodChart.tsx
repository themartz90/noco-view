'use client';

import { MoodEntry } from '@/types/mood';
import { parseISO, format } from 'date-fns';

interface MoodChartProps {
  entries: MoodEntry[];
}

export default function MoodChart({ entries }: MoodChartProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Žádná data pro zobrazení grafu
      </div>
    );
  }

  // Function to scroll to specific entry
  const scrollToEntry = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const element = document.getElementById(`entry-${dateStr}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight effect
      element.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2');
      }, 2000);
    }
  };

  // Parse mood values and sort by date (oldest first for chart)
  const sortedEntries = [...entries].sort((a, b) => {
    return parseISO(a.Datum).getTime() - parseISO(b.Datum).getTime();
  });

  const getMoodValue = (mood: string): number => {
    if (mood.startsWith('-3')) return -3;
    if (mood.startsWith('-2')) return -2;
    if (mood.startsWith('-1')) return -1;
    if (mood.startsWith('+3')) return 3;
    if (mood.startsWith('+2')) return 2;
    if (mood.startsWith('+1')) return 1;
    return 0;
  };

  const dataPoints = sortedEntries.map(entry => ({
    date: parseISO(entry.Datum),
    mood: getMoodValue(entry['Dominatní nálada']),
  }));

  // Chart dimensions
  const width = 1000;
  const height = 300;
  const padding = { top: 20, right: 40, bottom: 60, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale functions
  const xScale = (index: number) => {
    return padding.left + (index / (dataPoints.length - 1)) * chartWidth;
  };

  const yScale = (value: number) => {
    // Map -3 to +3 onto chart height
    const normalized = (value + 3) / 6; // 0 to 1
    return padding.top + chartHeight - (normalized * chartHeight);
  };

  // Create path for line
  const linePath = dataPoints.map((point, index) => {
    const x = xScale(index);
    const y = yScale(point.mood);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Create area fill path (for gradient effect)
  const areaPath = dataPoints.map((point, index) => {
    const x = xScale(index);
    const y = yScale(point.mood);
    if (index === 0) return `M ${x} ${y}`;
    return `L ${x} ${y}`;
  }).join(' ') + ` L ${xScale(dataPoints.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;

  // Y-axis labels
  const yLabels = [3, 2, 1, 0, -1, -2, -3];

  // X-axis labels (show every nth entry based on total count)
  const getXLabels = () => {
    if (dataPoints.length <= 7) return dataPoints;
    const step = Math.ceil(dataPoints.length / 7);
    return dataPoints.filter((_, index) => index % step === 0 || index === dataPoints.length - 1);
  };

  const xLabels = getXLabels();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Vývoj nálady v čase</h3>
        <p className="text-sm text-gray-500 mt-1">
          Průběh dominantní nálady za vybrané období • <span className="font-bold text-lg text-primary-600">Klikněte na bod pro přechod na záznam</span>
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span>Průběh nálady</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600"></div>
          <span>Těžká deprese (-3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span>Jasná hypománie (+3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Stabilní (0)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minWidth: '600px' }}
        >
          {/* Grid lines */}
          {yLabels.map(value => (
            <g key={value}>
              <line
                x1={padding.left}
                y1={yScale(value)}
                x2={width - padding.right}
                y2={yScale(value)}
                stroke={value === 0 ? '#9ca3af' : '#e5e7eb'}
                strokeWidth={value === 0 ? 2 : 1}
                strokeDasharray={value === 0 ? '0' : '4 4'}
              />
            </g>
          ))}

          {/* Y-axis labels */}
          {yLabels.map(value => (
            <text
              key={value}
              x={padding.left - 10}
              y={yScale(value)}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-xs fill-gray-600"
            >
              {value > 0 ? '+' : ''}{value}
            </text>
          ))}

          {/* Area fill with gradient */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d={areaPath}
            fill="url(#areaGradient)"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {dataPoints.map((point, index) => {
            const x = xScale(index);
            const y = yScale(point.mood);

            // Only highlight severe cases and stable days
            const isSevereDepression = point.mood === -3;
            const isSevereHypomania = point.mood === 3;
            const isStable = point.mood === 0;

            // Determine color and size based on mood
            let color = '#cbd5e1'; // light gray for normal days
            let radius = 4;
            let strokeWidth = 2;

            if (isSevereDepression) {
              color = '#dc2626'; // red-600
              radius = 7;
              strokeWidth = 3;
            } else if (isSevereHypomania) {
              color = '#2563eb'; // blue-600
              radius = 7;
              strokeWidth = 3;
            } else if (isStable) {
              color = '#22c55e'; // green-500
              radius = 6;
              strokeWidth = 3;
            } else if (point.mood < 0) {
              color = '#f87171'; // red-400 for mild depression
            } else if (point.mood > 0) {
              color = '#60a5fa'; // blue-400 for mild hypomania
            }

            return (
              <g
                key={index}
                onClick={() => scrollToEntry(point.date)}
                style={{ cursor: 'pointer' }}
                className="transition-opacity hover:opacity-80"
              >
                {/* Main point */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill="white"
                  stroke={color}
                  strokeWidth={strokeWidth}
                />

                {/* Highlight ring for severe cases */}
                {(isSevereDepression || isSevereHypomania) && (
                  <circle
                    cx={x}
                    cy={y}
                    r={radius + 4}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity="0.3"
                  />
                )}

                {/* Invisible larger hit area for easier clicking */}
                <circle
                  cx={x}
                  cy={y}
                  r={Math.max(radius + 8, 12)}
                  fill="transparent"
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          {xLabels.map((point, index) => {
            const originalIndex = dataPoints.indexOf(point);
            const x = xScale(originalIndex);
            return (
              <text
                key={index}
                x={x}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                className="text-[11px] fill-gray-600"
              >
                {format(point.date, 'd.M.')}
              </text>
            );
          })}

          {/* Axis labels */}
          <text
            x={padding.left - 35}
            y={height / 2}
            textAnchor="middle"
            className="text-xs fill-gray-700 font-semibold"
            transform={`rotate(-90 ${padding.left - 35} ${height / 2})`}
          >
            Nálada
          </text>

          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-xs fill-gray-700 font-semibold"
          >
            Datum
          </text>
        </svg>
      </div>
    </div>
  );
}
