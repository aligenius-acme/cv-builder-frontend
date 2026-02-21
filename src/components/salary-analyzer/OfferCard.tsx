import { X, Check } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Offer {
  id: string;
  company: string;
  position: string;
  baseSalary: number;
  bonus: string;
  equity: string;
  benefits: string[];
  remoteWork: string;
  ptoDays: number;
  location: string;
}

interface SavedJob {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
}

interface OfferCardProps {
  offer: Offer;
  index: number;
  onUpdate: (id: string, field: keyof Offer, value: any) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  savedJobs: SavedJob[];
  isLoadingSavedJobs: boolean;
  inputMode: 'saved' | 'manual' | undefined;
  selectedJobId: string | undefined;
  onModeChange: (offerId: string, mode: 'saved' | 'manual') => void;
  onSelectJob: (offerId: string, jobId: string) => void;
}

export default function OfferCard({
  offer,
  index,
  onUpdate,
  onRemove,
  canRemove,
  savedJobs,
  isLoadingSavedJobs,
  inputMode,
  selectedJobId,
  onModeChange,
  onSelectJob,
}: OfferCardProps) {
  return (
    <div className="p-4 border border-slate-200 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900">Offer {index + 1}</h4>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={() => onRemove(offer.id)}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Saved Jobs Import for this offer */}
      {savedJobs.length > 0 && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-700">Import from Saved Jobs</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onModeChange(offer.id, 'saved')}
                className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                  inputMode === 'saved'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                }`}
              >
                Saved
              </button>
              <button
                type="button"
                onClick={() => onModeChange(offer.id, 'manual')}
                className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                  inputMode === 'manual' || !inputMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                }`}
              >
                Manual
              </button>
            </div>
          </div>
          {inputMode === 'saved' && (
            <select
              value={selectedJobId || ''}
              onChange={(e) => onSelectJob(offer.id, e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a saved job...</option>
              {savedJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} at {job.company}
                </option>
              ))}
            </select>
          )}
          {selectedJobId && (
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <Check className="h-3 w-3" /> Imported - edit details below
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          value={offer.company}
          onChange={(e) => onUpdate(offer.id, 'company', e.target.value)}
          placeholder="Company"
          className="px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
        />
        <input
          type="text"
          value={offer.position}
          onChange={(e) => onUpdate(offer.id, 'position', e.target.value)}
          placeholder="Position"
          className="px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
        />
        <input
          type="number"
          value={offer.baseSalary || ''}
          onChange={(e) => onUpdate(offer.id, 'baseSalary', parseInt(e.target.value) || 0)}
          placeholder="Base Salary"
          className="px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          value={offer.bonus}
          onChange={(e) => onUpdate(offer.id, 'bonus', e.target.value)}
          placeholder="Bonus (e.g. 10%)"
          className="px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
        />
        <input
          type="text"
          value={offer.equity}
          onChange={(e) => onUpdate(offer.id, 'equity', e.target.value)}
          placeholder="Equity (e.g. 50k RSUs)"
          className="px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
        />
        <input
          type="text"
          value={offer.location}
          onChange={(e) => onUpdate(offer.id, 'location', e.target.value)}
          placeholder="Location"
          className="px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
