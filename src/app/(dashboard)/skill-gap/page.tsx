'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  GraduationCap,
  Search,
  Target,
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Loader2,
  Plus,
  X,
  Briefcase,
  Building2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import api, { SkillGapAnalysis, JobApplication } from '@/lib/api';
import { Resume } from '@/types';
import toast from 'react-hot-toast';
import PageHeader from '@/components/shared/PageHeader';
import { ButtonSpinner } from '@/components/shared/LoadingSpinner';
import { getScoreColor } from '@/lib/colors';

const importanceColors: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  important: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'nice-to-have': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

const resourceTypeIcons: Record<string, React.ReactNode> = {
  course: <BookOpen className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  article: <FileText className="h-4 w-4" />,
  certification: <GraduationCap className="h-4 w-4" />,
};

export default function SkillGapPage() {
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [industry, setIndustry] = useState('');
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Saved jobs and resumes state
  const [savedJobs, setSavedJobs] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadSupportingData();
  }, []);

  const loadSupportingData = async () => {
    try {
      const [jobsRes, resumesRes] = await Promise.all([
        api.getJobApplications().catch(() => ({ success: false, data: null })),
        api.getResumes().catch(() => ({ success: false, data: null })),
      ]);

      if (jobsRes.success && jobsRes.data) {
        setSavedJobs(jobsRes.data.applications || []);
      }
      if (resumesRes.success && resumesRes.data) {
        setResumes(resumesRes.data || []);
      }
    } catch (error) {
      // Silent fail
    } finally {
      setIsLoadingData(false);
    }
  };

  const selectSavedJob = (job: JobApplication) => {
    setTargetRole(job.jobTitle);
    if (job.location) {
      // Optionally extract industry from job info
    }
    setShowJobDropdown(false);
    toast.success(`Using "${job.jobTitle}" as target role`);
  };

  const loadSkillsFromResume = async (resume: Resume) => {
    try {
      const response = await api.getResume(resume.id);
      if (response.success && response.data?.parsedData) {
        const skills = response.data.parsedData.skills || [];
        if (skills.length > 0) {
          const newSkills = skills.filter((s: string) => !currentSkills.includes(s));
          setCurrentSkills([...currentSkills, ...newSkills]);
          toast.success(`Added ${newSkills.length} skills from "${resume.title}"`);
        } else {
          toast.error('No skills found in this resume');
        }
      }
    } catch (error) {
      toast.error('Failed to load resume skills');
    }
    setShowResumeDropdown(false);
  };

  const addSkill = () => {
    if (skillInput.trim() && !currentSkills.includes(skillInput.trim())) {
      setCurrentSkills([...currentSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setCurrentSkills(currentSkills.filter((s) => s !== skill));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const analyzeGaps = async () => {
    if (!targetRole || currentSkills.length === 0) {
      toast.error('Please enter a target role and at least one skill');
      return;
    }

    try {
      setIsAnalyzing(true);
      const response = await api.analyzeSkillGap({
        currentSkills,
        targetRole,
        experienceLevel: experienceLevel || undefined,
        industry: industry || undefined,
      });

      if (response.success && response.data) {
        setAnalysis(response.data);
        toast.success('Skill gap analysis complete');
      }
    } catch (error) {
      toast.error('Failed to analyze skill gap');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PageHeader
          icon={<GraduationCap className="h-5 w-5" />}
          label="Career Development"
          title="Skill Gap Analyzer"
          description="Identify the skills you need to land your target role. Get personalized learning paths and resource recommendations to bridge the gap."
          gradient="purple"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Your Target
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Briefcase className="h-4 w-4 inline mr-1" />
                    Target Role *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {savedJobs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowJobDropdown(!showJobDropdown)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-purple-50 rounded-lg text-purple-600"
                        title="Select from saved jobs"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {showJobDropdown && savedJobs.length > 0 && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                      <div className="p-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                      {savedJobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => selectSavedJob(job)}
                          className="w-full text-left px-3 py-2.5 hover:bg-purple-50 transition-colors flex items-start gap-3"
                        >
                          <Briefcase className="h-4 w-4 text-purple-600 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{job.jobTitle}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {job.companyName}
                              </span>
                              {job.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                              )}
                            </p>
                          </div>
                        </button>
                      ))}
                      <div className="p-2 border-t border-slate-100 bg-slate-50">
                        <Link href="/job-tracker">
                          <p className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1">
                            Manage jobs in Job Tracker <ChevronRight className="h-3 w-3" />
                          </p>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-slate-900"
                  >
                    <option value="" className="text-slate-500">Select level</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (2-5 years)</option>
                    <option value="senior">Senior (5-10 years)</option>
                    <option value="lead">Lead/Principal (10+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-slate-900"
                  >
                    <option value="" className="text-slate-500">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="consulting">Consulting</option>
                    <option value="startup">Startup</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-600" />
                    Your Current Skills
                  </span>
                  {resumes.length > 0 && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowResumeDropdown(!showResumeDropdown)}
                        leftIcon={<FileText className="h-4 w-4" />}
                      >
                        Import from Resume
                      </Button>
                      {showResumeDropdown && (
                        <div className="absolute z-20 right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                          <div className="p-2 border-b border-slate-100">
                            <p className="text-xs text-slate-500">Select a resume to import skills</p>
                          </div>
                          {resumes.filter(r => r.parseStatus === 'completed').map((resume) => (
                            <button
                              key={resume.id}
                              type="button"
                              onClick={() => loadSkillsFromResume(resume)}
                              className="w-full text-left px-3 py-2.5 hover:bg-purple-50 transition-colors flex items-center gap-3"
                            >
                              <FileText className="h-4 w-4 text-purple-600" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">{resume.title}</p>
                                <p className="text-xs text-slate-500">{resume.fileName}</p>
                              </div>
                            </button>
                          ))}
                          {resumes.filter(r => r.parseStatus === 'completed').length === 0 && (
                            <div className="p-3 text-center text-sm text-slate-500">
                              No parsed resumes available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a skill..."
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Button variant="primary" onClick={addSkill}>
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {currentSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm group"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="p-0.5 hover:bg-purple-200 rounded-full transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Add your current skills to get started
                  </p>
                )}

                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={analyzeGaps}
                  disabled={isAnalyzing || !targetRole || currentSkills.length === 0}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Analyze Skill Gap
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {!analysis ? (
              <Card variant="elevated">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <GraduationCap className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Ready to Analyze Your Skills
                  </h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Enter your target role and current skills to discover what you need to learn
                    to land your dream job.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Readiness Score */}
                <Card variant="elevated">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          Role Readiness Score
                        </h3>
                        <p className="text-slate-500">
                          For <span className="font-medium text-slate-700">{analysis.targetRole}</span>
                        </p>
                      </div>
                      <div className="text-center">
                        <div className={`text-5xl font-bold ${getScoreColor(analysis.overallReadiness)}`}>
                          {analysis.overallReadiness}%
                        </div>
                        <p className="text-sm text-slate-500">ready</p>
                      </div>
                    </div>
                    <div className="mt-4 bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.overallReadiness}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Match */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card variant="elevated" className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-green-700 flex items-center gap-2 text-base">
                        <CheckCircle className="h-5 w-5" />
                        Skills You Have
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.currentSkillsMatched.map((skill) => (
                          <span
                            key={skill}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="elevated" className="bg-red-50 border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-red-700 flex items-center gap-2 text-base">
                        <AlertCircle className="h-5 w-5" />
                        Skills to Develop
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingSkills.slice(0, 6).map((skill) => (
                          <span
                            key={skill.skill}
                            className={`${importanceColors[skill.importance].bg} ${importanceColors[skill.importance].text} px-3 py-1 rounded-full text-sm`}
                          >
                            {skill.skill}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Missing Skills Details */}
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      Skills to Develop
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.missingSkills.map((skill) => (
                        <div
                          key={skill.skill}
                          className={`p-4 rounded-xl border ${importanceColors[skill.importance].border} ${importanceColors[skill.importance].bg}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className={`font-semibold ${importanceColors[skill.importance].text}`}>
                              {skill.skill}
                            </h4>
                            <Badge className={`${importanceColors[skill.importance].bg} ${importanceColors[skill.importance].text} border-0`}>
                              {skill.importance}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {skill.learningResources.map((resource, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between bg-white/50 p-2 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  {resourceTypeIcons[resource.type] || <FileText className="h-4 w-4" />}
                                  <span className="text-sm text-slate-700">{resource.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {resource.duration && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {resource.duration}
                                    </span>
                                  )}
                                  {resource.url && (
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-600 hover:text-purple-700"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Path */}
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Suggested Learning Path
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {analysis.learningPath.map((phase, idx) => (
                        <div key={idx} className="relative pl-8 pb-8 last:pb-0">
                          {/* Timeline line */}
                          {idx < analysis.learningPath.length - 1 && (
                            <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-purple-200" />
                          )}
                          {/* Timeline dot */}
                          <div className="absolute left-0 top-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-slate-900">{phase.phase}</h4>
                              <span className="text-sm text-slate-500 flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {phase.duration}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {phase.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <div className="space-y-1">
                              {phase.milestones.map((milestone, mIdx) => (
                                <div key={mIdx} className="flex items-center gap-2 text-sm text-slate-600">
                                  <ChevronRight className="h-4 w-4 text-purple-500" />
                                  {milestone}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-purple-600" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-slate-700">{rec}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
