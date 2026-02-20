'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { useFetchData } from '@/hooks/useFetchData';
import { useModal } from '@/hooks/useModal';
import {
  MessageSquare,
  Sparkles,
  Target,
  ChevronRight,
  ChevronDown,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Star,
  Send,
  RotateCcw,
  Briefcase,
  Building2,
  BookOpen,
  CheckCircle,
  XCircle,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  ClipboardList,
  Award,
  Ban,
  Heart,
  Edit3,
  Building,
  MapPin,
  DollarSign,
  Copy,
  FileText,
  Search,
  Factory,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { cn } from '@/lib/utils';
import api, { JobApplication } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Question {
  question: string;
  category: string;
  difficulty: string;
  tips?: string;
  sampleAnswer?: string;
  redFlagAnswers?: string[];
  followUpQuestions?: string[];
  starTemplate?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  scoringRubric?: {
    excellent: string;
    good: string;
    poor: string;
  };
}

interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  improvedAnswer: string;
  feedback: string;
}

export default function InterviewPrepPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [questionTypes, setQuestionTypes] = useState<string[]>(['behavioral', 'technical', 'situational']);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const sampleAnswerModal = useModal();
  const tipsModal = useModal();
  const [practiceMode, setPracticeMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const redFlagsModal = useModal();
  const followUpsModal = useModal();
  const starTemplateModal = useModal();
  const scoringRubricModal = useModal();

  // Saved jobs integration
  const { data: savedJobsData, isLoading: isLoadingSavedJobs, setData: setSavedJobsData } = useFetchData({
    fetchFn: () => api.getJobApplications(),
    errorMessage: 'Failed to load saved jobs',
    showErrorToast: false,
  });
  const savedJobs = savedJobsData?.applications || [];
  const [jobInputMode, setJobInputMode] = useState<'saved' | 'manual'>('saved');
  const [selectedJobId, setSelectedJobId] = useState('');
  const jobDropdownModal = useModal();

  // Resume experience helper
  const { data: resumes, isLoading: isLoadingResumes } = useFetchData({
    fetchFn: () => api.getResumes(),
    errorMessage: 'Failed to load resumes',
    showErrorToast: false,
  });
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const resumeDropdownModal = useModal();
  const [resumeExperiences, setResumeExperiences] = useState<string[]>([]);
  const experienceHelperModal = useModal();

  // Common questions with dependency on selectedCategory
  const { data: commonQuestionsData, isLoading: isLoadingCommonQuestions } = useFetchData({
    fetchFn: () => api.getCommonQuestions(selectedCategory === 'all' ? undefined : selectedCategory),
    errorMessage: 'Failed to load questions',
    showErrorToast: false,
    deps: [selectedCategory],
  });
  const commonQuestions = commonQuestionsData?.questions || [];

  // Copy state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleSelectSavedJob = (jobId: string) => {
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJobId(jobId);
      setJobTitle(job.jobTitle);
      setCompany(job.companyName);
      setJobDescription(job.jobDescription || '');
      jobDropdownModal.close();
      toast.success('Job details loaded!');
    }
  };

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    resumeDropdownModal.close();

    // Extract experience bullet points from resume
    const resume = resumes?.find((r) => r.id === resumeId);
    if (resume?.parsedData?.experience) {
      const experiences: string[] = [];
      resume.parsedData.experience.forEach((exp: any) => {
        const header = `${exp.title || 'Role'} at ${exp.company || 'Company'}`;
        experiences.push(`**${header}**`);
        if (exp.description && Array.isArray(exp.description)) {
          exp.description.slice(0, 3).forEach((desc: string) => {
            const cleanBullet = desc.replace(/^[•\-\*▪◦›●○]\s*/, '').trim();
            if (cleanBullet) experiences.push(`• ${cleanBullet}`);
          });
        }
      });
      setResumeExperiences(experiences.slice(0, 15));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const selectedJob = savedJobs?.find((j) => j.id === selectedJobId);
  const selectedResume = resumes?.find((r) => r.id === selectedResumeId);

  // Filter common questions by difficulty
  const filteredCommonQuestions = commonQuestions.filter((q) =>
    selectedDifficulty === 'all' || q.difficulty === selectedDifficulty
  );

  const handleGenerate = async () => {
    if (!jobTitle.trim()) {
      toast.error('Please enter a job title');
      return;
    }

    setIsGenerating(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setPracticeMode(false);

    try {
      const response = await api.generateInterviewQuestions({
        jobTitle,
        company: company || undefined,
        industry: industry || undefined,
        jobDescription: jobDescription || undefined,
        questionTypes: questionTypes as any,
      });

      if (response.success && response.data) {
        setQuestions(response.data.questions);
        setPracticeMode(true);
      }
    } catch (error) {
      toast.error('Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please write your answer first');
      return;
    }

    setIsEvaluating(true);
    setEvaluation(null);

    try {
      const response = await api.evaluateAnswer({
        question: questions[currentQuestionIndex].question,
        answer: userAnswer,
        jobTitle,
        company: company || undefined,
      });

      if (response.success && response.data) {
        setEvaluation(response.data);
      }
    } catch (error) {
      toast.error('Failed to evaluate answer');
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetPanels = () => {
    setUserAnswer('');
    setEvaluation(null);
    sampleAnswerModal.close();
    tipsModal.close();
    setShowRedFlags(false);
    setShowFollowUps(false);
    setShowStarTemplate(false);
    setShowScoringRubric(false);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetPanels();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetPanels();
    }
  };

  const startPracticeWithQuestion = (question: Question) => {
    setQuestions([question]);
    setCurrentQuestionIndex(0);
    setPracticeMode(true);
    resetPanels();
  };

  const toggleQuestionType = (type: string) => {
    if (questionTypes.includes(type)) {
      setQuestionTypes(questionTypes.filter((t) => t !== type));
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'behavioral':
        return 'bg-blue-100 text-blue-700';
      case 'technical':
        return 'bg-purple-100 text-purple-700';
      case 'situational':
        return 'bg-blue-100 text-blue-700';
      case 'company-specific':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          icon={<MessageSquare className="h-5 w-5" />}
          label="AI Interview Coach"
          title="Interview Prep"
          description="Practice with AI-generated questions tailored to your target role. Get instant feedback and improve your answers before the real interview."
        />

        {!practiceMode ? (
          <>
            {/* Setup Form */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Generate Custom Questions
                </CardTitle>
                <CardDescription>
                  Enter your target role to get tailored interview questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Source Toggle */}
                <SegmentedControl
                  options={[
                    { value: 'saved' as const, label: 'From Saved Jobs', icon: <Heart className="h-4 w-4" />, count: savedJobs.length },
                    { value: 'manual' as const, label: 'Enter Manually', icon: <Edit3 className="h-4 w-4" /> },
                  ]}
                  value={jobInputMode}
                  onChange={(mode) => {
                    setJobInputMode(mode);
                    if (mode === 'manual') {
                      setSelectedJobId('');
                    }
                  }}
                />

                {/* Saved Jobs Dropdown */}
                {jobInputMode === 'saved' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Select a Job Application</label>
                    {isLoadingSavedJobs ? (
                      <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl">
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                        <span className="text-slate-500">Loading saved jobs...</span>
                      </div>
                    ) : savedJobs.length === 0 ? (
                      <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center">
                        <Heart className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-600 font-medium text-sm">No job applications yet</p>
                        <p className="text-xs text-slate-500 mt-1">Add applications in the Job Tracker</p>
                        <div className="flex justify-center gap-2 mt-3">
                          <Link href="/job-tracker">
                            <Button variant="primary" size="sm" leftIcon={<Search className="h-4 w-4" />}>
                              Job Tracker
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => setJobInputMode('manual')}>
                            Enter Manually
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => jobDropdownModal.toggle()}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                          {selectedJob ? (
                            <span className="text-slate-900">{selectedJob.jobTitle} at {selectedJob.companyName}</span>
                          ) : (
                            <span className="text-slate-500">Select a job to practice for...</span>
                          )}
                          <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${jobDropdownModal.isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {jobDropdownModal.isOpen && (
                          <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {savedJobs.map((job) => (
                              <button
                                key={job.id}
                                type="button"
                                onClick={() => handleSelectSavedJob(job.id)}
                                className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-100 last:border-0 ${
                                  selectedJobId === job.id ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Building className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 truncate">{job.jobTitle}</p>
                                  <p className="text-sm text-slate-500 truncate">{job.companyName}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {job.location && (
                                      <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {job.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {savedJobs.length > 0 && (
                      <p className="mt-2 text-xs text-slate-500">
                        {savedJobs.length} job application{savedJobs.length !== 1 ? 's' : ''} available •{' '}
                        <Link href="/job-tracker" className="text-blue-600 hover:text-blue-700">Manage jobs</Link>
                      </p>
                    )}
                  </div>
                )}

                {/* Form fields - shown when manual mode or when a saved job is selected */}
                {(jobInputMode === 'manual' || (jobInputMode === 'saved' && selectedJobId)) && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Job Title *
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g. Software Engineer"
                            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            readOnly={jobInputMode === 'saved' && !!selectedJobId}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Company (optional)
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g. Google"
                            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            readOnly={jobInputMode === 'saved' && !!selectedJobId}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Industry (optional)
                      </label>
                      <div className="relative">
                        <Factory className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          placeholder="e.g. Technology, Finance, Healthcare"
                          className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Job Description (optional)
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description for more tailored questions..."
                        rows={3}
                        className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none ${
                          jobInputMode === 'saved' && selectedJobId ? 'bg-slate-50' : ''
                        }`}
                        readOnly={jobInputMode === 'saved' && !!selectedJobId}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Question Types
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['behavioral', 'technical', 'situational'].map((type) => (
                          <button
                            key={type}
                            onClick={() => toggleQuestionType(type)}
                            className={cn(
                              'px-4 py-2 rounded-full text-sm font-medium transition-all capitalize',
                              questionTypes.includes(type)
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleGenerate}
                      disabled={isGenerating || !jobTitle.trim()}
                      leftIcon={isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                      className="w-full"
                    >
                      {isGenerating ? 'Generating Questions...' : 'Generate Practice Questions'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Common Questions */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Common Interview Questions
                </CardTitle>
                <CardDescription>
                  Practice with frequently asked interview questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Category Filter */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'behavioral', 'situational', 'general'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize',
                          selectedCategory === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'easy', 'medium', 'hard'].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize',
                          selectedDifficulty === diff
                            ? diff === 'easy' ? 'bg-green-600 text-white'
                            : diff === 'medium' ? 'bg-amber-600 text-white'
                            : diff === 'hard' ? 'bg-red-600 text-white'
                            : 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Questions List */}
                {isLoadingCommonQuestions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <span className="ml-3 text-slate-500">Loading questions...</span>
                  </div>
                ) : filteredCommonQuestions.length === 0 ? (
                  <div className="py-12 text-center">
                    <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No questions found</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Try adjusting your filters or generate custom questions above
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCommonQuestions.slice(0, 5).map((q, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{q.question}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getCategoryColor(q.category)} size="sm">
                              {q.category}
                            </Badge>
                            <Badge className={getDifficultyColor(q.difficulty)} size="sm">
                              {q.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startPracticeWithQuestion(q)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Practice
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Practice Mode */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPracticeMode(false)}
              >
                Back to Setup
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2 h-2 rounded-full',
                        i === currentQuestionIndex
                          ? 'bg-blue-600'
                          : i < currentQuestionIndex
                          ? 'bg-green-500'
                          : 'bg-slate-300'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Current Question */}
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getCategoryColor(currentQuestion?.category)}>
                    {currentQuestion?.category}
                  </Badge>
                  <Badge className={getDifficultyColor(currentQuestion?.difficulty)}>
                    {currentQuestion?.difficulty}
                  </Badge>
                </div>

                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  {currentQuestion?.question}
                </h2>

                {/* Preparation Helpers */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentQuestion?.tips && (
                    <button
                      onClick={() => tipsModal.toggle()}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        tipsModal.isOpen
                          ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      <Lightbulb className="h-4 w-4" />
                      Tips
                    </button>
                  )}
                  {currentQuestion?.starTemplate && (
                    <button
                      onClick={() => starTemplateModal.toggle()}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        starTemplateModal.isOpen
                          ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      <ClipboardList className="h-4 w-4" />
                      STAR Template
                    </button>
                  )}
                  {currentQuestion?.redFlagAnswers && currentQuestion.redFlagAnswers.length > 0 && (
                    <button
                      onClick={() => redFlagsModal.toggle()}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        redFlagsModal.isOpen
                          ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      <Ban className="h-4 w-4" />
                      Red Flags
                    </button>
                  )}
                  {currentQuestion?.followUpQuestions && currentQuestion.followUpQuestions.length > 0 && (
                    <button
                      onClick={() => followUpsModal.toggle()}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        followUpsModal.isOpen
                          ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Follow-ups
                    </button>
                  )}
                  {currentQuestion?.scoringRubric && (
                    <button
                      onClick={() => scoringRubricModal.toggle()}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        scoringRubricModal.isOpen
                          ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      <Award className="h-4 w-4" />
                      Scoring Guide
                    </button>
                  )}
                </div>

                {/* Tips Panel */}
                {tipsModal.isOpen && currentQuestion?.tips && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                      <h4 className="font-medium text-amber-900">Answering Tips</h4>
                    </div>
                    <p className="text-sm text-amber-800">{currentQuestion.tips}</p>
                  </div>
                )}

                {/* STAR Template Panel */}
                {starTemplateModal.isOpen && currentQuestion?.starTemplate && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ClipboardList className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-blue-900">STAR Method Template</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">S</span>
                        <div>
                          <p className="font-medium text-blue-900 text-sm">Situation</p>
                          <p className="text-sm text-blue-700">{currentQuestion.starTemplate.situation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">T</span>
                        <div>
                          <p className="font-medium text-blue-900 text-sm">Task</p>
                          <p className="text-sm text-blue-700">{currentQuestion.starTemplate.task}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">A</span>
                        <div>
                          <p className="font-medium text-blue-900 text-sm">Action</p>
                          <p className="text-sm text-blue-700">{currentQuestion.starTemplate.action}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">R</span>
                        <div>
                          <p className="font-medium text-blue-900 text-sm">Result</p>
                          <p className="text-sm text-blue-700">{currentQuestion.starTemplate.result}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Red Flag Answers Panel */}
                {redFlagsModal.isOpen && currentQuestion?.redFlagAnswers && currentQuestion.redFlagAnswers.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Ban className="h-4 w-4 text-red-600" />
                      <h4 className="font-medium text-red-900">Answers to Avoid</h4>
                    </div>
                    <ul className="space-y-2">
                      {currentQuestion.redFlagAnswers.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow-up Questions Panel */}
                {followUpsModal.isOpen && currentQuestion?.followUpQuestions && currentQuestion.followUpQuestions.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <HelpCircle className="h-4 w-4 text-purple-600" />
                      <h4 className="font-medium text-purple-900">Likely Follow-up Questions</h4>
                    </div>
                    <ul className="space-y-2">
                      {currentQuestion.followUpQuestions.map((followUp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-purple-800">
                          <ChevronRight className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                          <span>{followUp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Scoring Rubric Panel */}
                {scoringRubricModal.isOpen && currentQuestion?.scoringRubric && (
                  <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-700 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-4 w-4 text-slate-600" />
                      <h4 className="font-medium text-slate-900">Self-Evaluation Guide</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-green-100/50 rounded-lg border border-green-200">
                        <p className="font-medium text-green-800 text-sm mb-1">Excellent</p>
                        <p className="text-xs text-green-700">{currentQuestion.scoringRubric.excellent}</p>
                      </div>
                      <div className="p-3 bg-amber-100/50 rounded-lg border border-amber-200">
                        <p className="font-medium text-amber-800 text-sm mb-1">Good</p>
                        <p className="text-xs text-amber-700">{currentQuestion.scoringRubric.good}</p>
                      </div>
                      <div className="p-3 bg-red-100/50 rounded-lg border border-red-200">
                        <p className="font-medium text-red-800 text-sm mb-1">Needs Work</p>
                        <p className="text-xs text-red-700">{currentQuestion.scoringRubric.poor}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resume Experience Helper */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => experienceHelperModal.toggle()}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                      experienceHelperModal.isOpen
                        ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    Use My Experience
                  </button>
                </div>

                {experienceHelperModal.isOpen && (
                  <div className="mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <h4 className="font-medium text-emerald-900">Your Experience</h4>
                      </div>
                    </div>

                    {/* Resume Selection */}
                    {isLoadingResumes ? (
                      <div className="flex items-center gap-2 py-3">
                        <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
                        <span className="text-emerald-700 text-sm">Loading resumes...</span>
                      </div>
                    ) : resumes.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-emerald-700 text-sm">No resumes found</p>
                        <Link href="/resumes">
                          <Button variant="outline" size="sm" className="mt-2">
                            Upload Resume
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="relative mb-3">
                          <button
                            type="button"
                            onClick={() => resumeDropdownModal.toggle()}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-emerald-200 bg-white text-slate-900 hover:border-emerald-300 text-sm"
                          >
                            {selectedResume ? (
                              <span>{selectedResume.title || selectedResume.fileName}</span>
                            ) : (
                              <span className="text-slate-500">Select a resume to pull experience from...</span>
                            )}
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${resumeDropdownModal.isOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {resumeDropdownModal.isOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {(resumes || []).map((resume) => (
                                <button
                                  key={resume.id}
                                  type="button"
                                  onClick={() => handleSelectResume(resume.id)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 text-left text-sm ${
                                    selectedResumeId === resume.id ? 'bg-emerald-50' : ''
                                  }`}
                                >
                                  <FileText className="h-4 w-4 text-emerald-600" />
                                  <span className="truncate">{resume.title || resume.fileName}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Experience bullets */}
                        {selectedResumeId && resumeExperiences.length > 0 && (
                          <div className="max-h-40 overflow-y-auto bg-white rounded-lg border border-emerald-200 divide-y divide-emerald-100">
                            {resumeExperiences.map((exp, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  'px-3 py-2 text-sm',
                                  exp.startsWith('**') ? 'font-medium text-emerald-800 bg-emerald-50' : 'text-slate-700'
                                )}
                              >
                                {exp.replace(/\*\*/g, '')}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-emerald-600 mt-2">
                          Use these experiences to craft your answers with real examples
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Answer Input */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Your Answer
                  </label>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />

                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      onClick={handleEvaluate}
                      disabled={isEvaluating || !userAnswer.trim()}
                      leftIcon={isEvaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    >
                      {isEvaluating ? 'Evaluating...' : 'Get AI Feedback'}
                    </Button>

                    {currentQuestion?.sampleAnswer && (
                      <Button
                        variant="outline"
                        onClick={() => sampleAnswerModal.toggle()}
                      >
                        {sampleAnswerModal.isOpen ? 'Hide Sample Answer' : 'See Sample Answer'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sample Answer */}
                {sampleAnswerModal.isOpen && currentQuestion?.sampleAnswer && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-900">Sample Answer</h4>
                      <button
                        onClick={() => copyToClipboard(currentQuestion.sampleAnswer!)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {copiedText === currentQuestion.sampleAnswer ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-blue-800">{currentQuestion.sampleAnswer}</p>
                  </div>
                )}

                {/* Evaluation */}
                {evaluation && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">Score:</span>
                        <div className="flex items-center gap-1">
                          {[...Array(10)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-5 w-5',
                                i < evaluation.score
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300'
                              )}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-blue-600">{evaluation.score}/10</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <h4 className="font-medium text-green-900 flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {evaluation.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <h4 className="font-medium text-amber-900 flex items-center gap-2 mb-2">
                          <XCircle className="h-4 w-4" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1">
                          {evaluation.improvements.map((item, idx) => (
                            <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                              <span className="text-amber-500 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-medium text-slate-900 mb-2">Feedback</h4>
                      <p className="text-sm text-slate-700">{evaluation.feedback}</p>
                    </div>

                    {evaluation.improvedAnswer && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-blue-900">Improved Version</h4>
                          <button
                            onClick={() => copyToClipboard(evaluation.improvedAnswer)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {copiedText === evaluation.improvedAnswer ? (
                              <>
                                <CheckCircle className="h-3.5 w-3.5" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-blue-800">{evaluation.improvedAnswer}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next Question
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
