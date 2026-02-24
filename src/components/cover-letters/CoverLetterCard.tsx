'use client';

import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  FileText,
  Trash2,
  Download,
  Building,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  Lightbulb,
  Mail,
  MessageSquare,
  Target,
  Wand2,
  Edit3,
  ChevronRight,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface EnhancedCoverLetter {
  id: string;
  jobTitle: string;
  companyName: string;
  content: string;
  tone: string;
  createdAt: string;
  alternativeOpenings?: string[];
  keyPhrases?: string[];
  toneAnalysis?: {
    current: string;
    score: number;
    suggestions?: string[];
  };
  callToActionVariations?: string[];
  subjectLineOptions?: string[];
}

interface CoverLetterCardProps {
  coverLetter: EnhancedCoverLetter;
  index: number;
  expanded: boolean;
  showEnhancements: boolean;
  copiedItem: string | null;
  onExpand: () => void;
  onToggleEnhancements: () => void;
  onCopy: (text: string, id: string) => void;
  onDownload: (id: string, format: 'pdf' | 'docx') => void;
  onDelete: (id: string) => void;
}

export default function CoverLetterCard({
  coverLetter,
  index,
  expanded,
  showEnhancements,
  copiedItem,
  onExpand,
  onToggleEnhancements,
  onCopy,
  onDownload,
  onDelete,
}: CoverLetterCardProps) {
  return (
    <Card
      variant="elevated"
      className="group hover:border-purple-300 hover:shadow-md transition-all duration-200"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="py-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                {coverLetter.jobTitle}
              </h3>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                {coverLetter.companyName}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="info" size="sm">{coverLetter.tone}</Badge>
                <span className="text-xs text-slate-400">{formatDate(coverLetter.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onDownload(coverLetter.id, 'pdf')}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="Download PDF"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => onCopy(coverLetter.content, coverLetter.id)}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="Copy content"
            >
              {copiedItem === coverLetter.id ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => onDelete(coverLetter.id)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cover Letter Content */}
        <div className="p-4 bg-slate-50 rounded-xl mb-4">
          <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-4">
            {coverLetter.content}
          </p>
          <button
            onClick={onExpand}
            className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            {expanded ? (
              <>
                Show less
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Read full letter
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
          {expanded && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {coverLetter.content}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced AI Features Section */}
        {(coverLetter.alternativeOpenings || coverLetter.subjectLineOptions || coverLetter.callToActionVariations) && (
          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={onToggleEnhancements}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-3"
            >
              <Wand2 className="h-4 w-4" />
              {showEnhancements ? 'Hide' : 'Show'} AI Alternatives & Enhancements
              {showEnhancements ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showEnhancements && (
              <div className="space-y-4 animate-slide-up">
                {/* Subject Line Options */}
                {coverLetter.subjectLineOptions && coverLetter.subjectLineOptions.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Subject Lines
                    </h4>
                    <div className="space-y-2">
                      {coverLetter.subjectLineOptions.map((subject, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
                          <span className="text-sm text-slate-700">{subject}</span>
                          <button
                            onClick={() => onCopy(subject, `subject-${coverLetter.id}-${idx}`)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                          >
                            {copiedItem === `subject-${coverLetter.id}-${idx}` ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alternative Openings */}
                {coverLetter.alternativeOpenings && coverLetter.alternativeOpenings.length > 0 && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      Alternative Opening Paragraphs
                    </h4>
                    <div className="space-y-3">
                      {coverLetter.alternativeOpenings.map((opening, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 border border-purple-100">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <Badge className="bg-purple-100 text-purple-700 mb-2">Option {idx + 1}</Badge>
                              <p className="text-sm text-slate-700">{opening}</p>
                            </div>
                            <button
                              onClick={() => onCopy(opening, `opening-${coverLetter.id}-${idx}`)}
                              className="text-purple-600 hover:text-purple-700 p-1 flex-shrink-0"
                            >
                              {copiedItem === `opening-${coverLetter.id}-${idx}` ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Call to Action Variations */}
                {coverLetter.callToActionVariations && coverLetter.callToActionVariations.length > 0 && (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Call-to-Action Closing Variations
                    </h4>
                    <div className="space-y-2">
                      {coverLetter.callToActionVariations.map((cta, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-emerald-100">
                          <span className="text-sm text-slate-700">{cta}</span>
                          <button
                            onClick={() => onCopy(cta, `cta-${coverLetter.id}-${idx}`)}
                            className="text-emerald-600 hover:text-emerald-700 p-1"
                          >
                            {copiedItem === `cta-${coverLetter.id}-${idx}` ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Phrases */}
                {coverLetter.keyPhrases && coverLetter.keyPhrases.length > 0 && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Key Phrases to Highlight
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {coverLetter.keyPhrases.map((phrase, idx) => (
                        <Badge
                          key={idx}
                          className="bg-white text-amber-700 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                          onClick={() => onCopy(phrase, `phrase-${coverLetter.id}-${idx}`)}
                        >
                          {copiedItem === `phrase-${coverLetter.id}-${idx}` ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : null}
                          {phrase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tone Analysis */}
                {coverLetter.toneAnalysis && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Tone Analysis
                    </h4>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm text-slate-600">Current Tone:</span>
                      <Badge className="bg-slate-100 text-slate-700">{coverLetter.toneAnalysis.current}</Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Score:</span>
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              coverLetter.toneAnalysis.score >= 80 ? 'bg-emerald-500' :
                              coverLetter.toneAnalysis.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${coverLetter.toneAnalysis.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{coverLetter.toneAnalysis.score}%</span>
                      </div>
                    </div>
                    {coverLetter.toneAnalysis.suggestions && coverLetter.toneAnalysis.suggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <span className="text-xs font-medium text-slate-500 uppercase">Suggestions:</span>
                        <ul className="mt-1 space-y-1">
                          {coverLetter.toneAnalysis.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                              <ChevronRight className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
