import { useState } from 'react';
import { TrendingUp, Briefcase, MapPin, DollarSign, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SavedJobSelector from './SavedJobSelector';
import SalaryResultsDisplay from './SalaryResultsDisplay';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import OutOfCreditsInline from '@/components/shared/OutOfCreditsInline';
import { useOutOfCredits } from '@/hooks';

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

interface SavedJob {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
}

interface SalaryAnalyzeTabProps {
  savedJobs: SavedJob[];
  isLoadingSavedJobs: boolean;
}

export default function SalaryAnalyzeTab({ savedJobs, isLoadingSavedJobs }: SalaryAnalyzeTabProps) {
  const [analyzeJobInputMode, setAnalyzeJobInputMode] = useState<'saved' | 'manual'>('manual');
  const [selectedAnalyzeJobId, setSelectedAnalyzeJobId] = useState<string>('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [currentOffer, setCurrentOffer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { outOfCredits, check402 } = useOutOfCredits();
  const [analysis, setAnalysis] = useState<SalaryAnalysis | null>(null);

  const handleSelectAnalyzeJob = (jobId: string) => {
    setSelectedAnalyzeJobId(jobId);
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setJobTitle(job.title || '');
      setLocation(job.location || '');
      if (job.salary) {
        setCurrentOffer(job.salary);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAnalyze = async () => {
    if (!jobTitle || !location) {
      toast.error('Please enter job title and location');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await api.analyzeSalary({
        jobTitle,
        location,
        experienceYears: experienceYears !== '' ? experienceYears : undefined,
        industry: industry || undefined,
        companySize: companySize || undefined,
        skills: skills.length > 0 ? skills : undefined,
        currentOffer: currentOffer || undefined,
      });

      if (response.success && response.data) {
        setAnalysis(response.data.analysis);
      }
    } catch (error: any) {
      if (check402(error)) return;
      toast.error('Failed to analyze salary');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Salary Research
          </CardTitle>
          <CardDescription>Get market salary data for your target role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SavedJobSelector
            jobs={savedJobs}
            isLoading={isLoadingSavedJobs}
            selectedJobId={selectedAnalyzeJobId}
            onSelect={handleSelectAnalyzeJob}
            inputMode={analyzeJobInputMode}
            onModeChange={(mode) => {
              setAnalyzeJobInputMode(mode);
              if (mode === 'manual') {
                setSelectedAnalyzeJobId('');
              }
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Job Title *
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. London, UK"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="e.g. 5"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Technology"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
              >
                <option value="">Select size</option>
                <option value="startup">Startup (1-50)</option>
                <option value="small">Small (51-200)</option>
                <option value="medium">Medium (201-1000)</option>
                <option value="large">Large (1000+)</option>
                <option value="enterprise">Enterprise (10000+)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Key Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill"
                className="flex-1 px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
              <Button variant="outline" onClick={addSkill}>
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="info" size="lg">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Current Offer (optional)
            </label>
            <input
              type="text"
              value={currentOffer}
              onChange={(e) => setCurrentOffer(e.target.value)}
              placeholder="e.g. $120,000"
              className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleAnalyze}
            disabled={isAnalyzing || outOfCredits}
            leftIcon={isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <TrendingUp className="h-5 w-5" />}
            className="w-full"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Salary'}
          </Button>
          {outOfCredits && <OutOfCreditsInline />}
        </CardContent>
      </Card>

      {analysis && <SalaryResultsDisplay analysis={analysis} formatCurrency={formatCurrency} />}
    </div>
  );
}
