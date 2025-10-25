// Transform NocoDB mood entries to AI analysis format
import { format, parseISO } from 'date-fns';

interface MoodEntry {
  Datum: string;
  'Dominatní nálada': string;
  Energie: string;
  Únava: string;
  'Spánek (délka)': number | string;
  Spánek: string;
  'Stres (1–5)': number | string;
  'Hypomanické příznaky': string | null;
  'Depresivní příznaky': string | null;
  'Výrazný spouštěč dne': string | null;
  'Co pomohlo?': string | null;
  Poznámka: string | null;
  Přetížení: string;
}

interface AIDataEntry {
  date: string;
  mood_num: number;
  mood_label: string;
  energy: string;
  fatigue: string;
  sleep_hours: number | null;
  sleep_quality: string;
  stress_1_5: number;
  overload_0_3: number;
  hypo_symptoms: string[];
  dep_symptoms: string[];
  trigger: string;
  helped: string;
  note: string;
}

export function transformForAI(entries: MoodEntry[]): AIDataEntry[] {
  return entries.map(entry => {
    // Parse mood number from "Dominatní nálada" (e.g., "-2 - Deprese" -> -2)
    const moodMatch = entry['Dominatní nálada'].match(/^(-?\d+)/);
    const moodNum = moodMatch ? parseInt(moodMatch[1], 10) : 0;

    // Parse sleep hours
    let sleepHours: number | null = null;
    if (entry['Spánek (délka)']) {
      const parsed = typeof entry['Spánek (délka)'] === 'number'
        ? entry['Spánek (délka)']
        : parseFloat(entry['Spánek (délka)'] as string);
      sleepHours = isNaN(parsed) ? null : parsed;
    }

    // Parse stress level
    const stress = typeof entry['Stres (1–5)'] === 'number'
      ? entry['Stres (1–5)']
      : parseInt(entry['Stres (1–5)'] as string, 10);

    // Parse overload level from "Přetížení" (e.g., "2 - Významné" -> 2)
    const overloadMatch = entry.Přetížení.match(/^(\d+)/);
    const overload = overloadMatch ? parseInt(overloadMatch[1], 10) : 0;

    // Parse symptoms into arrays
    const hypoSymptoms = entry['Hypomanické příznaky']
      ? entry['Hypomanické příznaky'].split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const depSymptoms = entry['Depresivní příznaky']
      ? entry['Depresivní příznaky'].split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    return {
      date: entry.Datum,
      mood_num: moodNum,
      mood_label: entry['Dominatní nálada'],
      energy: entry.Energie,
      fatigue: entry.Únava,
      sleep_hours: sleepHours,
      sleep_quality: entry.Spánek,
      stress_1_5: isNaN(stress) ? 0 : stress,
      overload_0_3: overload,
      hypo_symptoms: hypoSymptoms,
      dep_symptoms: depSymptoms,
      trigger: entry['Výrazný spouštěč dne'] || '',
      helped: entry['Co pomohlo?'] || '',
      note: entry.Poznámka || '',
    };
  });
}

export function getLastThreeMonths(entries: MoodEntry[]): MoodEntry[] {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  return entries.filter(entry => {
    try {
      const entryDate = parseISO(entry.Datum);
      return entryDate >= threeMonthsAgo;
    } catch {
      return false;
    }
  });
}

export function formatPeriodForDisplay(entries: MoodEntry[]): string {
  if (entries.length === 0) return 'Žádná data';

  const dates = entries.map(e => parseISO(e.Datum)).sort((a, b) => a.getTime() - b.getTime());
  const from = format(dates[0], 'd. M. yyyy');
  const to = format(dates[dates.length - 1], 'd. M. yyyy');

  return `${from} – ${to}`;
}
