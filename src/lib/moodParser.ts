import { MoodEntry, ProcessedMoodEntry } from '@/types/mood';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

export function parseMoodValue(moodString: string | undefined | null): number {
  // "-3 (Těžká deprese)" → -3, "+3 (Jasná hypománie)" → +3
  if (!moodString) return 0;
  const match = moodString.match(/^([+-]?\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export function getMoodLabel(mood: number): string {
  const labels = {
    '-3': 'Těžká deprese',
    '-2': 'Deprese',
    '-1': 'Lehká deprese',
    '0': 'Stabilní',
    '1': 'Lehká hypománie',
    '2': 'Hypománie',
    '3': 'Výrazná hypománie',
  };
  return labels[mood.toString() as keyof typeof labels] || 'Neznámý';
}

export function getMoodColor(mood: number): string {
  // Gradient červená → zelená → modrá
  if (mood <= -3) return 'bg-red-900 text-white';
  if (mood === -2) return 'bg-red-700 text-white';
  if (mood === -1) return 'bg-red-400 text-white';
  if (mood === 0) return 'bg-green-600 text-white';
  if (mood === 1) return 'bg-blue-400 text-white';
  if (mood === 2) return 'bg-blue-700 text-white';
  if (mood >= 3) return 'bg-blue-900 text-white';
  return 'bg-gray-500 text-white';
}

export function getMoodEmoji(mood: number): string {
  if (mood <= -2) return '😞';
  if (mood === -1) return '😕';
  if (mood === 0) return '😐';
  if (mood === 1) return '🙂';
  if (mood >= 2) return '😄';
  return '🤷';
}

export function getOverloadValue(overloadString: string | undefined | null): number {
  // "0 - Žádné" → 0, "3 - Silné" → 3
  if (!overloadString) return 0;
  const match = overloadString.match(/^(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export function getOverloadDisplay(overload: number): string {
  const displays = ['░', '█', '██', '███'];
  return displays[overload] || '░';
}

export function formatDateLabel(date: Date): string {
  return format(date, 'd. MMM', { locale: cs });
}

export function parseSymptoms(symptomsString: string | undefined | null): string[] {
  if (!symptomsString) return [];
  return symptomsString.split(',').map(s => s.trim()).filter(Boolean);
}

export function parseMoodEntry(entry: MoodEntry): ProcessedMoodEntry {
  const date = new Date(entry.Datum);
  const moodString = entry['Dominatní nálada'];
  const mood = parseMoodValue(moodString);

  // Debug: log if mood parsing fails
  if (mood === 0 && moodString && !moodString.includes('0')) {
    console.warn(`[MoodParser] Failed to parse mood for ${entry.Datum}:`, moodString);
  }

  const overload = getOverloadValue(entry.Přetížení);
  const hypomanicSymptoms = parseSymptoms(entry['Hypomanické příznaky']);
  const depressiveSymptoms = parseSymptoms(entry['Depresivní příznaky']);

  // Parse stress as number (API returns it as string "4" not number 4)
  const stressValue = entry['Stres (1–5)'];
  const stress = typeof stressValue === 'string' ? parseInt(stressValue) : stressValue;

  return {
    id: entry.Id,
    date,
    dateString: entry.Datum,
    dateLabel: formatDateLabel(date),

    mood,
    moodLabel: getMoodLabel(mood),
    moodColor: getMoodColor(mood),
    moodEmoji: getMoodEmoji(mood),

    energy: entry.Energie,
    fatigue: entry.Únava,
    sleepHours: entry['Spánek (délka)'],
    sleepQuality: entry.Spánek,
    stress,
    overload,
    overloadLabel: entry.Přetížení,
    overloadDisplay: getOverloadDisplay(overload),

    hypomanicSymptoms,
    depressiveSymptoms,
    hasMixedState: hypomanicSymptoms.length > 0 && depressiveSymptoms.length > 0,

    trigger: entry['Výrazný spouštěč dne'],
    whatHelped: entry['Co pomohlo?'],
    note: entry.Poznámka,
  };
}

export function parseAllEntries(entries: MoodEntry[]): ProcessedMoodEntry[] {
  return entries.map(parseMoodEntry);
}
