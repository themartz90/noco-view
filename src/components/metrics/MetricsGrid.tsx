import { Activity, TrendingUp, AlertTriangle, Brain, Moon } from 'lucide-react';
import MetricCard from './MetricCard';
import { MoodMetrics } from '@/types/mood';

interface MetricsGridProps {
  metrics: MoodMetrics;
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Dominantní stav */}
      <MetricCard
        title="Dominantní stav"
        value={metrics.dominantState}
        icon={Activity}
        color={metrics.dominantStateColor}
      />

      {/* 2. Stabilita */}
      <MetricCard
        title="Stabilita"
        value={`${metrics.stabilityScore}%`}
        subtitle={metrics.stabilityLabel}
        icon={TrendingUp}
        color={
          metrics.stabilityScore > 70
            ? 'bg-green-600'
            : metrics.stabilityScore > 40
            ? 'bg-orange-500'
            : 'bg-red-600'
        }
      />

      {/* 3. Významné epizody */}
      <MetricCard
        title="Významné epizody"
        value={metrics.crisisDays}
        subtitle={`${metrics.crisisDaysPercent}% období`}
        icon={AlertTriangle}
        color={
          metrics.crisisDaysPercent > 30
            ? 'bg-red-600'
            : metrics.crisisDaysPercent > 15
            ? 'bg-orange-500'
            : 'bg-green-600'
        }
      />

      {/* 4. Průměrný stres */}
      <MetricCard
        title="Průměrný stres"
        value={`${metrics.avgStress}/5`}
        icon={Brain}
        color={metrics.stressColor}
      />

      {/* 5. Spánek */}
      <MetricCard
        title="Spánek"
        value={`${metrics.avgSleepHours}h`}
        subtitle={`${metrics.sleepOutliers} outlierů`}
        icon={Moon}
        color={metrics.sleepColor}
      />
    </div>
  );
}
