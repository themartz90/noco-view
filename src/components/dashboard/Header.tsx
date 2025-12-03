import { Brain } from 'lucide-react';

interface HeaderProps {
  totalEntries: number;
  dateRangeLabel: string;
}

export default function Header({ totalEntries, dateRangeLabel }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Deník nálad
              </h1>
              <p className="text-sm text-gray-600">
                Bipolární porucha II - Klinický přehled
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="text-right">
            <p className="text-sm text-gray-600">Zobrazeno období</p>
            <p className="text-lg font-semibold text-gray-900">
              {dateRangeLabel} <span className="text-sm text-gray-500">({totalEntries} záznamů)</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
