'use client';

import { MoodEntry } from '@/types/mood';
import { TrendingUp, Zap, AlertCircle, Moon } from 'lucide-react';

interface KpiSummaryProps {
  entries: MoodEntry[];
}

export default function KpiSummary({ entries }: KpiSummaryProps) {
  // Calculate KPIs
  const calculateAverageMood = (): string => {
    if (entries.length === 0) return '—';

    const moodValues = entries.map(entry => {
      const mood = entry['Dominatní nálada'];
      if (mood.startsWith('-3')) return -3;
      if (mood.startsWith('-2')) return -2;
      if (mood.startsWith('-1')) return -1;
      if (mood.startsWith('+3')) return 3;
      if (mood.startsWith('+2')) return 2;
      if (mood.startsWith('+1')) return 1;
      return 0;
    });

    const avg = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length;
    return avg.toFixed(1);
  };

  const calculateOverloadDays = (): number => {
    return entries.filter(entry => {
      const overload = entry.Přetížení;
      return overload && !overload.startsWith('0');
    }).length;
  };

  const calculateAverageStress = (): string => {
    if (entries.length === 0) return '—';

    const stressValues = entries.map(entry => {
      const stress = entry['Stres (1–5)'];
      return typeof stress === 'string' ? parseInt(stress) : stress;
    }).filter(val => !isNaN(val));

    if (stressValues.length === 0) return '—';

    const avg = stressValues.reduce((sum, val) => sum + val, 0) / stressValues.length;
    return avg.toFixed(1);
  };

  const calculateAverageSleep = (): string => {
    if (entries.length === 0) return '—';

    const sleepValues = entries.map(entry => {
      const sleep = entry['Spánek (délka)'];
      return typeof sleep === 'string' ? parseFloat(sleep) : sleep;
    }).filter(val => !isNaN(val));

    if (sleepValues.length === 0) return '—';

    const avg = sleepValues.reduce((sum, val) => sum + val, 0) / sleepValues.length;
    return avg.toFixed(1);
  };

  const avgMood = calculateAverageMood();
  const overloadDays = calculateOverloadDays();
  const avgStress = calculateAverageStress();
  const avgSleep = calculateAverageSleep();

  // Calculate average state with severity levels
  const calculateAverageState = (): { label: string; color: string } => {
    const mood = parseFloat(avgMood);
    if (isNaN(mood)) return { label: '—', color: 'text-gray-600 bg-gray-100' };

    // Depression levels
    if (mood <= -2) return { label: 'Těžká deprese', color: 'text-red-900 bg-red-200' };
    if (mood <= -1) return { label: 'Deprese', color: 'text-red-800 bg-red-100' };
    if (mood < 0) return { label: 'Lehká deprese', color: 'text-orange-800 bg-orange-100' };

    // Stable
    if (mood === 0) return { label: 'Stabilní', color: 'text-green-700 bg-green-100' };

    // Hypomania levels
    if (mood < 1) return { label: 'Lehká hypománie', color: 'text-blue-700 bg-blue-100' };
    if (mood < 2) return { label: 'Hypománie', color: 'text-blue-800 bg-blue-100' };
    return { label: 'Jasná hypománie', color: 'text-blue-900 bg-blue-200' };
  };

  const averageState = calculateAverageState();

  // Determine mood color for average
  const getMoodColor = (moodStr: string) => {
    const mood = parseFloat(moodStr);
    if (isNaN(mood)) return 'text-gray-600';
    if (mood <= -2) return 'text-red-600';
    if (mood <= -0.5) return 'text-orange-500';
    if (mood < 0.5) return 'text-gray-600';
    if (mood < 2) return 'text-blue-500';
    return 'text-blue-700';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Average State */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Průměrný stav</span>
          <TrendingUp className="w-4 h-4 text-gray-400" />
        </div>
        <div className={`inline-block px-3 py-1 rounded-full text-base font-bold ${averageState.color}`}>
          {averageState.label}
        </div>
        <div className="text-xs text-gray-500 mt-2">v tomto zobrazeném období</div>
      </div>

      {/* Average Mood */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Průměrná nálada</span>
          <TrendingUp className="w-4 h-4 text-gray-400" />
        </div>
        <div className={`text-3xl font-bold ${getMoodColor(avgMood)}`}>
          {avgMood !== '—' ? (parseFloat(avgMood) >= 0 ? '+' : '') + avgMood : avgMood}
        </div>
        <div className="text-xs text-gray-500 mt-1">škála -3 až +3</div>
      </div>

      {/* Days with Overload */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dny s přetížením</span>
          <Zap className="w-4 h-4 text-gray-400" />
        </div>
        <div className="text-3xl font-bold text-purple-600">
          {overloadDays}
        </div>
        <div className="text-xs text-gray-500 mt-1">z {entries.length} dní</div>
      </div>

      {/* Average Stress */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Průměrný stres</span>
          <AlertCircle className="w-4 h-4 text-gray-400" />
        </div>
        <div className={`text-3xl font-bold ${
          avgStress !== '—' && parseFloat(avgStress) >= 4 ? 'text-red-600' :
          avgStress !== '—' && parseFloat(avgStress) >= 3 ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {avgStress}
        </div>
        <div className="text-xs text-gray-500 mt-1">škála 1–5</div>
      </div>

      {/* Average Sleep */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Průměrný spánek</span>
          <Moon className="w-4 h-4 text-gray-400" />
        </div>
        <div className={`text-3xl font-bold ${
          avgSleep !== '—' && parseFloat(avgSleep) < 6 ? 'text-red-600' :
          avgSleep !== '—' && parseFloat(avgSleep) > 9 ? 'text-orange-500' :
          'text-blue-600'
        }`}>
          {avgSleep !== '—' ? avgSleep + 'h' : avgSleep}
        </div>
        <div className="text-xs text-gray-500 mt-1">hodin denně</div>
      </div>
    </div>
  );
}
