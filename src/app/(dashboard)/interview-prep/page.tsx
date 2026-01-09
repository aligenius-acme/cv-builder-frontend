'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [commonQuestions, setCommonQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRedFlags, setShowRedFlags] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [showStarTemplate, setShowStarTemplate] = useState(false);
  const [showScoringRubric, setShowScoringRubric] = useState(false);

  useEffect(() => {
    loadCommonQuestions();
  }, [selectedCategory]);

  const loadCommonQuestions = async () => {
    try {
      const response = await api.getCommonQuestions(selectedCategory === 'all' ? undefined : selectedCategory);
      if (response.success && response.data) {
        setCommonQuestions(response.data.questions);
      }
    } catch (error) {
      // Silent fail for common questions
    }
  };

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
    setShowSampleAnswer(false);
    setShowTips(false);
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
        return 'bg-indigo-100 text-indigo-700';
      case 'company-specific':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 text-white">
          <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5" />
              <span className="text-white/80 text-sm font-medium">AI Interview Coach</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Interview Prep</h1>
            <p className="text-white/80 text-lg max-w-2xl">
              Practice with AI-generated questions tailored to your target role. Get instant feedback
              and improve your answers before the real interview.
            </p>
          </div>
        </div>

        {!practiceMode ? (
          <>
            {/* Setup Form */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Generate Custom Questions
                </CardTitle>
                <CardDescription>
                  Enter your target role to get tailored interview questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                      <Building2 className="h-4 w-4 inline mr-1" />
                      Company (optional)
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Industry (optional)
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Technology, Finance, Healthcare"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Job Description (optional)
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description for more tailored questions..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  leftIcon={isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                  className="w-full"
                >
                  {isGenerating ? 'Generating Questions...' : 'Generate Practice Questions'}
                </Button>
              </CardContent>
            </Card>

            {/* Common Questions */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  Common Interview Questions
                </CardTitle>
                <CardDescription>
                  Practice with frequently asked interview questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  {['all', 'behavioral', 'situational', 'general'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize',
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {commonQuestions.slice(0, 5).map((q, i) => (
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
                          ? 'bg-indigo-600'
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
                      onClick={() => setShowTips(!showTips)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        showTips
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
                      onClick={() => setShowStarTemplate(!showStarTemplate)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        showStarTemplate
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
                      onClick={() => setShowRedFlags(!showRedFlags)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        showRedFlags
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
                      onClick={() => setShowFollowUps(!showFollowUps)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        showFollowUps
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
                      onClick={() => setShowScoringRubric(!showScoringRubric)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        showScoringRubric
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
                {showTips && currentQuestion?.tips && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                      <h4 className="font-medium text-amber-900">Answering Tips</h4>
                    </div>
                    <p className="text-sm text-amber-800">{currentQuestion.tips}</p>
                  </div>
                )}

                {/* STAR Template Panel */}
                {showStarTemplate && currentQuestion?.starTemplate && (
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
                {showRedFlags && currentQuestion?.redFlagAnswers && currentQuestion.redFlagAnswers.length > 0 && (
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
                {showFollowUps && currentQuestion?.followUpQuestions && currentQuestion.followUpQuestions.length > 0 && (
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
                {showScoringRubric && currentQuestion?.scoringRubric && (
                  <div className="p-4 bg-gradient-to-r from-green-50 via-amber-50 to-red-50 rounded-xl border border-slate-200 mb-4">
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
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />

                  <div className="flex gap-3">
                    <Button
                      variant="gradient"
                      onClick={handleEvaluate}
                      disabled={isEvaluating || !userAnswer.trim()}
                      leftIcon={isEvaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    >
                      {isEvaluating ? 'Evaluating...' : 'Get AI Feedback'}
                    </Button>

                    {currentQuestion?.sampleAnswer && (
                      <Button
                        variant="outline"
                        onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                      >
                        {showSampleAnswer ? 'Hide Sample Answer' : 'See Sample Answer'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sample Answer */}
                {showSampleAnswer && currentQuestion?.sampleAnswer && (
                  <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <h4 className="font-medium text-indigo-900 mb-2">Sample Answer</h4>
                    <p className="text-sm text-indigo-800">{currentQuestion.sampleAnswer}</p>
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
                        <span className="font-bold text-indigo-600">{evaluation.score}/10</span>
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
                      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                        <h4 className="font-medium text-indigo-900 mb-2">Improved Version</h4>
                        <p className="text-sm text-indigo-800">{evaluation.improvedAnswer}</p>
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
                    variant="gradient"
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
