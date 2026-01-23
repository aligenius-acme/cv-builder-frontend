'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  TrendingUp,
  ArrowRight,
  Zap,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AIWritingAssistantProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  context?: {
    jobTitle?: string;
    industry?: string;
    section?: 'experience' | 'summary' | 'skills' | 'education';
  };
  className?: string;
  minRows?: number;
  maxRows?: number;
}

type SuggestionType = 'improve' | 'expand' | 'quantify' | 'action-verb' | 'complete';

interface ActionVerb {
  verb: string;
  example: string;
}

export default function AIWritingAssistant({
  value,
  onChange,
  placeholder = 'Start typing your bullet point...',
  context,
  className,
  minRows = 2,
  maxRows = 6,
}: AIWritingAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [actionVerbs, setActionVerbs] = useState<ActionVerb[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeType, setActiveType] = useState<SuggestionType | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const lineHeight = 24;
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  }, [value, minRows, maxRows]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !textareaRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestions = async (type: SuggestionType) => {
    if (!value.trim()) {
      toast.error('Please enter some text first');
      return;
    }

    setIsLoading(true);
    setActiveType(type);
    setShowSuggestions(true);
    setSuggestions([]);
    setActionVerbs([]);

    try {
      const response = await api.getAISuggestions({
        text: value,
        context,
        suggestionType: type,
      });

      if (response.success && response.data) {
        if (type === 'action-verb') {
          setActionVerbs(response.data.suggestions as ActionVerb[]);
        } else {
          setSuggestions(response.data.suggestions as string[]);
        }
      }
    } catch (error) {
      toast.error('Failed to get suggestions');
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    toast.success('Suggestion applied');
  };

  const applyActionVerb = (verb: ActionVerb) => {
    // Replace first word with the new verb
    const words = value.trim().split(' ');
    if (words.length > 0) {
      words[0] = verb.verb;
      onChange(words.join(' '));
    } else {
      onChange(verb.verb + ' ');
    }
    setShowSuggestions(false);
  };

  const copySuggestion = async (suggestion: string, index: number) => {
    try {
      await navigator.clipboard.writeText(suggestion);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const suggestionActions = [
    {
      type: 'improve' as SuggestionType,
      icon: Wand2,
      label: 'Improve',
      description: 'Make it more impactful',
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    },
    {
      type: 'quantify' as SuggestionType,
      icon: TrendingUp,
      label: 'Quantify',
      description: 'Add metrics & numbers',
      color: 'text-green-600 bg-green-50 hover:bg-green-100',
    },
    {
      type: 'expand' as SuggestionType,
      icon: ArrowRight,
      label: 'Expand',
      description: 'Add more detail',
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    },
    {
      type: 'action-verb' as SuggestionType,
      icon: Zap,
      label: 'Action Verbs',
      description: 'Stronger start words',
      color: 'text-amber-600 bg-amber-50 hover:bg-amber-100',
    },
  ];

  return (
    <div className={cn('relative', className)}>
      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-3 pr-12 bg-white text-slate-900 border border-slate-200 rounded-xl',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'resize-none placeholder:text-slate-400',
            'transition-all duration-200'
          )}
          style={{ lineHeight: '24px' }}
        />
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className={cn(
            'absolute right-3 top-3 p-1.5 rounded-lg transition-all',
            showSuggestions
              ? 'bg-indigo-100 text-indigo-600'
              : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
          )}
          title="AI Writing Assistant"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </div>

      {/* AI Actions Panel */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
        >
          {/* Action Buttons */}
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-slate-700">AI Writing Assistant</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {suggestionActions.map((action) => (
                <button
                  key={action.type}
                  onClick={() => getSuggestions(action.type)}
                  disabled={isLoading}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all',
                    action.color,
                    activeType === action.type && 'ring-2 ring-offset-1',
                    isLoading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <action.icon className="h-4 w-4" />
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
              <p className="text-sm text-slate-500">Generating suggestions...</p>
            </div>
          )}

          {/* Suggestions List */}
          {!isLoading && suggestions.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 border-b border-slate-100 hover:bg-slate-50 group"
                >
                  <p className="text-sm text-slate-700 mb-2">{suggestion}</p>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applySuggestion(suggestion)}
                      leftIcon={<Check className="h-3 w-3" />}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copySuggestion(suggestion, index)}
                      leftIcon={
                        copiedIndex === index ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )
                      }
                    >
                      {copiedIndex === index ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Verbs List */}
          {!isLoading && actionVerbs.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {actionVerbs.map((verb, index) => (
                <button
                  key={index}
                  onClick={() => applyActionVerb(verb)}
                  className="w-full p-3 border-b border-slate-100 hover:bg-slate-50 text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-indigo-600">{verb.verb}</span>
                  </div>
                  <p className="text-xs text-slate-500">Example: {verb.example}</p>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && suggestions.length === 0 && actionVerbs.length === 0 && activeType && (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">No suggestions available. Try a different option.</p>
            </div>
          )}

          {/* Initial State */}
          {!isLoading && !activeType && (
            <div className="p-4 text-center text-sm text-slate-500">
              Select an action above to get AI-powered suggestions for your text.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
