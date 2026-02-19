'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  FileText,
  Search,
  Filter,
  ChevronRight,
  Briefcase,
  GraduationCap,
  Code,
  Stethoscope,
  DollarSign,
  Palette,
  Megaphone,
  Building2,
  Users,
  Truck,
  BookOpen,
  X,
  Star,
  Lightbulb,
  Copy,
  Check,
} from 'lucide-react';
import api, { ResumeExample } from '@/lib/api';
import toast from 'react-hot-toast';

const industryIcons: Record<string, React.ReactNode> = {
  Technology: <Code className="h-5 w-5" />,
  Healthcare: <Stethoscope className="h-5 w-5" />,
  Finance: <DollarSign className="h-5 w-5" />,
  Design: <Palette className="h-5 w-5" />,
  Marketing: <Megaphone className="h-5 w-5" />,
  Engineering: <Building2 className="h-5 w-5" />,
  'Human Resources': <Users className="h-5 w-5" />,
  Operations: <Truck className="h-5 w-5" />,
  Education: <BookOpen className="h-5 w-5" />,
  General: <Briefcase className="h-5 w-5" />,
};

const experienceLevelColors: Record<string, string> = {
  'Entry Level': 'bg-green-100 text-green-700',
  'Mid Level': 'bg-blue-100 text-blue-700',
  'Senior Level': 'bg-purple-100 text-purple-700',
  Executive: 'bg-amber-100 text-amber-700',
};

interface OccupationItem {
  id: string;
  title: string;
  industry: string;
}

export default function ResumeExamplesPage() {
  const [examples, setExamples] = useState<ResumeExample[]>([]);
  const [occupations, setOccupations] = useState<OccupationItem[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOccupation, setSelectedOccupation] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedExample, setSelectedExample] = useState<ResumeExample | null>(null);
  const [copiedBullet, setCopiedBullet] = useState<string | null>(null);

  useEffect(() => {
    loadExamples();
  }, [selectedOccupation, selectedIndustry]);

  const loadExamples = async () => {
    try {
      setIsLoading(true);
      const params: { occupation?: string; industry?: string } = {};
      if (selectedOccupation) params.occupation = selectedOccupation;
      if (selectedIndustry) params.industry = selectedIndustry;

      const response = await api.getResumeExamples(params);
      if (response.success && response.data) {
        setExamples(response.data.examples || []);
        const occs = response.data.occupations || [];
        if (occs.length > 0) {
          setOccupations(occs);
        }
        // Use industries from response if available, otherwise extract from occupations
        if (response.data.industries?.length > 0) {
          setIndustries(response.data.industries);
        } else if (occs.length > 0) {
          const uniqueIndustries = [...new Set(occs.map((o: OccupationItem) => o.industry))];
          setIndustries(uniqueIndustries);
        }
      }
    } catch (error) {
      toast.error('Failed to load resume examples');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExamples = examples.filter((example) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      example.title.toLowerCase().includes(search) ||
      example.occupation.toLowerCase().includes(search) ||
      example.industry.toLowerCase().includes(search)
    );
  });

  const copyBullet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(text);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PageHeader
          icon={<FileText className="h-5 w-5" />}
          label="Resume Examples Library"
          title="Professional Resume Examples"
          description="Browse our collection of professionally written resume examples. Get inspired by real resume content and copy bullet points directly to your resume."
        />

        {/* Filters */}
        <Card variant="elevated">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by job title, industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Industry Filter */}
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-900 min-w-[180px]"
              >
                <option value="" className="text-slate-500">All Industries</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>

              {/* Occupation Filter */}
              <select
                value={selectedOccupation}
                onChange={(e) => setSelectedOccupation(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-900 min-w-[200px]"
              >
                <option value="" className="text-slate-500">All Occupations</option>
                {occupations.map((occ) => (
                  <option key={occ.id} value={occ.id}>{occ.title}</option>
                ))}
              </select>

              {(selectedIndustry || selectedOccupation || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedIndustry('');
                    setSelectedOccupation('');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Examples Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} variant="elevated" className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredExamples.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No examples found</h3>
              <p className="text-slate-500">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExamples.map((example) => (
              <Card
                key={example.id}
                variant="elevated"
                hover
                className="cursor-pointer group"
                onClick={() => setSelectedExample(example)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                      {industryIcons[example.industry] || <Briefcase className="h-5 w-5" />}
                    </div>
                    <Badge className={experienceLevelColors[example.experienceLevel] || 'bg-slate-100 text-slate-600'}>
                      {example.experienceLevel}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
                    {example.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">{example.occupation}</p>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{example.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {(example.skills || []).slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {(example.skills || []).length > 3 && (
                      <span className="text-xs text-slate-400">+{(example.skills || []).length - 3} more</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Example Detail Modal */}
        {selectedExample && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="bg-amber-600 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-white/20 text-white border-0">
                        {selectedExample.industry}
                      </Badge>
                      <Badge className="bg-white/20 text-white border-0">
                        {selectedExample.experienceLevel}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{selectedExample.title}</h2>
                    <p className="text-white/80">{selectedExample.occupation}</p>
                  </div>
                  <button
                    onClick={() => setSelectedExample(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Summary */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Professional Summary
                  </h3>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {selectedExample.previewContent?.summary || selectedExample.summary}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => copyBullet(selectedExample.previewContent?.summary || selectedExample.summary || '')}
                  >
                    {copiedBullet === (selectedExample.previewContent?.summary || selectedExample.summary) ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Summary
                      </>
                    )}
                  </Button>
                </div>

                {/* Experience */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Experience Examples
                  </h3>
                  <div className="space-y-4">
                    {(selectedExample.previewContent?.experience || []).map((exp, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-slate-900">{exp.title}</h4>
                            <p className="text-sm text-slate-500">{exp.company}</p>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {(exp.bullets || []).map((bullet, bulletIdx) => (
                            <li
                              key={bulletIdx}
                              className="flex items-start gap-2 group/bullet"
                            >
                              <span className="text-amber-500 mt-1.5">•</span>
                              <span className="text-slate-700 flex-1">{bullet}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyBullet(bullet);
                                }}
                                className="opacity-0 group-hover/bullet:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                                title="Copy bullet point"
                              >
                                {copiedBullet === bullet ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-slate-400" />
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Key Highlights
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedExample.highlights || []).map((highlight, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-sm"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Skills Featured
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedExample.skills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 p-4 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setSelectedExample(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
