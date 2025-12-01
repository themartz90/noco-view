import { ProcessedMoodEntry, MoodMetrics } from '@/types/mood';

export function calculateMoodMetrics(entries: ProcessedMoodEntry[]): MoodMetrics {
  if (entries.length === 0) {
    return {
      dominantState: 'Stabilní',
      dominantStateColor: 'bg-green-600',
      stabilityScore: 0,
      stabilityLabel: 'Nízká',
      crisisDays: 0,
      crisisDaysPercent: 0,
      avgStress: 0,
      stressColor: 'bg-gray-400',
      avgSleepHours: 0,
      sleepOutliers: 0,
      sleepColor: 'bg-gray-400',
    };
  }

  // Průměrná nálada
  const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;

  // Dominantní stav
  const mixedDays = entries.filter(e => e.hasMixedState).length;
  const mixedPercent = (mixedDays / entries.length) * 100;

  let dominantState: MoodMetrics['dominantState'];
  let dominantStateColor: string;

  if (mixedPercent > 30) {
    dominantState = 'Smíšené';
    dominantStateColor = 'bg-amber-600';
  } else if (avgMood < -0.5) {
    dominantState = 'Deprese';
    dominantStateColor = 'bg-red-700';
  } else if (avgMood > 0.5) {
    dominantState = 'Hypománie';
    dominantStateColor = 'bg-blue-700';
  } else {
    dominantState = 'Stabilní';
    dominantStateColor = 'bg-green-600';
  }

  // Stabilita (počet změn >2 body)
  let largeChanges = 0;
  for (let i = 1; i < entries.length; i++) {
    if (Math.abs(entries[i].mood - entries[i-1].mood) >= 2) {
      largeChanges++;
    }
  }
  const stabilityScore = Math.max(0, 100 - (largeChanges / entries.length) * 100);
  const stabilityLabel = stabilityScore > 70 ? 'Vysoká' : stabilityScore > 40 ? 'Střední' : 'Nízká';

  // Dny v krizi
  const crisisDays = entries.filter(e => Math.abs(e.mood) >= 2).length;
  const crisisDaysPercent = (crisisDays / entries.length) * 100;

  // Průměrný stres
  const avgStress = entries.reduce((sum, e) => sum + e.stress, 0) / entries.length;
  const stressColor = avgStress > 3.5 ? 'bg-red-600' : avgStress > 2.5 ? 'bg-orange-500' : 'bg-green-600';

  // Spánek
  const avgSleepHours = entries.reduce((sum, e) => sum + e.sleepHours, 0) / entries.length;
  const sleepOutliers = entries.filter(e => e.sleepHours < 5 || e.sleepHours > 10).length;
  const sleepColor = sleepOutliers > entries.length * 0.2 ? 'bg-red-600' : 'bg-green-600';

  return {
    dominantState,
    dominantStateColor,
    stabilityScore: Math.round(stabilityScore),
    stabilityLabel,
    crisisDays,
    crisisDaysPercent: Math.round(crisisDaysPercent),
    avgStress: Math.round(avgStress * 10) / 10,
    stressColor,
    avgSleepHours: Math.round(avgSleepHours * 10) / 10,
    sleepOutliers,
    sleepColor,
  };
}
