'use client';

import { Briefcase, TrendingUp, Heart, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface EmptyJobDetailsStateProps {
  variant?: 'default' | 'saved';
}

export default function EmptyJobDetailsState({ variant = 'default' }: EmptyJobDetailsStateProps) {
  if (variant === 'saved') {
    return (
      <Card variant="elevated" className="h-full min-h-[500px]">
        <CardContent className="h-full flex flex-col items-center justify-center text-center p-12">
          <div className="w-24 h-24 bg-rose-50 rounded-xl flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-pink-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a Saved Job</h3>
          <p className="text-slate-500 max-w-sm mb-6">
            Click on any saved job to view details, tailor your resume, or apply directly.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="h-4 w-4" />
            <span>Track jobs you're interested in applying to</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="h-full min-h-[500px]">
      <CardContent className="h-full flex flex-col items-center justify-center text-center p-12">
        <div className="w-24 h-24 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
          <Briefcase className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a Job</h3>
        <p className="text-slate-500 max-w-sm mb-6">
          Click on any job listing to view the full description, requirements, and apply directly.
        </p>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <TrendingUp className="h-4 w-4" />
          <span>Get personalized recommendations based on your profile</span>
        </div>
      </CardContent>
    </Card>
  );
}
