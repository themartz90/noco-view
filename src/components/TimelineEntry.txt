'use client';

import { MoodEntry } from '@/types/mood';
import { format, parseISO } from 'date-fns';
import { Brain, Activity, BatteryLow, Moon, AlertCircle, Heart, Lightbulb, FileText, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface TimelineEntryProps {
  entry: MoodEntry;
}

export default function TimelineEntry({ entry }: TimelineEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse mood to determine color - Depression (red shades), Hypomania (blue shades)
  const getMoodScore = (mood: string): string => {
    if (mood.startsWith('-3')) return '-3';
    if (mood.startsWith('-2')) return '-2';
    if (mood.startsWith('-1')) return '-1';
    if (mood.startsWith('+3')) return '+3';
    if (mood.startsWith('+2')) return '+2';
    if (mood.startsWith('+1')) return '+1';
    return '0';
  };

  const getMoodPillColor = (mood: string) => {
    // Depression - red shades (darker = more severe)
    if (mood.startsWith('-3')) return 'bg-red-700 text-white';
    if (mood.startsWith('-2')) return 'bg-red-500 text-white';
    if (mood.startsWith('-1')) return 'bg-red-300 text-red-900';
    // Hypomania - blue shades (darker = more severe)
    if (mood.startsWith('+3')) return 'bg-blue-700 text-white';
    if (mood.startsWith('+2')) return 'bg-blue-500 text-white';
    if (mood.startsWith('+1')) return 'bg-blue-300 text-blue-900';
    return 'bg-gray-500 text-white';
  };

  const getMoodBorderColor = (mood: string) => {
    // Depression - red shades
    if (mood.startsWith('-3')) return 'border-l-red-700';
    if (mood.startsWith('-2')) return 'border-l-red-500';
    if (mood.startsWith('-1')) return 'border-l-red-300';
    // Hypomania - blue shades
    if (mood.startsWith('+3')) return 'border-l-blue-700';
    if (mood.startsWith('+2')) return 'border-l-blue-500';
    if (mood.startsWith('+1')) return 'border-l-blue-300';
    return 'border-l-gray-500';
  };

  const getMoodDotColor = (mood: string) => {
    // Depression - red shades
    if (mood.startsWith('-3')) return 'bg-red-700 border-red-800';
    if (mood.startsWith('-2')) return 'bg-red-500 border-red-600';
    if (mood.startsWith('-1')) return 'bg-red-300 border-red-400';
    // Hypomania - blue shades
    if (mood.startsWith('+3')) return 'bg-blue-700 border-blue-800';
    if (mood.startsWith('+2')) return 'bg-blue-500 border-blue-600';
    if (mood.startsWith('+1')) return 'bg-blue-300 border-blue-400';
    return 'bg-gray-500 border-gray-600';
  };

  // Extract just the description part from mood string
  const getMoodDescription = (mood: string): string => {
    const parts = mood.split(' ');
    return parts.slice(1).join(' ');
  };

  // Severity indicators - green to red
  const getEnergieColor = (energie: string) => {
    if (energie === 'Vysoká') return 'bg-green-500 text-white';
    if (energie === 'Střední') return 'bg-yellow-500 text-white';
    if (energie === 'Nízká') return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getUnavaColor = (unava: string) => {
    if (unava === 'Nízká') return 'bg-green-500 text-white';
    if (unava === 'Střední') return 'bg-yellow-500 text-white';
    if (unava === 'Silná') return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getStresColor = (stres: string | number) => {
    const stresNum = typeof stres === 'string' ? parseInt(stres) : stres;
    if (stresNum <= 2) return 'bg-green-500 text-white';
    if (stresNum === 3) return 'bg-yellow-500 text-white';
    if (stresNum >= 4) return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getPretizeniBgColor = (pretizeni: string) => {
    if (pretizeni.startsWith('0')) return 'bg-green-100 text-green-800 border-green-300';
    if (pretizeni.startsWith('1')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (pretizeni.startsWith('2')) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (pretizeni.startsWith('3')) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getPretizeniCircleColor = (pretizeni: string) => {
    if (pretizeni.startsWith('0')) return 'bg-green-500 text-white';
    if (pretizeni.startsWith('1')) return 'bg-yellow-500 text-white';
    if (pretizeni.startsWith('2')) return 'bg-orange-500 text-white';
    if (pretizeni.startsWith('3')) return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getPretizeniLevel = (pretizeni: string): string => {
    return pretizeni.charAt(0);
  };

  const getPretizeniDescription = (pretizeni: string): { main: string; detail: string } => {
    // Format: "1 - Mírné (lehce vnímám napětí nebo podráždění)" or "0 - Žádné"
    // First try with parentheses
    const matchWithDetail = pretizeni.match(/^\d+\s*-\s*([^(]+)\s*\(([^)]+)\)/);
    if (matchWithDetail) {
      return { main: matchWithDetail[1].trim(), detail: matchWithDetail[2].trim() };
    }

    // Try without parentheses (just "0 - Žádné")
    const matchSimple = pretizeni.match(/^\d+\s*-\s*(.+)$/);
    if (matchSimple) {
      return { main: matchSimple[1].trim(), detail: '' };
    }

    // Fallback - strip the number if it starts with a digit and dash
    const fallback = pretizeni.replace(/^\d+\s*-\s*/, '');
    return { main: fallback || pretizeni, detail: '' };
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'd. M. yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatDateDay = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      const days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
      return days[date.getDay()];
    } catch {
      return '';
    }
  };

  const hasExpandableContent = entry['Hypomanické příznaky'] || entry['Depresivní příznaky'] || entry['Co pomohlo?'];

  return (
    <div className="relative">
      {/* Timeline Dot - positioned on the spine */}
      <div className="absolute -left-[42px] top-5 z-10">
        <div className={`w-5 h-5 rounded-full border-4 ${getMoodDotColor(entry['Dominatní nálada'])} shadow-md`}></div>
      </div>

      <div className={`bg-white border-l-4 ${getMoodBorderColor(entry['Dominatní nálada'])} shadow-sm hover:shadow-lg transition-all rounded-xl ring-1 ring-gray-200 hover:ring-gray-300 cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Simplified Compact Row */}
        <div className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
          {/* Date */}
          <div className="flex-shrink-0 w-20">
            <div className="text-sm font-semibold text-gray-900">{formatDate(entry.Datum)}</div>
            <div className="text-xs text-gray-500">{formatDateDay(entry.Datum)}</div>
          </div>

          {/* DOMINANT Mood Score - Large Pill */}
          <div className="flex-shrink-0">
            <div className={`px-4 py-2 rounded-full text-2xl font-bold ${getMoodPillColor(entry['Dominatní nálada'])}`}>
              {getMoodScore(entry['Dominatní nálada'])}
            </div>
          </div>

          {/* Mood Description */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-medium text-gray-800">{getMoodDescription(entry['Dominatní nálada'])}</div>
          </div>

          {/* Critical Metrics - Subtle, Small */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span><span className="font-semibold">Energie:</span> {entry.Energie}</span>
            </div>
            <div className="flex items-center gap-1">
              <BatteryLow className="w-3.5 h-3.5" />
              <span><span className="font-semibold">Únava:</span> {entry.Únava}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span><span className="font-semibold">Stres:</span> {entry['Stres (1–5)']}</span>
            </div>
          </div>

          {/* Expand Arrow */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasExpandableContent && (
              isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )
            )}
          </div>
        </div>

      {/* Always Visible: Key Info */}
      {(entry.Přetížení || entry['Výrazný spouštěč dne'] || entry.Poznámka) && (
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 space-y-3 text-sm">
          {/* Přetížení - Redesigned with number circle */}
          {entry.Přetížení && (() => {
            const pretizeniDesc = getPretizeniDescription(entry.Přetížení);
            return (
              <div className="flex items-start gap-2.5 pl-1 border-l-2 border-purple-300 -ml-1">
                <Zap className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Přetížení:</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getPretizeniCircleColor(entry.Přetížení)}`}>
                    {getPretizeniLevel(entry.Přetížení)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">{pretizeniDesc.main}</span>
                    {pretizeniDesc.detail && (
                      <span className="text-gray-600 ml-1">({pretizeniDesc.detail})</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Spouštěč */}
          {entry['Výrazný spouštěč dne'] && (
            <div className="flex items-start gap-2.5 pl-1 border-l-2 border-orange-300 -ml-1">
              <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Spouštěč:</span>
                <p className="text-gray-700 mt-0.5">{entry['Výrazný spouštěč dne']}</p>
              </div>
            </div>
          )}

          {/* Poznámka */}
          {entry.Poznámka && (
            <div className="flex items-start gap-2.5 pl-1 border-l-2 border-blue-300 -ml-1">
              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Poznámka:</span>
                <p className="text-gray-700 mt-0.5">{entry.Poznámka}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-6 pb-4 pt-4 border-t border-gray-200 bg-white">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Detailní informace</h4>

          {/* Full Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Activity className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-600 font-medium">Energie</span>
              </div>
              <span className={`inline-block text-xs px-2 py-1 rounded font-medium ${getEnergieColor(entry.Energie)}`}>
                {entry.Energie}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <BatteryLow className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-600 font-medium">Únava</span>
              </div>
              <span className={`inline-block text-xs px-2 py-1 rounded font-medium ${getUnavaColor(entry.Únava)}`}>
                {entry.Únava}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <Moon className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-600 font-medium">Spánek</span>
              </div>
              <p className="text-sm text-gray-800 font-medium">{entry['Spánek (délka)']}h - {entry.Spánek}</p>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-600 font-medium">Stres</span>
              </div>
              <span className={`inline-block text-xs px-2 py-1 rounded font-medium ${getStresColor(entry['Stres (1–5)'])}`}>
                {entry['Stres (1–5)']}/5
              </span>
            </div>
          </div>

          {/* Symptoms Section */}
          {entry['Hypomanické příznaky'] && (
            <div className="mb-3">
              <div className="flex items-center mb-2">
                <Zap className="w-4 h-4 text-indigo-600 mr-2" />
                <h4 className="text-sm font-semibold text-gray-700">Hypomanické příznaky</h4>
              </div>
              <div className="flex flex-wrap gap-1">
                {entry['Hypomanické příznaky'].split(',').map((symptom, idx) => (
                  <span key={idx} className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                    {symptom.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry['Depresivní příznaky'] && (
            <div className="mb-3">
              <div className="flex items-center mb-2">
                <Heart className="w-4 h-4 text-blue-600 mr-2" />
                <h4 className="text-sm font-semibold text-gray-700">Depresivní příznaky</h4>
              </div>
              <div className="flex flex-wrap gap-1">
                {entry['Depresivní příznaky'].split(',').map((symptom, idx) => (
                  <span key={idx} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {symptom.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* What Helped */}
          {entry['Co pomohlo?'] && (
            <div className="mb-2">
              <div className="flex items-start">
                <Lightbulb className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-700">Co pomohlo</h4>
                  <p className="text-sm text-gray-600 mt-1">{entry['Co pomohlo?']}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
