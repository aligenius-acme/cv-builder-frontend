import { useState } from 'react';
import { Scale, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import OfferCard from './OfferCard';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Offer {
  id: string;
  company: string;
  position: string;
  baseSalary: number;
  bonus: string;
  equity: string;
  benefits: string[];
  remoteWork: string;
  ptoDays: number;
  location: string;
}

interface SavedJob {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
}

interface OfferCompareTabProps {
  savedJobs: SavedJob[];
  isLoadingSavedJobs: boolean;
}

export default function OfferCompareTab({ savedJobs, isLoadingSavedJobs }: OfferCompareTabProps) {
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: '1',
      company: '',
      position: '',
      baseSalary: 0,
      bonus: '',
      equity: '',
      benefits: [],
      remoteWork: '',
      ptoDays: 0,
      location: '',
    },
    {
      id: '2',
      company: '',
      position: '',
      baseSalary: 0,
      bonus: '',
      equity: '',
      benefits: [],
      remoteWork: '',
      ptoDays: 0,
      location: '',
    },
  ]);
  const [offerJobInputModes, setOfferJobInputModes] = useState<Record<string, 'saved' | 'manual'>>({});
  const [selectedOfferJobIds, setSelectedOfferJobIds] = useState<Record<string, string>>({});
  const [isComparing, setIsComparing] = useState(false);
  const [comparison, setComparison] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSelectOfferJob = (offerId: string, jobId: string) => {
    setSelectedOfferJobIds((prev) => ({ ...prev, [offerId]: jobId }));
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      updateOffer(offerId, 'company', job.company || '');
      updateOffer(offerId, 'position', job.title || '');
      updateOffer(offerId, 'location', job.location || '');
      if (job.salary) {
        const salaryMatch = job.salary.match(/\d+/);
        if (salaryMatch) {
          updateOffer(offerId, 'baseSalary', parseInt(salaryMatch[0]));
        }
      }
    }
  };

  const updateOffer = (id: string, field: keyof Offer, value: any) => {
    setOffers(offers.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  };

  const addOffer = () => {
    setOffers([
      ...offers,
      {
        id: Date.now().toString(),
        company: '',
        position: '',
        baseSalary: 0,
        bonus: '',
        equity: '',
        benefits: [],
        remoteWork: '',
        ptoDays: 0,
        location: '',
      },
    ]);
  };

  const removeOffer = (id: string) => {
    if (offers.length > 2) {
      setOffers(offers.filter((o) => o.id !== id));
    }
  };

  const handleCompare = async () => {
    const validOffers = offers.filter((o) => o.company && o.baseSalary > 0);
    if (validOffers.length < 2) {
      toast.error('Please fill in at least 2 offers');
      return;
    }

    setIsComparing(true);
    setComparison(null);

    try {
      const response = await api.compareOffers(validOffers);
      if (response.success && response.data) {
        setComparison(response.data);
      }
    } catch (error) {
      toast.error('Failed to compare offers');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600" />
            Compare Offers
          </CardTitle>
          <CardDescription>Compare multiple job offers side by side</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {offers.map((offer, index) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              index={index}
              onUpdate={updateOffer}
              onRemove={removeOffer}
              canRemove={offers.length > 2}
              savedJobs={savedJobs}
              isLoadingSavedJobs={isLoadingSavedJobs}
              inputMode={offerJobInputModes[offer.id]}
              selectedJobId={selectedOfferJobIds[offer.id]}
              onModeChange={(offerId, mode) => {
                setOfferJobInputModes((prev) => ({ ...prev, [offerId]: mode }));
                if (mode === 'manual') {
                  setSelectedOfferJobIds((prev) => ({ ...prev, [offerId]: '' }));
                }
              }}
              onSelectJob={handleSelectOfferJob}
            />
          ))}
          <div className="flex gap-3">
            <Button variant="outline" onClick={addOffer} leftIcon={<Plus className="h-4 w-4" />}>
              Add Offer
            </Button>
            <Button
              variant="primary"
              onClick={handleCompare}
              disabled={isComparing}
              leftIcon={isComparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />}
            >
              {isComparing ? 'Comparing...' : 'Compare Offers'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {comparison && (
        <div className="space-y-6">
          <Card variant="elevated">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Total Compensation</h3>
              <div className="space-y-3">
                {comparison.totalCompensation?.map((tc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-900">{tc.company}</span>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(tc.estimated)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparison.prosAndCons?.map((pc: any, i: number) => (
              <Card key={i} variant="elevated">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">{pc.company}</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">Pros</p>
                      <ul className="space-y-1">
                        {pc.pros?.map((pro: string, j: number) => (
                          <li key={j} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-green-500">+</span> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-2">Cons</p>
                      <ul className="space-y-1">
                        {pc.cons?.map((con: string, j: number) => (
                          <li key={j} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-red-500">-</span> {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {comparison.recommendation && (
            <Card variant="elevated" className="border-2 border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommendation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-white rounded-xl">
                    <p className="text-xs text-slate-500">Best for Money</p>
                    <p className="font-semibold text-slate-900">{comparison.recommendation.bestFor?.moneyFocused}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl">
                    <p className="text-xs text-slate-500">Best for Work-Life Balance</p>
                    <p className="font-semibold text-slate-900">{comparison.recommendation.bestFor?.workLifeBalance}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl">
                    <p className="text-xs text-slate-500">Best for Career Growth</p>
                    <p className="font-semibold text-slate-900">{comparison.recommendation.bestFor?.careerGrowth}</p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl">
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Overall Pick: {comparison.recommendation.overallPick}
                  </p>
                  <p className="text-slate-700">{comparison.recommendation.reasoning}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
