'use client';

import { useState } from 'react';
import { useFetchData } from '@/hooks/useFetchData';
import {
  DollarSign,
  TrendingUp,
  Building2,
  MapPin,
  Briefcase,
  Plus,
  X,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
  Scale,
  MessageSquare,
  Copy,
  Check,
  Star,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Mail,
  Clock,
  Gift,
  Home,
  Calendar,
  Shield,
  XCircle,
} from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SegmentedControl from '@/components/ui/SegmentedControl';
import PageHeader from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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

type TabType = 'analyze' | 'compare' | 'negotiate';

export default function SalaryAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('analyze');

  // Saved Jobs State
  const { data: savedJobsData, isLoading: isLoadingSavedJobs } = useFetchData({
    fetchFn: () => api.getSavedJobs(),
    errorMessage: 'Failed to load saved jobs',
    showErrorToast: false,
  });
  const savedJobs = savedJobsData?.jobs || [];

  // Analyze State
  const [analyzeJobInputMode, setAnalyzeJobInputMode] = useState<'saved' | 'manual'>('manual');
  const [selectedAnalyzeJobId, setSelectedAnalyzeJobId] = useState<string>('');

  const handleSelectAnalyzeJob = (jobId: string) => {
    setSelectedAnalyzeJobId(jobId);
    const job = savedJobs.find(j => j.id === jobId);
    if (job) {
      setJobTitle(job.title || '');
      setLocation(job.location || '');
      // Optionally set currentOffer if salary is available
      if (job.salary) {
        setCurrentOffer(job.salary);
      }
    }
  };

  // Analyze State
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [currentOffer, setCurrentOffer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SalaryAnalysis | null>(null);

  // Compare State
  const [offers, setOffers] = useState<Offer[]>([
    { id: '1', company: '', position: '', baseSalary: 0, bonus: '', equity: '', benefits: [], remoteWork: '', ptoDays: 0, location: '' },
    { id: '2', company: '', position: '', baseSalary: 0, bonus: '', equity: '', benefits: [], remoteWork: '', ptoDays: 0, location: '' },
  ]);
  const [offerJobInputModes, setOfferJobInputModes] = useState<Record<string, 'saved' | 'manual'>>({});
  const [selectedOfferJobIds, setSelectedOfferJobIds] = useState<Record<string, string>>({});
  const [isComparing, setIsComparing] = useState(false);
  const [comparison, setComparison] = useState<any>(null);

  const handleSelectOfferJob = (offerId: string, jobId: string) => {
    setSelectedOfferJobIds(prev => ({ ...prev, [offerId]: jobId }));
    const job = savedJobs.find(j => j.id === jobId);
    if (job) {
      updateOffer(offerId, 'company', job.company || '');
      updateOffer(offerId, 'position', job.title || '');
      updateOffer(offerId, 'location', job.location || '');
      if (job.salary) {
        // Try to parse salary if it's a string
        const salaryMatch = job.salary.match(/\d+/);
        if (salaryMatch) {
          updateOffer(offerId, 'baseSalary', parseInt(salaryMatch[0]));
        }
      }
    }
  };

  // Negotiate State
  const [negotiateJobInputMode, setNegotiateJobInputMode] = useState<'saved' | 'manual'>('manual');
  const [selectedNegotiateJobId, setSelectedNegotiateJobId] = useState<string>('');
  const [negotiateOffer, setNegotiateOffer] = useState('');
  const [targetSalary, setTargetSalary] = useState('');
  const [negotiateJobTitle, setNegotiateJobTitle] = useState('');
  const [negotiateCompany, setNegotiateCompany] = useState('');
  const [reasons, setReasons] = useState<string[]>(['Market research', 'Relevant experience', 'Specialized skills']);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [script, setScript] = useState<any>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['opening', 'keyPoints']));

  const handleSelectNegotiateJob = (jobId: string) => {
    setSelectedNegotiateJobId(jobId);
    const job = savedJobs.find(j => j.id === jobId);
    if (job) {
      setNegotiateJobTitle(job.title || '');
      setNegotiateCompany(job.company || '');
      if (job.salary) {
        setNegotiateOffer(job.salary);
      }
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
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
    } catch (error) {
      toast.error('Failed to analyze salary');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateOffer = (id: string, field: keyof Offer, value: any) => {
    setOffers(offers.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  };

  const addOffer = () => {
    setOffers([
      ...offers,
      { id: Date.now().toString(), company: '', position: '', baseSalary: 0, bonus: '', equity: '', benefits: [], remoteWork: '', ptoDays: 0, location: '' },
    ]);
  };

  const removeOffer = (id: string) => {
    if (offers.length > 2) {
      setOffers(offers.filter((o) => o.id !== id));
    }
  };

  const handleCompare = async () => {
    const validOffers = offers.filter((o) => o.company && o.baseSalary > 0);
    if (validOffers.length < 2) {
      toast.error('Please fill in at least 2 offers');
      return;
    }

    setIsComparing(true);
    setComparison(null);

    try {
      const response = await api.compareOffers(validOffers);
      if (response.success && response.data) {
        setComparison(response.data);
      }
    } catch (error) {
      toast.error('Failed to compare offers');
    } finally {
      setIsComparing(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!negotiateOffer || !targetSalary) {
      toast.error('Please enter current offer and target salary');
      return;
    }

    setIsGeneratingScript(true);
    setScript(null);

    try {
      const response = await api.getNegotiationScript({
        currentOffer: negotiateOffer,
        targetSalary,
        reasons,
        jobTitle: negotiateJobTitle || undefined,
        company: negotiateCompany || undefined,
      });

      if (response.success && response.data) {
        setScript(response.data);
      }
    } catch (error) {
      toast.error('Failed to generate script');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const SectionHeader = ({ title, section, icon: Icon }: { title: string; section: string; icon: any }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-slate-900">{title}</span>
      </div>
      {expandedSections.has(section) ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <PageHeader
          icon={<DollarSign className="h-5 w-5" />}
          label="Compensation Intelligence"
          title="Salary Analyzer"
          description="Research market rates, compare job offers, and get AI-powered negotiation scripts to maximize your compensation."
        />

        {/* Tabs */}
        <SegmentedControl
          options={[
            { value: 'analyze', label: 'Salary Research', icon: <BarChart3 className="h-4 w-4" /> },
            { value: 'compare', label: 'Compare Offers', icon: <Scale className="h-4 w-4" /> },
            { value: 'negotiate', label: 'Negotiation Script', icon: <MessageSquare className="h-4 w-4" /> },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
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
                {/* Saved Jobs Integration */}
                {savedJobs.length > 0 && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700">Import from Saved Jobs</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAnalyzeJobInputMode('saved')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            analyzeJobInputMode === 'saved'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          Saved Jobs
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAnalyzeJobInputMode('manual');
                            setSelectedAnalyzeJobId('');
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            analyzeJobInputMode === 'manual'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          Manual Entry
                        </button>
                      </div>
                    </div>
                    {analyzeJobInputMode === 'saved' && (
                      <div>
                        {isLoadingSavedJobs ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <select
                              value={selectedAnalyzeJobId}
                              onChange={(e) => handleSelectAnalyzeJob(e.target.value)}
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                            >
                              <option value="">Select a saved job...</option>
                              {savedJobs.map((job) => (
                                <option key={job.id} value={job.id}>
                                  {job.title} at {job.company}
                                </option>
                              ))}
                            </select>
                            {selectedAnalyzeJobId && (
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
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1"><Briefcase className="h-4 w-4 inline mr-1" />Job Title *</label>
                    <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1"><MapPin className="h-4 w-4 inline mr-1" />Location *</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                    <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value ? parseInt(e.target.value) : '')} placeholder="e.g. 5" className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                    <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Technology" className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
                    <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900">
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
                    <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add a skill" className="flex-1 px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" />
                    <Button variant="outline" onClick={addSkill}>Add</Button>
                  </div>
                  {skills.length > 0 && (<div className="flex flex-wrap gap-2">{skills.map((skill) => (<Badge key={skill} variant="info" size="lg">{skill}<button onClick={() => removeSkill(skill)} className="ml-1"><X className="h-3 w-3" /></button></Badge>))}</div>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1"><DollarSign className="h-4 w-4 inline mr-1" />Current Offer (optional)</label>
                  <input type="text" value={currentOffer} onChange={(e) => setCurrentOffer(e.target.value)} placeholder="e.g. $120,000" className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" />
                </div>
                <Button variant="primary" size="lg" onClick={handleAnalyze} disabled={isAnalyzing} leftIcon={isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <TrendingUp className="h-5 w-5" />} className="w-full">{isAnalyzing ? 'Analyzing...' : 'Analyze Salary'}</Button>
              </CardContent>
            </Card>

            {analysis && (
              <div className="space-y-6">
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Salary Range</h3>
                    <div className="relative h-8 bg-slate-200 dark:bg-zinc-700 rounded-full mb-6">
                      <div className="absolute top-full mt-1 text-xs text-slate-500" style={{ left: '0%' }}>{formatCurrency(analysis.salaryRange.min)}</div>
                      <div className="absolute top-full mt-1 text-xs text-slate-500" style={{ left: '50%', transform: 'translateX(-50%)' }}>{formatCurrency(analysis.salaryRange.median)}</div>
                      <div className="absolute top-full mt-1 text-xs text-slate-500" style={{ right: '0%' }}>{formatCurrency(analysis.salaryRange.max)}</div>
                      <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow" style={{ left: '50%', transform: 'translate(-50%, -50%)' }} />
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-8">
                      {['25th', '50th', '75th', '90th'].map((p) => (<div key={p} className="text-center"><p className="text-xs text-slate-500">{p} percentile</p><p className="text-lg font-semibold text-slate-900">{formatCurrency(analysis.percentile[p as keyof typeof analysis.percentile])}</p></div>))}
                    </div>
                  </CardContent>
                </Card>
                {analysis.offerAnalysis && (
                  <Card variant="elevated" className={cn('border-2', analysis.offerAnalysis.comparison === 'above' && 'border-green-300 bg-green-50/50', analysis.offerAnalysis.comparison === 'below' && 'border-amber-300 bg-amber-50/50', analysis.offerAnalysis.comparison === 'at' && 'border-blue-300 bg-blue-50/50')}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        {analysis.offerAnalysis.comparison === 'above' && <ArrowUpRight className="h-6 w-6 text-green-600" />}
                        {analysis.offerAnalysis.comparison === 'below' && <ArrowDownRight className="h-6 w-6 text-amber-600" />}
                        {analysis.offerAnalysis.comparison === 'at' && <Minus className="h-6 w-6 text-blue-600" />}
                        <div><h3 className="text-lg font-semibold text-slate-900">Your Offer Analysis</h3><p className="text-sm text-slate-600">Your offer is {analysis.offerAnalysis.comparison} market rate ({analysis.offerAnalysis.percentileRank}th percentile)</p></div>
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
                            <div><p className="font-medium text-slate-900">{factor.name}</p><p className="text-sm text-slate-600">{factor.description}</p></div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card variant="elevated"><CardContent className="p-6"><h3 className="text-lg font-semibold text-slate-900 mb-4">Market Outlook</h3><p className="text-slate-700">{analysis.marketOutlook}</p></CardContent></Card>
                  <Card variant="elevated"><CardContent className="p-6"><h3 className="text-lg font-semibold text-slate-900 mb-4">Negotiation Tips</h3><ul className="space-y-2">{analysis.negotiationTips.map((tip, i) => (<li key={i} className="flex items-start gap-2 text-slate-700"><Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />{tip}</li>))}</ul></CardContent></Card>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5 text-blue-600" />Compare Offers</CardTitle>
                <CardDescription>Compare multiple job offers side by side</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {offers.map((offer, index) => (
                  <div key={offer.id} className="p-4 border border-slate-200 rounded-xl space-y-4">
                    <div className="flex items-center justify-between"><h4 className="font-semibold text-slate-900">Offer {index + 1}</h4>{offers.length > 2 && (<Button variant="ghost" size="sm" onClick={() => removeOffer(offer.id)}><X className="h-4 w-4" /></Button>)}</div>

                    {/* Saved Jobs Import for this offer */}
                    {savedJobs.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-700">Import from Saved Jobs</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setOfferJobInputModes(prev => ({ ...prev, [offer.id]: 'saved' }))}
                              className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                                offerJobInputModes[offer.id] === 'saved'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                              }`}
                            >
                              Saved
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOfferJobInputModes(prev => ({ ...prev, [offer.id]: 'manual' }));
                                setSelectedOfferJobIds(prev => ({ ...prev, [offer.id]: '' }));
                              }}
                              className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                                offerJobInputModes[offer.id] === 'manual' || !offerJobInputModes[offer.id]
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                              }`}
                            >
                              Manual
                            </button>
                          </div>
                        </div>
                        {offerJobInputModes[offer.id] === 'saved' && (
                          <select
                            value={selectedOfferJobIds[offer.id] || ''}
                            onChange={(e) => handleSelectOfferJob(offer.id, e.target.value)}
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
                        {selectedOfferJobIds[offer.id] && (
                          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Imported - edit details below
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" value={offer.company} onChange={(e) => updateOffer(offer.id, 'company', e.target.value)} placeholder="Company" className="px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" />
                      <input type="text" value={offer.position} onChange={(e) => updateOffer(offer.id, 'position', e.target.value)} placeholder="Position" className="px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" />
                      <input type="number" value={offer.baseSalary || ''} onChange={(e) => updateOffer(offer.id, 'baseSalary', parseInt(e.target.value) || 0)} placeholder="Base Salary" className="px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" value={offer.bonus} onChange={(e) => updateOffer(offer.id, 'bonus', e.target.value)} placeholder="Bonus (e.g. 10%)" className="px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" />
                      <input type="text" value={offer.equity} onChange={(e) => updateOffer(offer.id, 'equity', e.target.value)} placeholder="Equity (e.g. 50k RSUs)" className="px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" />
                      <input type="text" value={offer.location} onChange={(e) => updateOffer(offer.id, 'location', e.target.value)} placeholder="Location" className="px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" />
                    </div>
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={addOffer} leftIcon={<Plus className="h-4 w-4" />}>Add Offer</Button>
                  <Button variant="primary" onClick={handleCompare} disabled={isComparing} leftIcon={isComparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />}>{isComparing ? 'Comparing...' : 'Compare Offers'}</Button>
                </div>
              </CardContent>
            </Card>
            {comparison && (
              <div className="space-y-6">
                <Card variant="elevated"><CardContent className="p-6"><h3 className="text-lg font-semibold text-slate-900 mb-4">Total Compensation</h3><div className="space-y-3">{comparison.totalCompensation?.map((tc: any, i: number) => (<div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span className="font-medium text-slate-900">{tc.company}</span><span className="text-lg font-bold text-blue-600">{formatCurrency(tc.estimated)}</span></div>))}</div></CardContent></Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {comparison.prosAndCons?.map((pc: any, i: number) => (
                    <Card key={i} variant="elevated">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">{pc.company}</h3>
                        <div className="space-y-4">
                          <div><p className="text-sm font-medium text-green-700 mb-2">Pros</p><ul className="space-y-1">{pc.pros?.map((pro: string, j: number) => (<li key={j} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-green-500">+</span> {pro}</li>))}</ul></div>
                          <div><p className="text-sm font-medium text-red-700 mb-2">Cons</p><ul className="space-y-1">{pc.cons?.map((con: string, j: number) => (<li key={j} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-red-500">-</span> {con}</li>))}</ul></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {comparison.recommendation && (
                  <Card variant="elevated" className="border-2 border-blue-200 bg-blue-50/50">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommendation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-white rounded-xl"><p className="text-xs text-slate-500">Best for Money</p><p className="font-semibold text-slate-900">{comparison.recommendation.bestFor?.moneyFocused}</p></div>
                        <div className="p-3 bg-white rounded-xl"><p className="text-xs text-slate-500">Best for Work-Life Balance</p><p className="font-semibold text-slate-900">{comparison.recommendation.bestFor?.workLifeBalance}</p></div>
                        <div className="p-3 bg-white rounded-xl"><p className="text-xs text-slate-500">Best for Career Growth</p><p className="font-semibold text-slate-900">{comparison.recommendation.bestFor?.careerGrowth}</p></div>
                      </div>
                      <div className="p-4 bg-white rounded-xl"><p className="text-sm font-medium text-blue-600 mb-1">Overall Pick: {comparison.recommendation.overallPick}</p><p className="text-slate-700">{comparison.recommendation.reasoning}</p></div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Negotiate Tab */}
        {activeTab === 'negotiate' && (
          <div className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-blue-600" />Negotiation Script Generator</CardTitle>
                <CardDescription>Get a comprehensive toolkit to negotiate your salary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Saved Jobs Integration */}
                {savedJobs.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700">Import from Saved Jobs</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNegotiateJobInputMode('saved')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            negotiateJobInputMode === 'saved'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          Saved Jobs
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNegotiateJobInputMode('manual');
                            setSelectedNegotiateJobId('');
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            negotiateJobInputMode === 'manual'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          Manual Entry
                        </button>
                      </div>
                    </div>
                    {negotiateJobInputMode === 'saved' && (
                      <div>
                        {isLoadingSavedJobs ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <select
                              value={selectedNegotiateJobId}
                              onChange={(e) => handleSelectNegotiateJob(e.target.value)}
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                            >
                              <option value="">Select a saved job...</option>
                              {savedJobs.map((job) => (
                                <option key={job.id} value={job.id}>
                                  {job.title} at {job.company}
                                </option>
                              ))}
                            </select>
                            {selectedNegotiateJobId && (
                              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-600" />
                                Job details imported. Add offer amounts below.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Current Offer *</label><input type="text" value={negotiateOffer} onChange={(e) => setNegotiateOffer(e.target.value)} placeholder="e.g. $120,000" className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Target Salary *</label><input type="text" value={targetSalary} onChange={(e) => setTargetSalary(e.target.value)} placeholder="e.g. $140,000" className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label><input type="text" value={negotiateJobTitle} onChange={(e) => setNegotiateJobTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Company</label><input type="text" value={negotiateCompany} onChange={(e) => setNegotiateCompany(e.target.value)} placeholder="e.g. Google" className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400" /></div>
                </div>
                <Button variant="primary" size="lg" onClick={handleGenerateScript} disabled={isGeneratingScript} leftIcon={isGeneratingScript ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />} className="w-full">{isGeneratingScript ? 'Generating...' : 'Generate Negotiation Toolkit'}</Button>
              </CardContent>
            </Card>

            {script && (
              <div className="space-y-4">
                {/* Opening Statement */}
                <Card variant="elevated">
                  <SectionHeader title="Opening Statement" section="opening" icon={MessageSquare} />
                  {expandedSections.has('opening') && (
                    <CardContent className="p-6 pt-0">
                      <div className="flex justify-end mb-2"><Button variant="ghost" size="sm" onClick={() => copyToClipboard(script.openingStatement, 'opening')}>{copiedSection === 'opening' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div>
                      <p className="text-slate-700 bg-blue-50 p-4 rounded-xl border border-blue-200">{script.openingStatement}</p>
                    </CardContent>
                  )}
                </Card>

                {/* Key Points */}
                {script.keyPoints && script.keyPoints.length > 0 && (
                  <Card variant="elevated">
                    <SectionHeader title="Key Points to Make" section="keyPoints" icon={Star} />
                    {expandedSections.has('keyPoints') && (
                      <CardContent className="p-6 pt-0 space-y-3">
                        {script.keyPoints.map((kp: any, i: number) => (
                          <div key={i} className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <p className="font-medium text-blue-900">{kp.point}</p>
                            <p className="text-sm text-blue-700 mt-1">{kp.elaboration}</p>
                            {kp.exactScript && (<div className="mt-2 p-3 bg-white rounded-lg border border-blue-100"><p className="text-xs text-slate-500 mb-1">Say this:</p><p className="text-sm text-slate-700 italic">"{kp.exactScript}"</p></div>)}
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Counter-Offer Scripts */}
                {script.counterOfferScripts && script.counterOfferScripts.length > 0 && (
                  <Card variant="elevated">
                    <SectionHeader title="Counter-Offer Scripts" section="counterOffer" icon={DollarSign} />
                    {expandedSections.has('counterOffer') && (
                      <CardContent className="p-6 pt-0 space-y-4">
                        {script.counterOfferScripts.map((cos: any, i: number) => (
                          <div key={i} className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <p className="font-medium text-amber-900 mb-2">Scenario: {cos.scenario}</p>
                            <div className="space-y-2">
                              <div className="p-3 bg-white rounded-lg"><p className="text-xs text-slate-500 mb-1">Your Response:</p><p className="text-sm text-slate-700">{cos.script}</p></div>
                              {cos.fallbackPosition && (<div className="p-3 bg-amber-100/50 rounded-lg"><p className="text-xs text-amber-700 mb-1">Fallback Position:</p><p className="text-sm text-amber-800">{cos.fallbackPosition}</p></div>)}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Benefits Negotiation */}
                {script.benefitsNegotiation && (
                  <Card variant="elevated">
                    <SectionHeader title="Benefits Negotiation Scripts" section="benefits" icon={Gift} />
                    {expandedSections.has('benefits') && (
                      <CardContent className="p-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {script.benefitsNegotiation.signingBonus && (<div className="p-4 bg-green-50 rounded-xl border border-green-200"><div className="flex items-center gap-2 mb-2"><DollarSign className="h-4 w-4 text-green-600" /><p className="font-medium text-green-900">Signing Bonus</p></div><p className="text-sm text-green-800">{script.benefitsNegotiation.signingBonus.script}</p>{script.benefitsNegotiation.signingBonus.typicalRange && (<p className="text-xs text-green-600 mt-2">Typical: {script.benefitsNegotiation.signingBonus.typicalRange}</p>)}</div>)}
                          {script.benefitsNegotiation.equity && (<div className="p-4 bg-purple-50 rounded-xl border border-purple-200"><div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-purple-600" /><p className="font-medium text-purple-900">Equity/Stock Options</p></div><p className="text-sm text-purple-800">{script.benefitsNegotiation.equity.script}</p>{script.benefitsNegotiation.equity.typicalRange && (<p className="text-xs text-purple-600 mt-2">Typical: {script.benefitsNegotiation.equity.typicalRange}</p>)}</div>)}
                          {script.benefitsNegotiation.pto && (<div className="p-4 bg-blue-50 rounded-xl border border-blue-200"><div className="flex items-center gap-2 mb-2"><Calendar className="h-4 w-4 text-blue-600" /><p className="font-medium text-blue-900">PTO/Vacation</p></div><p className="text-sm text-blue-800">{script.benefitsNegotiation.pto.script}</p>{script.benefitsNegotiation.pto.typicalRange && (<p className="text-xs text-blue-600 mt-2">Typical: {script.benefitsNegotiation.pto.typicalRange}</p>)}</div>)}
                          {script.benefitsNegotiation.remoteWork && (<div className="p-4 bg-teal-50 rounded-xl border border-teal-200"><div className="flex items-center gap-2 mb-2"><Home className="h-4 w-4 text-teal-600" /><p className="font-medium text-teal-900">Remote Work</p></div><p className="text-sm text-teal-800">{script.benefitsNegotiation.remoteWork.script}</p>{script.benefitsNegotiation.remoteWork.tips && (<p className="text-xs text-teal-600 mt-2">Tip: {script.benefitsNegotiation.remoteWork.tips}</p>)}</div>)}
                          {script.benefitsNegotiation.startDate && (<div className="p-4 bg-orange-50 rounded-xl border border-orange-200"><div className="flex items-center gap-2 mb-2"><Clock className="h-4 w-4 text-orange-600" /><p className="font-medium text-orange-900">Start Date</p></div><p className="text-sm text-orange-800">{script.benefitsNegotiation.startDate.script}</p>{script.benefitsNegotiation.startDate.tips && (<p className="text-xs text-orange-600 mt-2">Tip: {script.benefitsNegotiation.startDate.tips}</p>)}</div>)}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Email Templates */}
                {script.emailTemplates && (
                  <Card variant="elevated">
                    <SectionHeader title="Email Templates" section="emails" icon={Mail} />
                    {expandedSections.has('emails') && (
                      <CardContent className="p-6 pt-0 space-y-4">
                        {script.emailTemplates.initial && (<div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><div className="flex items-center justify-between mb-2"><p className="font-medium text-slate-900">Initial Negotiation Email</p><Button variant="ghost" size="sm" onClick={() => copyToClipboard(script.emailTemplates.initial, 'email-initial')}>{copiedSection === 'email-initial' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div><pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{script.emailTemplates.initial}</pre></div>)}
                        {script.emailTemplates.counterOffer && (<div className="p-4 bg-amber-50 rounded-xl border border-amber-200"><div className="flex items-center justify-between mb-2"><p className="font-medium text-amber-900">Counter-Offer Response Email</p><Button variant="ghost" size="sm" onClick={() => copyToClipboard(script.emailTemplates.counterOffer, 'email-counter')}>{copiedSection === 'email-counter' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div><pre className="text-sm text-amber-800 whitespace-pre-wrap font-sans">{script.emailTemplates.counterOffer}</pre></div>)}
                        {script.emailTemplates.acceptance && (<div className="p-4 bg-green-50 rounded-xl border border-green-200"><div className="flex items-center justify-between mb-2"><p className="font-medium text-green-900">Acceptance Email</p><Button variant="ghost" size="sm" onClick={() => copyToClipboard(script.emailTemplates.acceptance, 'email-accept')}>{copiedSection === 'email-accept' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div><pre className="text-sm text-green-800 whitespace-pre-wrap font-sans">{script.emailTemplates.acceptance}</pre></div>)}
                        {script.emailTemplates.walkAway && (<div className="p-4 bg-red-50 rounded-xl border border-red-200"><div className="flex items-center justify-between mb-2"><p className="font-medium text-red-900">Professional Decline Email</p><Button variant="ghost" size="sm" onClick={() => copyToClipboard(script.emailTemplates.walkAway, 'email-decline')}>{copiedSection === 'email-decline' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div><pre className="text-sm text-red-800 whitespace-pre-wrap font-sans">{script.emailTemplates.walkAway}</pre></div>)}
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Walkaway Strategy */}
                {script.walkawayStrategy && (
                  <Card variant="elevated">
                    <SectionHeader title="Walkaway Strategy" section="walkaway" icon={Shield} />
                    {expandedSections.has('walkaway') && (
                      <CardContent className="p-6 pt-0 space-y-4">
                        {script.walkawayStrategy.minimumAcceptable && (<div className="p-4 bg-slate-100 rounded-xl"><p className="font-medium text-slate-900 mb-2">Know Your Minimum</p><p className="text-sm text-slate-700">{script.walkawayStrategy.minimumAcceptable}</p></div>)}
                        {script.walkawayStrategy.howToDecline && (<div className="p-4 bg-red-50 rounded-xl border border-red-200"><p className="font-medium text-red-900 mb-2">How to Gracefully Decline</p><p className="text-sm text-red-800">{script.walkawayStrategy.howToDecline}</p></div>)}
                        {script.walkawayStrategy.keepDoorOpen && (<div className="p-4 bg-blue-50 rounded-xl border border-blue-200"><p className="font-medium text-blue-900 mb-2">Keep the Door Open</p><p className="text-sm text-blue-800">{script.walkawayStrategy.keepDoorOpen}</p></div>)}
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Common Mistakes */}
                {script.commonMistakes && script.commonMistakes.length > 0 && (
                  <Card variant="elevated">
                    <SectionHeader title="Common Mistakes to Avoid" section="mistakes" icon={XCircle} />
                    {expandedSections.has('mistakes') && (
                      <CardContent className="p-6 pt-0">
                        <ul className="space-y-2">
                          {script.commonMistakes.map((mistake: string, i: number) => (<li key={i} className="flex items-start gap-2 text-slate-700 p-3 bg-red-50 rounded-lg border border-red-200"><AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /><span className="text-sm text-red-800">{mistake}</span></li>))}
                        </ul>
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Timeline */}
                {script.timeline && (
                  <Card variant="elevated">
                    <SectionHeader title="Negotiation Timeline" section="timeline" icon={Clock} />
                    {expandedSections.has('timeline') && (
                      <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                          {script.timeline.whenToNegotiate && (<div className="p-4 bg-blue-50 rounded-xl border border-blue-200"><p className="font-medium text-blue-900 mb-1">When to Negotiate</p><p className="text-sm text-blue-800">{script.timeline.whenToNegotiate}</p></div>)}
                          {script.timeline.howLongToWait && (<div className="p-4 bg-amber-50 rounded-xl border border-amber-200"><p className="font-medium text-amber-900 mb-1">Response Timeline</p><p className="text-sm text-amber-800">{script.timeline.howLongToWait}</p></div>)}
                          {script.timeline.deadlineStrategy && (<div className="p-4 bg-green-50 rounded-xl border border-green-200"><p className="font-medium text-green-900 mb-1">Deadline Strategy</p><p className="text-sm text-green-800">{script.timeline.deadlineStrategy}</p></div>)}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Tips */}
                {script.tips && script.tips.length > 0 && (
                  <Card variant="elevated">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" />Pro Tips</h4>
                      <ul className="space-y-2">
                        {script.tips.map((tip: string, i: number) => (<li key={i} className="flex items-start gap-2 text-slate-700"><Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />{tip}</li>))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Closing */}
                {script.closingStatement && (
                  <Card variant="elevated">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2"><h4 className="font-semibold text-slate-900">Closing Statement</h4><Button variant="ghost" size="sm" onClick={() => copyToClipboard(script.closingStatement, 'closing')}>{copiedSection === 'closing' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div>
                      <p className="text-slate-700 bg-green-50 p-4 rounded-xl border border-green-200">{script.closingStatement}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
