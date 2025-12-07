// AI Analysis Types - Opus Strategy for BP II Clinical Dashboard

export interface CriticalWarning {
  priority: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  metric: string; // e.g., "45% dní"
}

export interface MixedStateCombination {
  combination: string; // e.g., "Zrychlené myšlení + Silná únava"
  count: number;
}

export interface MixedStatesAnalysis {
  frequency_percent: number;
  days_count: number;
  total_days: number;
  top_combinations: MixedStateCombination[];
}

export interface Trigger {
  name: string;
  icon: string; // Emoji icon
  frequency: number; // Number of occurrences
  impact_score: number; // 1-10 scale
  mood_change: number; // Average change (e.g., -1.2)
  stress_change: number; // Average change (e.g., +0.8)
  timeframe: '24h' | '48h' | '72h';
  examples: string[]; // Specific examples from data
}

export interface HelpedItem {
  label: string;
  count: number;
}

export interface MoodMetrics {
  avg: number;
  min: number;
  max: number;
  'days_ge_+2': number;
  'days_le_-2': number;
  longest_streak_nonzero: number;
}

export interface SleepMetrics {
  avg_h: number;
  outliers_lt5: number;
  outliers_gt9_10: number;
  quality_mode: string;
}

export interface StressMetrics {
  avg_1_5: number;
  days_ge4: number;
}

export interface OverloadMetrics {
  avg_0_3: number;
}

export interface Symptom {
  label: string;
  count: number;
}

export interface AIAnalysisResponse {
  period: {
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD
    coverage_days: number;
    total_days: number;
  };
  critical_warnings: CriticalWarning[];
  mixed_states: MixedStatesAnalysis;
  triggers: Trigger[];
  helped_top: HelpedItem[];
  metrics: {
    mood: MoodMetrics;
    sleep: SleepMetrics;
    stress: StressMetrics;
    overload: OverloadMetrics;
  };
  symptoms: {
    hypomanic_top: Symptom[];
    depressive_top: Symptom[];
  };
}
