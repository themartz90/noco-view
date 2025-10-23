export interface MoodEntry {
  Datum: string; // Date
  'Dominatní nálada': string; // Dominant mood
  Energie: string; // Energy level
  Únava: string; // Fatigue
  'Spánek (délka)': number | string; // Sleep duration
  Spánek: string; // Sleep quality
  'Stres (1–5)': number | string; // Stress level (API returns string)
  'Hypomanické příznaky': string | null; // Hypomanic symptoms
  'Depresivní příznaky': string | null; // Depressive symptoms
  'Výrazný spouštěč dne': string | null; // Significant trigger
  'Co pomohlo?': string | null; // What helped
  Poznámka: string | null; // Note
  Přetížení: string; // Overload
}

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
