import { MoodEntry } from '@/types/mood';
import { format, parseISO } from 'date-fns';
import { Brain, Activity, BatteryLow, Moon, AlertCircle, Heart, Lightbulb, FileText, Zap } from 'lucide-react';

interface MoodCardProps {
  entry: MoodEntry;
}

export default function MoodCard({ entry }: MoodCardProps) {
  // Parse mood to determine color
  const getMoodColor = (mood: string) => {
    if (mood.startsWith('-3')) return 'bg-red-100 border-red-300 text-red-900';
    if (mood.startsWith('-2')) return 'bg-orange-100 border-orange-300 text-orange-900';
    if (mood.startsWith('-1')) return 'bg-yellow-100 border-yellow-300 text-yellow-900';
    if (mood.startsWith('+1')) return 'bg-blue-100 border-blue-300 text-blue-900';
    if (mood.startsWith('+2')) return 'bg-indigo-100 border-indigo-300 text-indigo-900';
    if (mood.startsWith('+3')) return 'bg-purple-100 border-purple-300 text-purple-900';
    return 'bg-gray-100 border-gray-300 text-gray-900';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'd. M. yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Date and Mood Header */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 capitalize">
            {formatDate(entry.Datum)}
          </h3>
        </div>
        <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium border-2 ${getMoodColor(entry['Dominatní nálada'])}`}>
          <Brain className="inline w-4 h-4 mr-2" />
          {entry['Dominatní nálada']}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-xs text-gray-500">Energie</p>
            <p className="text-sm font-medium text-gray-800">{entry.Energie}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <BatteryLow className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-xs text-gray-500">Únava</p>
            <p className="text-sm font-medium text-gray-800">{entry.Únava}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Moon className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-xs text-gray-500">Spánek</p>
            <p className="text-sm font-medium text-gray-800">{entry['Spánek (délka)']}h - {entry.Spánek}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-xs text-gray-500">Stres</p>
            <p className="text-sm font-medium text-gray-800">{entry['Stres (1–5)']}/5</p>
          </div>
        </div>
      </div>

      {/* Symptoms Section */}
      {entry['Hypomanické příznaky'] && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Zap className="w-4 h-4 text-indigo-600 mr-2" />
            <h4 className="text-sm font-semibold text-gray-700">Hypomanické příznaky</h4>
          </div>
          <div className="text-sm text-gray-600 bg-indigo-50 p-3 rounded-md">
            {entry['Hypomanické příznaky'].split(',').map((symptom, idx) => (
              <span key={idx} className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded mr-2 mb-2 text-xs">
                {symptom.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {entry['Depresivní příznaky'] && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Heart className="w-4 h-4 text-blue-600 mr-2" />
            <h4 className="text-sm font-semibold text-gray-700">Depresivní příznaky</h4>
          </div>
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            {entry['Depresivní příznaky'].split(',').map((symptom, idx) => (
              <span key={idx} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2 text-xs">
                {symptom.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Triggers and Helps */}
      {entry['Výrazný spouštěč dne'] && (
        <div className="mb-3">
          <div className="flex items-start mb-1">
            <AlertCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Spouštěč</h4>
              <p className="text-sm text-gray-600 mt-1">{entry['Výrazný spouštěč dne']}</p>
            </div>
          </div>
        </div>
      )}

      {entry['Co pomohlo?'] && (
        <div className="mb-3">
          <div className="flex items-start mb-1">
            <Lightbulb className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Co pomohlo</h4>
              <p className="text-sm text-gray-600 mt-1">{entry['Co pomohlo?']}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {entry.Poznámka && (
        <div className="mb-3">
          <div className="flex items-start mb-1">
            <FileText className="w-4 h-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Poznámka</h4>
              <p className="text-sm text-gray-600 mt-1">{entry.Poznámka}</p>
            </div>
          </div>
        </div>
      )}

      {/* Overload Level */}
      {entry.Přetížení && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Přetížení</span>
            <span className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              {entry.Přetížení}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
