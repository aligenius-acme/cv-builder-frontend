import { useState } from 'react';
import {
  MessageSquare,
  Loader2,
  Copy,
  Check,
  Star,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Mail,
  Clock,
  Gift,
  Home,
  Calendar,
  Shield,
  XCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SavedJobSelector from './SavedJobSelector';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface SavedJob {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
}

interface NegotiationScriptTabProps {
  savedJobs: SavedJob[];
  isLoadingSavedJobs: boolean;
}

export default function NegotiationScriptTab({ savedJobs, isLoadingSavedJobs }: NegotiationScriptTabProps) {
  const [negotiateJobInputMode, setNegotiateJobInputMode] = useState<'saved' | 'manual'>('manual');
  const [selectedNegotiateJobId, setSelectedNegotiateJobId] = useState<string>('');
  const [negotiateOffer, setNegotiateOffer] = useState('');
  const [targetSalary, setTargetSalary] = useState('');
  const [negotiateJobTitle, setNegotiateJobTitle] = useState('');
  const [negotiateCompany, setNegotiateCompany] = useState('');
  const [reasons, setReasons] = useState<string[]>(['Market research', 'Relevant experience', 'Specialized skills']);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [script, setScript] = useState<any>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['opening', 'keyPoints']));

  const handleSelectNegotiateJob = (jobId: string) => {
    setSelectedNegotiateJobId(jobId);
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setNegotiateJobTitle(job.title || '');
      setNegotiateCompany(job.company || '');
      if (job.salary) {
        setNegotiateOffer(job.salary);
      }
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
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

  const SectionHeader = ({ title, section, icon: Icon }: { title: string; section: string; icon: any }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-slate-900">{title}</span>
      </div>
      {expandedSections.has(section) ? (
        <ChevronDown className="h-5 w-5 text-slate-400" />
      ) : (
        <ChevronRight className="h-5 w-5 text-slate-400" />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Negotiation Script Generator
          </CardTitle>
          <CardDescription>Get a comprehensive toolkit to negotiate your salary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SavedJobSelector
            jobs={savedJobs}
            isLoading={isLoadingSavedJobs}
            selectedJobId={selectedNegotiateJobId}
            onSelect={handleSelectNegotiateJob}
            inputMode={negotiateJobInputMode}
            onModeChange={(mode) => {
              setNegotiateJobInputMode(mode);
              if (mode === 'manual') {
                setSelectedNegotiateJobId('');
              }
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Offer *</label>
              <input
                type="text"
                value={negotiateOffer}
                onChange={(e) => setNegotiateOffer(e.target.value)}
                placeholder="e.g. $120,000"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Salary *</label>
              <input
                type="text"
                value={targetSalary}
                onChange={(e) => setTargetSalary(e.target.value)}
                placeholder="e.g. $140,000"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                value={negotiateJobTitle}
                onChange={(e) => setNegotiateJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
              <input
                type="text"
                value={negotiateCompany}
                onChange={(e) => setNegotiateCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerateScript}
            disabled={isGeneratingScript}
            leftIcon={isGeneratingScript ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
            className="w-full"
          >
            {isGeneratingScript ? 'Generating...' : 'Generate Negotiation Toolkit'}
          </Button>
        </CardContent>
      </Card>

      {script && (
        <div className="space-y-4">
          {/* Opening Statement */}
          <Card variant="elevated">
            <SectionHeader title="Opening Statement" section="opening" icon={MessageSquare} />
            {expandedSections.has('opening') && (
              <CardContent className="p-6 pt-0">
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(script.openingStatement, 'opening')}>
                    {copiedSection === 'opening' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-slate-700 bg-blue-50 p-4 rounded-xl border border-blue-200">
                  {script.openingStatement}
                </p>
              </CardContent>
            )}
          </Card>

          {/* Key Points */}
          {script.keyPoints && script.keyPoints.length > 0 && (
            <Card variant="elevated">
              <SectionHeader title="Key Points to Make" section="keyPoints" icon={Star} />
              {expandedSections.has('keyPoints') && (
                <CardContent className="p-6 pt-0 space-y-3">
                  {script.keyPoints.map((kp: any, i: number) => (
                    <div key={i} className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="font-medium text-blue-900">{kp.point}</p>
                      <p className="text-sm text-blue-700 mt-1">{kp.elaboration}</p>
                      {kp.exactScript && (
                        <div className="mt-2 p-3 bg-white rounded-lg border border-blue-100">
                          <p className="text-xs text-slate-500 mb-1">Say this:</p>
                          <p className="text-sm text-slate-700 italic">"{kp.exactScript}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {/* Counter-Offer Scripts */}
          {script.counterOfferScripts && script.counterOfferScripts.length > 0 && (
            <Card variant="elevated">
              <SectionHeader title="Counter-Offer Scripts" section="counterOffer" icon={DollarSign} />
              {expandedSections.has('counterOffer') && (
                <CardContent className="p-6 pt-0 space-y-4">
                  {script.counterOfferScripts.map((cos: any, i: number) => (
                    <div key={i} className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="font-medium text-amber-900 mb-2">Scenario: {cos.scenario}</p>
                      <div className="space-y-2">
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Your Response:</p>
                          <p className="text-sm text-slate-700">{cos.script}</p>
                        </div>
                        {cos.fallbackPosition && (
                          <div className="p-3 bg-amber-100/50 rounded-lg">
                            <p className="text-xs text-amber-700 mb-1">Fallback Position:</p>
                            <p className="text-sm text-amber-800">{cos.fallbackPosition}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {/* Benefits Negotiation */}
          {script.benefitsNegotiation && (
            <Card variant="elevated">
              <SectionHeader title="Benefits Negotiation Scripts" section="benefits" icon={Gift} />
              {expandedSections.has('benefits') && (
                <CardContent className="p-6 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {script.benefitsNegotiation.signingBonus && (
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <p className="font-medium text-green-900">Signing Bonus</p>
                        </div>
                        <p className="text-sm text-green-800">{script.benefitsNegotiation.signingBonus.script}</p>
                        {script.benefitsNegotiation.signingBonus.typicalRange && (
                          <p className="text-xs text-green-600 mt-2">
                            Typical: {script.benefitsNegotiation.signingBonus.typicalRange}
                          </p>
                        )}
                      </div>
                    )}
                    {script.benefitsNegotiation.equity && (
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <p className="font-medium text-purple-900">Equity/Stock Options</p>
                        </div>
                        <p className="text-sm text-purple-800">{script.benefitsNegotiation.equity.script}</p>
                        {script.benefitsNegotiation.equity.typicalRange && (
                          <p className="text-xs text-purple-600 mt-2">
                            Typical: {script.benefitsNegotiation.equity.typicalRange}
                          </p>
                        )}
                      </div>
                    )}
                    {script.benefitsNegotiation.pto && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <p className="font-medium text-blue-900">PTO/Vacation</p>
                        </div>
                        <p className="text-sm text-blue-800">{script.benefitsNegotiation.pto.script}</p>
                        {script.benefitsNegotiation.pto.typicalRange && (
                          <p className="text-xs text-blue-600 mt-2">Typical: {script.benefitsNegotiation.pto.typicalRange}</p>
                        )}
                      </div>
                    )}
                    {script.benefitsNegotiation.remoteWork && (
                      <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Home className="h-4 w-4 text-teal-600" />
                          <p className="font-medium text-teal-900">Remote Work</p>
                        </div>
                        <p className="text-sm text-teal-800">{script.benefitsNegotiation.remoteWork.script}</p>
                        {script.benefitsNegotiation.remoteWork.tips && (
                          <p className="text-xs text-teal-600 mt-2">Tip: {script.benefitsNegotiation.remoteWork.tips}</p>
                        )}
                      </div>
                    )}
                    {script.benefitsNegotiation.startDate && (
                      <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <p className="font-medium text-orange-900">Start Date</p>
                        </div>
                        <p className="text-sm text-orange-800">{script.benefitsNegotiation.startDate.script}</p>
                        {script.benefitsNegotiation.startDate.tips && (
                          <p className="text-xs text-orange-600 mt-2">Tip: {script.benefitsNegotiation.startDate.tips}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Email Templates */}
          {script.emailTemplates && (
            <Card variant="elevated">
              <SectionHeader title="Email Templates" section="emails" icon={Mail} />
              {expandedSections.has('emails') && (
                <CardContent className="p-6 pt-0 space-y-4">
                  {script.emailTemplates.initial && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-slate-900">Initial Negotiation Email</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(script.emailTemplates.initial, 'email-initial')}
                        >
                          {copiedSection === 'email-initial' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                        {script.emailTemplates.initial}
                      </pre>
                    </div>
                  )}
                  {script.emailTemplates.counterOffer && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-amber-900">Counter-Offer Response Email</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(script.emailTemplates.counterOffer, 'email-counter')}
                        >
                          {copiedSection === 'email-counter' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <pre className="text-sm text-amber-800 whitespace-pre-wrap font-sans">
                        {script.emailTemplates.counterOffer}
                      </pre>
                    </div>
                  )}
                  {script.emailTemplates.acceptance && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-green-900">Acceptance Email</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(script.emailTemplates.acceptance, 'email-accept')}
                        >
                          {copiedSection === 'email-accept' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <pre className="text-sm text-green-800 whitespace-pre-wrap font-sans">
                        {script.emailTemplates.acceptance}
                      </pre>
                    </div>
                  )}
                  {script.emailTemplates.walkAway && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-red-900">Professional Decline Email</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(script.emailTemplates.walkAway, 'email-decline')}
                        >
                          {copiedSection === 'email-decline' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <pre className="text-sm text-red-800 whitespace-pre-wrap font-sans">
                        {script.emailTemplates.walkAway}
                      </pre>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {/* Walkaway Strategy */}
          {script.walkawayStrategy && (
            <Card variant="elevated">
              <SectionHeader title="Walkaway Strategy" section="walkaway" icon={Shield} />
              {expandedSections.has('walkaway') && (
                <CardContent className="p-6 pt-0 space-y-4">
                  {script.walkawayStrategy.minimumAcceptable && (
                    <div className="p-4 bg-slate-100 rounded-xl">
                      <p className="font-medium text-slate-900 mb-2">Know Your Minimum</p>
                      <p className="text-sm text-slate-700">{script.walkawayStrategy.minimumAcceptable}</p>
                    </div>
                  )}
                  {script.walkawayStrategy.howToDecline && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <p className="font-medium text-red-900 mb-2">How to Gracefully Decline</p>
                      <p className="text-sm text-red-800">{script.walkawayStrategy.howToDecline}</p>
                    </div>
                  )}
                  {script.walkawayStrategy.keepDoorOpen && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="font-medium text-blue-900 mb-2">Keep the Door Open</p>
                      <p className="text-sm text-blue-800">{script.walkawayStrategy.keepDoorOpen}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {/* Common Mistakes */}
          {script.commonMistakes && script.commonMistakes.length > 0 && (
            <Card variant="elevated">
              <SectionHeader title="Common Mistakes to Avoid" section="mistakes" icon={XCircle} />
              {expandedSections.has('mistakes') && (
                <CardContent className="p-6 pt-0">
                  <ul className="space-y-2">
                    {script.commonMistakes.map((mistake: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700 p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-red-800">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          )}

          {/* Timeline */}
          {script.timeline && (
            <Card variant="elevated">
              <SectionHeader title="Negotiation Timeline" section="timeline" icon={Clock} />
              {expandedSections.has('timeline') && (
                <CardContent className="p-6 pt-0">
                  <div className="space-y-4">
                    {script.timeline.whenToNegotiate && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="font-medium text-blue-900 mb-1">When to Negotiate</p>
                        <p className="text-sm text-blue-800">{script.timeline.whenToNegotiate}</p>
                      </div>
                    )}
                    {script.timeline.howLongToWait && (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="font-medium text-amber-900 mb-1">Response Timeline</p>
                        <p className="text-sm text-amber-800">{script.timeline.howLongToWait}</p>
                      </div>
                    )}
                    {script.timeline.deadlineStrategy && (
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="font-medium text-green-900 mb-1">Deadline Strategy</p>
                        <p className="text-sm text-green-800">{script.timeline.deadlineStrategy}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Tips */}
          {script.tips && script.tips.length > 0 && (
            <Card variant="elevated">
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Pro Tips
                </h4>
                <ul className="space-y-2">
                  {script.tips.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Closing */}
          {script.closingStatement && (
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">Closing Statement</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(script.closingStatement, 'closing')}
                  >
                    {copiedSection === 'closing' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-slate-700 bg-green-50 p-4 rounded-xl border border-green-200">
                  {script.closingStatement}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
