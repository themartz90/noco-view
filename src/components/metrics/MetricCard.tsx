import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Color bar nahoře */}
      <div className={`h-1 -mx-4 -mt-4 mb-3 rounded-t-lg ${color}`} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        <Icon className="h-8 w-8 text-gray-400" />
      </div>

      {/* Trend arrow (optional) */}
      {trend && (
        <div className="mt-2">
          {trend === 'up' && <span className="text-green-600 text-xs">↑ Zlepšení</span>}
          {trend === 'down' && <span className="text-red-600 text-xs">↓ Zhoršení</span>}
          {trend === 'stable' && <span className="text-gray-600 text-xs">→ Stabilní</span>}
        </div>
      )}
    </div>
  );
}
