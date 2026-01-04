'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
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
  const [isComparing, setIsComparing] = useState(false);
  const [comparison, setComparison] = useState<any>(null);

  // Negotiate State
  const [negotiateOffer, setNegotiateOffer] = useState('');
  const [targetSalary, setTargetSalary] = useState('');
  const [negotiateJobTitle, setNegotiateJobTitle] = useState('');
  const [negotiateCompany, setNegotiateCompany] = useState('');
  const [reasons, setReasons] = useState<string[]>(['Market research', 'Relevant experience', 'Specialized skills']);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [script, setScript] = useState<any>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Salary Analyzer</h1>
          <p className="mt-1 text-slate-500">Research market rates and negotiate confidently</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'analyze' as TabType, label: 'Salary Research', icon: BarChart3 },
            { id: 'compare' as TabType, label: 'Compare Offers', icon: Scale },
            { id: 'negotiate' as TabType, label: 'Negotiation Script', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Salary Research
                </CardTitle>
                <CardDescription>
                  Get market salary data for your target role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      placeholder="e.g. San Francisco, CA"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="e.g. 5"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. Technology"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Company Size
                    </label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Key Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Add a skill"
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button variant="outline" onClick={addSkill}>Add</Button>
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  leftIcon={isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <TrendingUp className="h-5 w-5" />}
                  className="w-full"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Salary'}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-6">
                {/* Salary Range */}
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Salary Range</h3>
                    <div className="relative h-8 bg-gradient-to-r from-red-200 via-amber-200 via-green-200 to-green-300 rounded-full mb-6">
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
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow"
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

                {/* Offer Analysis */}
                {analysis.offerAnalysis && (
                  <Card variant="elevated" className={cn(
                    'border-2',
                    analysis.offerAnalysis.comparison === 'above' && 'border-green-300 bg-green-50/50',
                    analysis.offerAnalysis.comparison === 'below' && 'border-amber-300 bg-amber-50/50',
                    analysis.offerAnalysis.comparison === 'at' && 'border-blue-300 bg-blue-50/50'
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        {analysis.offerAnalysis.comparison === 'above' && <ArrowUpRight className="h-6 w-6 text-green-600" />}
                        {analysis.offerAnalysis.comparison === 'below' && <ArrowDownRight className="h-6 w-6 text-amber-600" />}
                        {analysis.offerAnalysis.comparison === 'at' && <Minus className="h-6 w-6 text-blue-600" />}
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">Your Offer Analysis</h3>
                          <p className="text-sm text-slate-600">
                            Your offer is {analysis.offerAnalysis.comparison} market rate ({analysis.offerAnalysis.percentileRank}th percentile)
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-700">{analysis.offerAnalysis.recommendation}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Factors */}
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

                {/* Market Outlook & Tips */}
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
            )}
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-indigo-600" />
                  Compare Offers
                </CardTitle>
                <CardDescription>
                  Compare multiple job offers side by side
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {offers.map((offer, index) => (
                  <div key={offer.id} className="p-4 border border-slate-200 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">Offer {index + 1}</h4>
                      {offers.length > 2 && (
                        <Button variant="ghost" size="sm" onClick={() => removeOffer(offer.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={offer.company}
                        onChange={(e) => updateOffer(offer.id, 'company', e.target.value)}
                        placeholder="Company"
                        className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={offer.position}
                        onChange={(e) => updateOffer(offer.id, 'position', e.target.value)}
                        placeholder="Position"
                        className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        value={offer.baseSalary || ''}
                        onChange={(e) => updateOffer(offer.id, 'baseSalary', parseInt(e.target.value) || 0)}
                        placeholder="Base Salary"
                        className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={offer.bonus}
                        onChange={(e) => updateOffer(offer.id, 'bonus', e.target.value)}
                        placeholder="Bonus (e.g. 10%)"
                        className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={offer.equity}
                        onChange={(e) => updateOffer(offer.id, 'equity', e.target.value)}
                        placeholder="Equity (e.g. 50k RSUs)"
                        className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={offer.location}
                        onChange={(e) => updateOffer(offer.id, 'location', e.target.value)}
                        placeholder="Location"
                        className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={addOffer} leftIcon={<Plus className="h-4 w-4" />}>
                    Add Offer
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={handleCompare}
                    disabled={isComparing}
                    leftIcon={isComparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />}
                  >
                    {isComparing ? 'Comparing...' : 'Compare Offers'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Results */}
            {comparison && (
              <div className="space-y-6">
                {/* Total Compensation */}
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Total Compensation</h3>
                    <div className="space-y-3">
                      {comparison.totalCompensation?.map((tc: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <span className="font-medium text-slate-900">{tc.company}</span>
                          <span className="text-lg font-bold text-indigo-600">{formatCurrency(tc.estimated)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pros and Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {comparison.prosAndCons?.map((pc: any, i: number) => (
                    <Card key={i} variant="elevated">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">{pc.company}</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-green-700 mb-2">Pros</p>
                            <ul className="space-y-1">
                              {pc.pros?.map((pro: string, j: number) => (
                                <li key={j} className="text-sm text-slate-700 flex items-start gap-2">
                                  <span className="text-green-500">+</span> {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-red-700 mb-2">Cons</p>
                            <ul className="space-y-1">
                              {pc.cons?.map((con: string, j: number) => (
                                <li key={j} className="text-sm text-slate-700 flex items-start gap-2">
                                  <span className="text-red-500">-</span> {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recommendation */}
                {comparison.recommendation && (
                  <Card variant="elevated" className="border-2 border-indigo-200 bg-indigo-50/50">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommendation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-white rounded-xl">
                          <p className="text-xs text-slate-500">Best for Money</p>
                          <p className="font-semibold text-slate-900">{comparison.recommendation.bestFor?.moneyFocused}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl">
                          <p className="text-xs text-slate-500">Best for Work-Life Balance</p>
                          <p className="font-semibold text-slate-900">{comparison.recommendation.bestFor?.workLifeBalance}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl">
                          <p className="text-xs text-slate-500">Best for Career Growth</p>
                          <p className="font-semibold text-slate-900">{comparison.recommendation.bestFor?.careerGrowth}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-xl">
                        <p className="text-sm font-medium text-indigo-600 mb-1">Overall Pick: {comparison.recommendation.overallPick}</p>
                        <p className="text-slate-700">{comparison.recommendation.reasoning}</p>
                      </div>
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
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                  Negotiation Script Generator
                </CardTitle>
                <CardDescription>
                  Get a personalized script to negotiate your salary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Current Offer *
                    </label>
                    <input
                      type="text"
                      value={negotiateOffer}
                      onChange={(e) => setNegotiateOffer(e.target.value)}
                      placeholder="e.g. $120,000"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Target Salary *
                    </label>
                    <input
                      type="text"
                      value={targetSalary}
                      onChange={(e) => setTargetSalary(e.target.value)}
                      placeholder="e.g. $140,000"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={negotiateJobTitle}
                      onChange={(e) => setNegotiateJobTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={negotiateCompany}
                      onChange={(e) => setNegotiateCompany(e.target.value)}
                      placeholder="e.g. Google"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleGenerateScript}
                  disabled={isGeneratingScript}
                  leftIcon={isGeneratingScript ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
                  className="w-full"
                >
                  {isGeneratingScript ? 'Generating...' : 'Generate Negotiation Script'}
                </Button>
              </CardContent>
            </Card>

            {/* Script Results */}
            {script && (
              <div className="space-y-6">
                <Card variant="elevated">
                  <CardContent className="p-6 space-y-6">
                    {/* Opening */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">Opening Statement</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(script.openingStatement, 'opening')}
                        >
                          {copiedSection === 'opening' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-slate-700 bg-slate-50 p-4 rounded-xl">{script.openingStatement}</p>
                    </div>

                    {/* Key Points */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Key Points to Make</h4>
                      <div className="space-y-3">
                        {script.keyPoints?.map((kp: any, i: number) => (
                          <div key={i} className="p-4 bg-indigo-50 rounded-xl">
                            <p className="font-medium text-indigo-900">{kp.point}</p>
                            <p className="text-sm text-indigo-700 mt-1">{kp.elaboration}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Responses */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">How to Respond</h4>
                      <div className="space-y-3">
                        {Object.entries(script.responses || {}).map(([key, value]) => (
                          <div key={key} className="p-4 bg-amber-50 rounded-xl">
                            <p className="font-medium text-amber-900 mb-1">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                            </p>
                            <p className="text-sm text-amber-800">{value as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Closing */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Closing Statement</h4>
                      <p className="text-slate-700 bg-slate-50 p-4 rounded-xl">{script.closingStatement}</p>
                    </div>

                    {/* Email Template */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">Email Template</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(script.emailTemplate, 'email')}
                        >
                          {copiedSection === 'email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <pre className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl whitespace-pre-wrap font-sans">
                        {script.emailTemplate}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
