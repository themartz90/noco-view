import { ChevronDown, ChevronRight, Moon, Brain, Activity, AlertCircle } from 'lucide-react';
import { ProcessedMoodEntry } from '@/types/mood';

interface TimelineRowProps {
  entry: ProcessedMoodEntry;
  isExpanded: boolean;
  onToggle: () => void;
  isEven: boolean;
}

export default function TimelineRow({ entry, isExpanded, onToggle, isEven }: TimelineRowProps) {
  return (
    <>
      {/* Main row */}
      <tr
        onClick={onToggle}
        className={`
          cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100
          ${isEven ? 'bg-white' : 'bg-gray-50/50'}
        `}
      >
        {/* Datum */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            <span className="font-medium text-gray-900">{entry.dateLabel}</span>
          </div>
        </td>

        {/* Nálada */}
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${entry.moodColor}`}>
            {entry.moodEmoji} {entry.mood}
          </span>
        </td>

        {/* Přetížení */}
        <td className="px-4 py-3">
          <span className="font-mono text-lg">{entry.overloadDisplay}</span>
        </td>

        {/* Spánek */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <Moon className={`h-4 w-4 ${
              entry.sleepHours < 5 ? 'text-red-600' :
              entry.sleepHours > 10 ? 'text-orange-600' :
              'text-gray-600'
            }`} />
            <span className="text-sm">{entry.sleepHours}h</span>
          </div>
        </td>

        {/* Stres */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <Brain className={`h-4 w-4 ${
              entry.stress > 3 ? 'text-red-600' :
              entry.stress > 2 ? 'text-orange-600' :
              'text-gray-600'
            }`} />
            <span className="text-sm">{entry.stress}/5</span>
          </div>
        </td>

        {/* Příznaky */}
        <td className="px-4 py-3">
          <Activity className={`h-4 w-4 ${entry.hasMixedState ? 'text-amber-600' : 'text-gray-400'}`} />
        </td>

        {/* Spouštěč */}
        <td className="px-4 py-3">
          {entry.trigger ? (
            <AlertCircle className="h-4 w-4 text-amber-600" />
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
      </tr>

      {/* Expanded detail row */}
      {isExpanded && (
        <tr className="bg-blue-50/50 border-b border-gray-100">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* Left column */}
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Energie:</span>
                  <span className="ml-2 text-gray-900">{entry.energy}</span>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Únava:</span>
                  <span className="ml-2 text-gray-900">{entry.fatigue}</span>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Kvalita spánku:</span>
                  <span className="ml-2 text-gray-900">{entry.sleepQuality}</span>
                </div>

                {entry.hypomanicSymptoms.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-700">Hypomanické:</span>
                    <ul className="ml-4 mt-1 space-y-0.5">
                      {entry.hypomanicSymptoms.map((symptom, i) => (
                        <li key={i} className="text-gray-700 text-xs">• {symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {entry.depressiveSymptoms.length > 0 && (
                  <div>
                    <span className="font-medium text-red-700">Depresivní:</span>
                    <ul className="ml-4 mt-1 space-y-0.5">
                      {entry.depressiveSymptoms.map((symptom, i) => (
                        <li key={i} className="text-gray-700 text-xs">• {symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-2">
                {entry.trigger && (
                  <div>
                    <span className="font-medium text-amber-700">Spouštěč:</span>
                    <p className="mt-1 text-gray-900">{entry.trigger}</p>
                  </div>
                )}

                {entry.whatHelped && (
                  <div>
                    <span className="font-medium text-green-700">Co pomohlo:</span>
                    <p className="mt-1 text-gray-900">{entry.whatHelped}</p>
                  </div>
                )}

                {entry.note && (
                  <div>
                    <span className="font-medium text-gray-700">Poznámka:</span>
                    <p className="mt-1 text-gray-900">{entry.note}</p>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
