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

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setEvaluation(null);
      setShowSampleAnswer(false);
      setShowTips(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer('');
      setEvaluation(null);
      setShowSampleAnswer(false);
      setShowTips(false);
    }
  };

  const startPracticeWithQuestion = (question: Question) => {
    setQuestions([question]);
    setCurrentQuestionIndex(0);
    setPracticeMode(true);
    setUserAnswer('');
    setEvaluation(null);
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

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Interview Prep</h1>
            <p className="mt-1 text-slate-500">Practice interview questions and get AI feedback</p>
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
                  <Badge className={getCategoryColor(questions[currentQuestionIndex]?.category)}>
                    {questions[currentQuestionIndex]?.category}
                  </Badge>
                  <Badge className={getDifficultyColor(questions[currentQuestionIndex]?.difficulty)}>
                    {questions[currentQuestionIndex]?.difficulty}
                  </Badge>
                </div>

                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  {questions[currentQuestionIndex]?.question}
                </h2>

                {/* Tips Toggle */}
                {questions[currentQuestionIndex]?.tips && (
                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 mb-4"
                  >
                    <Lightbulb className="h-4 w-4" />
                    {showTips ? 'Hide Tips' : 'Show Tips'}
                    <ChevronDown className={cn('h-4 w-4 transition-transform', showTips && 'rotate-180')} />
                  </button>
                )}

                {showTips && questions[currentQuestionIndex]?.tips && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-4">
                    <p className="text-sm text-amber-800">{questions[currentQuestionIndex].tips}</p>
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

                    {questions[currentQuestionIndex]?.sampleAnswer && (
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
                {showSampleAnswer && questions[currentQuestionIndex]?.sampleAnswer && (
                  <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <h4 className="font-medium text-indigo-900 mb-2">Sample Answer</h4>
                    <p className="text-sm text-indigo-800">{questions[currentQuestionIndex].sampleAnswer}</p>
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
                          {evaluation.improvements.map((i, idx) => (
                            <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                              <span className="text-amber-500 mt-1">•</span>
                              {i}
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
