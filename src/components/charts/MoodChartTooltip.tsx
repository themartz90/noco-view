export default function MoodChartTooltip({ active, payload }: any) {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  const entry = data.entry;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4 max-w-sm">
      <p className="font-bold text-gray-900 mb-3 text-base border-b border-gray-200 pb-2">
        {entry.dateLabel}
      </p>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Nálada:</span>
          <span className={`px-3 py-1 rounded-md text-sm font-semibold ${entry.moodColor}`}>
            {entry.mood} ({entry.moodLabel})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Přetížení:</span>
          <span className="text-gray-900">{entry.overload}/3</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Energie:</span>
          <span className="text-gray-900">{entry.energy}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Stres:</span>
          <span className="text-gray-900">{entry.stress}/5</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Spánek:</span>
          <span className="text-gray-900">{entry.sleepHours}h ({entry.sleepQuality})</span>
        </div>

        {entry.trigger && (
          <div className="text-amber-700 mt-3 pt-2 border-t border-amber-200">
            <span className="font-medium">⚠ Spouštěč:</span>
            <p className="text-xs mt-1 text-gray-700">{entry.trigger.substring(0, 60)}...</p>
          </div>
        )}
      </div>
    </div>
  );
}
