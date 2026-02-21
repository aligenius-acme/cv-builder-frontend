import { Check } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface SavedJob {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
}

interface SavedJobSelectorProps {
  jobs: SavedJob[];
  isLoading: boolean;
  selectedJobId: string;
  onSelect: (jobId: string) => void;
  inputMode: 'saved' | 'manual';
  onModeChange: (mode: 'saved' | 'manual') => void;
}

export default function SavedJobSelector({
  jobs,
  isLoading,
  selectedJobId,
  onSelect,
  inputMode,
  onModeChange,
}: SavedJobSelectorProps) {
  if (jobs.length === 0) return null;

  return (
    <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-700">Import from Saved Jobs</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onModeChange('saved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              inputMode === 'saved'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
            }`}
          >
            Saved Jobs
          </button>
          <button
            type="button"
            onClick={() => onModeChange('manual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              inputMode === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
            }`}
          >
            Manual Entry
          </button>
        </div>
      </div>
      {inputMode === 'saved' && (
        <div>
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <select
                value={selectedJobId}
                onChange={(e) => onSelect(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              >
                <option value="">Select a saved job...</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} at {job.company}
                  </option>
                ))}
              </select>
              {selectedJobId && (
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-600" />
                  Job details imported. You can edit any field below.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
