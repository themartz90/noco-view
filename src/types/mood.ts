// Raw data z NocoDB API
export interface MoodEntry {
  Id: number;
  Datum: string; // YYYY-MM-DD
  'Dominatní nálada': string; // "-3 (Těžká deprese)" až "+3 (Výrazná hypománie)"
  Energie: 'Nízká' | 'Střední' | 'Vysoká';
  Únava: 'Nízká' | 'Střední' | 'Silná';
  'Spánek (délka)': number; // hodiny
  Spánek: 'Špatný' | 'Průměrný' | 'Dobrý';
  'Stres (1–5)': number | string; // API vrací jako string "4", ne number 4
  Přetížení: string; // "0 - Žádné" až "3 - Silné"
  'Hypomanické příznaky': string; // comma-separated
  'Depresivní příznaky': string; // comma-separated
  'Výrazný spouštěč dne': string | null;
  'Co pomohlo?': string | null;
  Poznámka: string | null;
}

// Zpracovaná data pro UI
export interface ProcessedMoodEntry {
  id: number;
  date: Date;
  dateString: string; // ISO format
  dateLabel: string; // "1. led"

  // Nálada
  mood: number; // -3 až +3
  moodLabel: string; // "Těžká deprese" až "Výrazná hypománie"
  moodColor: string; // Tailwind color class
  moodEmoji: string; // 😞 😕 😐 🙂 😄

  // Metriky
  energy: 'Nízká' | 'Střední' | 'Vysoká';
  fatigue: 'Nízká' | 'Střední' | 'Silná';
  sleepHours: number;
  sleepQuality: 'Špatný' | 'Průměrný' | 'Dobrý';
  stress: number; // 1-5
  overload: number; // 0-3
  overloadLabel: string;
  overloadDisplay: string; // "░ █ ██ ███"

  // Příznaky
  hypomanicSymptoms: string[];
  depressiveSymptoms: string[];
  hasMixedState: boolean; // Oba typy příznaků současně

  // Poznámky
  trigger: string | null;
  whatHelped: string | null;
  note: string | null;
}

// KPI metriky pro dashboard
export interface MoodMetrics {
  dominantState: 'Deprese' | 'Stabilní' | 'Hypománie' | 'Smíšené';
  dominantStateColor: string;

  stabilityScore: number; // 0-100
  stabilityLabel: 'Nízká' | 'Střední' | 'Vysoká';

  crisisDays: number; // |mood| >= 2
  crisisDaysPercent: number;

  avgStress: number; // 1-5, zaokrouhleno na 1 desetinné
  stressColor: string;

  avgSleepHours: number;
  sleepOutliers: number; // dny s <5h nebo >10h
  sleepColor: string;
}

// Data pro Recharts
export interface MoodChartDataPoint {
  date: string; // ISO
  dateLabel: string; // "1. led"
  mood: number;
  overload: number;
  color: string;
}

// Období pro filtrování
export type DateRangeType = '1month' | '2months' | '3months' | '6months' | '1year' | 'all';

export interface DateRangeOption {
  key: DateRangeType;
  label: string;
  months: number | null; // null = all
}

// API Response (zpětná kompatibilita)
export interface MoodApiResponse {
  list: MoodEntry[];
  pageInfo: {
    totalRows?: number;
    page?: number;
    pageSize?: number;
    isFirstPage?: boolean;
    isLastPage?: boolean;
  };
}
