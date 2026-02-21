import { ArrowUpRight, ArrowDownRight, Minus, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface SalaryAnalysis {
  salaryRange: { min: number; median: number; max: number; currency: string };
  percentile: { '25th': number; '50th': number; '75th': number; '90th': number };
  factors: Array<{ name: string; impact: string; description: string }>;
  benefits: { common: string[]; premium: string[] };
  negotiationTips: string[];
  marketOutlook: string;
  competitorSalaries: Array<{ company: string; range: string }>;
  offerAnalysis?: { comparison: string; percentileRank: number; recommendation: string };
}

interface SalaryResultsDisplayProps {
  analysis: SalaryAnalysis;
  formatCurrency: (amount: number) => string;
}

export default function SalaryResultsDisplay({ analysis, formatCurrency }: SalaryResultsDisplayProps) {
  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Salary Range</h3>
          <div className="relative h-8 bg-slate-200 dark:bg-zinc-700 rounded-full mb-6">
            <div className="absolute top-full mt-1 text-xs text-slate-500" style={{ left: '0%' }}>
              {formatCurrency(analysis.salaryRange.min)}
            </div>
            <div className="absolute top-full mt-1 text-xs text-slate-500" style={{ left: '50%', transform: 'translateX(-50%)' }}>
              {formatCurrency(analysis.salaryRange.median)}
            </div>
            <div className="absolute top-full mt-1 text-xs text-slate-500" style={{ right: '0%' }}>
              {formatCurrency(analysis.salaryRange.max)}
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow"
              style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-8">
            {['25th', '50th', '75th', '90th'].map((p) => (
              <div key={p} className="text-center">
                <p className="text-xs text-slate-500">{p} percentile</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCurrency(analysis.percentile[p as keyof typeof analysis.percentile])}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {analysis.offerAnalysis && (
        <Card
          variant="elevated"
          className={cn(
            'border-2',
            analysis.offerAnalysis.comparison === 'above' && 'border-green-300 bg-green-50/50',
            analysis.offerAnalysis.comparison === 'below' && 'border-amber-300 bg-amber-50/50',
            analysis.offerAnalysis.comparison === 'at' && 'border-blue-300 bg-blue-50/50'
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {analysis.offerAnalysis.comparison === 'above' && <ArrowUpRight className="h-6 w-6 text-green-600" />}
              {analysis.offerAnalysis.comparison === 'below' && <ArrowDownRight className="h-6 w-6 text-amber-600" />}
              {analysis.offerAnalysis.comparison === 'at' && <Minus className="h-6 w-6 text-blue-600" />}
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Your Offer Analysis</h3>
                <p className="text-sm text-slate-600">
                  Your offer is {analysis.offerAnalysis.comparison} market rate ({analysis.offerAnalysis.percentileRank}th
                  percentile)
                </p>
              </div>
            </div>
            <p className="text-slate-700">{analysis.offerAnalysis.recommendation}</p>
          </CardContent>
        </Card>
      )}

      {analysis.factors && analysis.factors.length > 0 && (
        <Card variant="elevated">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Salary Factors</h3>
            <div className="space-y-3">
              {analysis.factors.map((factor, i) => (
                <div key={i} className="flex items-start gap-3">
                  {factor.impact === 'positive' && <ArrowUpRight className="h-5 w-5 text-green-600 shrink-0" />}
                  {factor.impact === 'negative' && <ArrowDownRight className="h-5 w-5 text-red-600 shrink-0" />}
                  {factor.impact === 'neutral' && <Minus className="h-5 w-5 text-slate-400 shrink-0" />}
                  <div>
                    <p className="font-medium text-slate-900">{factor.name}</p>
                    <p className="text-sm text-slate-600">{factor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Market Outlook</h3>
            <p className="text-slate-700">{analysis.marketOutlook}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Negotiation Tips</h3>
            <ul className="space-y-2">
              {analysis.negotiationTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
