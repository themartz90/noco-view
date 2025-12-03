export default function MoodChartTooltip({ active, payload }: any) {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  const entry = data.entry;

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-xs">
      <p className="font-semibold text-gray-900 mb-2">
        {entry.dateLabel} ({entry.dateString})
      </p>

      <div className="space-y-1 text-sm">
        <p className="flex items-center gap-2">
          <span className="font-medium">Nálada:</span>
          <span className={`px-2 py-0.5 rounded ${entry.moodColor}`}>
            {entry.moodEmoji} {entry.mood} ({entry.moodLabel})
          </span>
        </p>

        <p>
          <span className="font-medium">Přetížení:</span> {entry.overloadDisplay} {entry.overloadLabel}
        </p>

        <p>
          <span className="font-medium">Energie:</span> {entry.energy}
        </p>

        <p>
          <span className="font-medium">Stres:</span> {entry.stress}/5
        </p>

        <p>
          <span className="font-medium">Spánek:</span> {entry.sleepHours}h ({entry.sleepQuality})
        </p>

        {entry.trigger && (
          <p className="text-amber-700 mt-2">
            ⚠️ <span className="font-medium">Spouštěč:</span> {entry.trigger.substring(0, 50)}...
          </p>
        )}
      </div>
    </div>
  );
}
