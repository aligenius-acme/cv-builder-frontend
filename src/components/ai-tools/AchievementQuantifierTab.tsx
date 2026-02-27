'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { ResumeSelector } from '@/components/ui/ResumeSelector';
import {
  TrendingUp,
  Loader2,
  Copy,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Briefcase,
  Edit3,
  XCircle,
  FileText,
} from 'lucide-react';
import api, {
  AchievementQuantifierResult,
} from '@/lib/api';
import toast from 'react-hot-toast';

interface AchievementQuantifierTabProps {
  resumes: any[];
  isLoadingResumes: boolean;
}

export default function AchievementQuantifierTab({ resumes, isLoadingResumes }: AchievementQuantifierTabProps) {
  const [bullets, setBullets] = useState<string[]>(['']);
  const [jobContext, setJobContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AchievementQuantifierResult | null>(null);

  // Resume import state
  const [bulletSource, setBulletSource] = useState<'manual' | 'resume'>('manual');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeBullets, setResumeBullets] = useState<string[]>([]);
  const [selectedBulletIndices, setSelectedBulletIndices] = useState<Set<number>>(new Set());

  const handleSelectResume = async (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setSelectedBulletIndices(new Set());

    // Extract bullet points from resume
    const resume = resumes.find((r) => r.id === resumeId);
    if (resume?.parsedData?.experience) {
      const allBullets: string[] = [];
      resume.parsedData.experience.forEach((exp: any) => {
        if (exp.description && Array.isArray(exp.description)) {
          exp.description.forEach((desc: string) => {
            const cleanBullet = desc.replace(/^[•\-\*▪◦›●○]\s*/, '').trim();
            if (cleanBullet && cleanBullet.length > 10) {
              allBullets.push(cleanBullet);
            }
          });
        }
      });
      setResumeBullets(allBullets);
    } else if (resume?.rawText) {
      // Fallback: extract lines that look like bullet points
      const lines = resume.rawText.split('\n');
      const bulletLines = lines
        .filter((line: string) => line.trim().match(/^[•\-\*▪◦›●○]/))
        .map((line: string) => line.replace(/^[•\-\*▪◦›●○]\s*/, '').trim())
        .filter((line: string) => line.length > 10);
      setResumeBullets(bulletLines.slice(0, 20));
    }
  };

  const toggleBulletSelection = (index: number) => {
    const newSet = new Set(selectedBulletIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedBulletIndices(newSet);
  };

  const addBullet = () => {
    if (bullets.length < 10) {
      setBullets([...bullets, '']);
    }
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    setBullets(newBullets);
  };

  const removeBullet = (index: number) => {
    if (bullets.length > 1) {
      setBullets(bullets.filter((_, i) => i !== index));
    }
  };

  const handleQuantify = async (overrideBullets?: string[]) => {
    const validBullets = (overrideBullets || bullets).filter((b) => b.trim());
    if (validBullets.length === 0) {
      toast.error('Please enter at least one bullet point');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.quantifyAchievements({
        bullets: validBullets,
        jobContext: jobContext || undefined,
      });
      if (response.success && response.data) {
        setResult(response.data);
        toast.success('Achievements quantified!');
      }
    } catch (error) {
      toast.error('Failed to quantify achievements');
    } finally {
      setIsLoading(false);
    }
  };

  const importAndQuantify = () => {
    const selected = Array.from(selectedBulletIndices).map((i) => resumeBullets[i]);
    if (selected.length === 0) {
      toast.error('Select at least one bullet point');
      return;
    }
    setBullets(selected);
    setBulletSource('manual');
    handleQuantify(selected);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Enter Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Target Job (Optional)
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={jobContext}
                onChange={(e) => setJobContext(e.target.value)}
                placeholder="e.g., Senior Product Manager at Google"
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Bullet Source Toggle */}
          <SegmentedControl
            options={[
              { value: 'manual' as const, label: 'Enter Manually', icon: <Edit3 className="h-4 w-4" /> },
              { value: 'resume' as const, label: 'From Resume', icon: <FileText className="h-4 w-4" />, count: resumes.length },
            ]}
            value={bulletSource}
            onChange={setBulletSource}
          />

          {bulletSource === 'resume' ? (
            <div className="space-y-3">
              <ResumeSelector
                resumes={resumes}
                selectedResumeId={selectedResumeId}
                onSelect={handleSelectResume}
                isLoading={isLoadingResumes}
                placeholder="Choose a resume to import from..."
                colorTheme="green"
              />

              {/* Bullet points from resume */}
              {selectedResumeId && resumeBullets.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Select Bullets to Quantify ({selectedBulletIndices.size} selected)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedBulletIndices.size === resumeBullets.length) {
                          setSelectedBulletIndices(new Set());
                        } else {
                          setSelectedBulletIndices(new Set(resumeBullets.map((_, i) => i)));
                        }
                      }}
                      className="text-xs text-green-600 font-medium"
                    >
                      {selectedBulletIndices.size === resumeBullets.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {resumeBullets.map((bullet, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start gap-3 px-3 py-2 cursor-pointer hover:bg-green-50 transition-colors ${
                          selectedBulletIndices.has(idx) ? 'bg-green-50' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBulletIndices.has(idx)}
                          onChange={() => toggleBulletSelection(idx)}
                          className="mt-1 h-4 w-4 text-green-600 rounded border-slate-300 focus:ring-green-500"
                        />
                        <span className="text-sm text-slate-700">{bullet}</span>
                      </label>
                    ))}
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={importAndQuantify}
                    disabled={selectedBulletIndices.size === 0 || isLoading}
                    isLoading={isLoading}
                  >
                    {!isLoading && <TrendingUp className="h-4 w-4 mr-2" />}
                    Quantify {selectedBulletIndices.size} Bullet{selectedBulletIndices.size !== 1 ? 's' : ''}
                  </Button>
                </div>
              )}

              {selectedResumeId && resumeBullets.length === 0 && (
                <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center">
                  <p className="text-slate-500 text-sm">No bullet points found in this resume</p>
                  <button
                    type="button"
                    onClick={() => setBulletSource('manual')}
                    className="text-green-600 text-sm font-medium mt-1"
                  >
                    Enter manually instead
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bullet Points to Quantify
                </label>
                <div className="space-y-2">
                  {bullets.map((bullet, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => updateBullet(idx, e.target.value)}
                        placeholder="e.g., Improved customer satisfaction"
                        className="flex-1 px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-slate-400"
                      />
                      {bullets.length > 1 && (
                        <button
                          onClick={() => removeBullet(idx)}
                          className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {bullets.length < 10 && (
                  <button
                    onClick={addBullet}
                    className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    + Add another bullet point
                  </button>
                )}
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleQuantify()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Quantifying...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Quantify Achievements
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {!result ? (
          <Card variant="elevated">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Transform Vague to Valuable</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Turn generic bullet points into powerful, metrics-driven achievements
                that capture recruiters' attention.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {result.achievements.map((achievement, idx) => (
              <Card key={idx} variant="elevated">
                <CardContent className="py-4">
                  <div className="mb-3">
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Original</span>
                    <p className="text-slate-600 line-through">{achievement.original}</p>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-green-600 uppercase tracking-wide font-medium">
                        Quantified Version
                      </span>
                      <button
                        onClick={() => copyToClipboard(achievement.quantified)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-slate-900 font-medium">{achievement.quantified}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${
                      achievement.impactLevel === 'High' ? 'bg-green-100 text-green-700' :
                      achievement.impactLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {achievement.impactLevel} Impact
                    </Badge>
                    {achievement.addedMetrics.map((metric, i) => (
                      <Badge key={i} className="bg-blue-50 text-blue-700">
                        +{metric}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Tips */}
            <Card variant="elevated" className="bg-green-50 border-green-200">
              <CardContent className="py-4">
                <h4 className="font-medium text-green-800 mb-2">Pro Tips</h4>
                <ul className="space-y-1">
                  {result.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}