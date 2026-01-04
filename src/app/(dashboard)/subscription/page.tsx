'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Check, Crown, Zap, Building, Loader2, Sparkles, Star } from 'lucide-react';
import api from '@/lib/api';
import { Plan } from '@/types';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        api.getPlans(),
        api.getSubscription(),
      ]);

      if (plansRes.success && plansRes.data) {
        setPlans(plansRes.data.plans);
      }
      if (subRes.success && subRes.data) {
        setSubscription(subRes.data);
      }
    } catch (error) {
      toast.error('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'pro' | 'business') => {
    setIsProcessing(true);
    try {
      const response = await api.createCheckout(planType);
      if (response.success && response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      toast.error('Failed to start checkout');
      setIsProcessing(false);
    }
  };

  const handleManageBilling = async () => {
    setIsProcessing(true);
    try {
      const response = await api.createPortalSession();
      if (response.success && response.data?.portalUrl) {
        window.location.href = response.data.portalUrl;
      }
    } catch (error) {
      toast.error('Failed to open billing portal');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-slate-500">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  const currentPlan = user?.planType || 'FREE';

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full text-indigo-700 text-sm mb-4">
            <Sparkles className="h-4 w-4" />
            Choose Your Plan
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Subscription Plans</h1>
          <p className="text-slate-600 mt-2 max-w-xl mx-auto">
            Choose the plan that best fits your job search needs
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    currentPlan === 'BUSINESS'
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30'
                      : currentPlan === 'PRO'
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-500/30'
                      : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/30'
                  }`}>
                    {currentPlan === 'BUSINESS' ? (
                      <Building className="h-7 w-7 text-white" />
                    ) : currentPlan === 'PRO' ? (
                      <Crown className="h-7 w-7 text-white" />
                    ) : (
                      <Zap className="h-7 w-7 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{subscription.planType} Plan</h3>
                    <p className="text-sm text-slate-500">
                      {subscription.currentPeriodEnd
                        ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                        : 'Free forever'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={subscription.status === 'ACTIVE' ? 'success' : 'warning'} size="lg">
                    {subscription.status}
                  </Badge>
                  {currentPlan !== 'FREE' && (
                    <Button variant="outline" onClick={handleManageBilling} isLoading={isProcessing}>
                      Manage Billing
                    </Button>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="font-medium text-slate-900 mb-4">Usage</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-slate-900">
                      {subscription.resumes?.used || 0}
                      <span className="text-slate-400 text-lg">
                        /{subscription.resumes?.unlimited ? '∞' : subscription.resumes?.limit || 1}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500">Resumes</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-slate-900">
                      {subscription.coverLetters?.count || 0}
                    </p>
                    <p className="text-sm text-slate-500">Cover Letters</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id.toUpperCase() === currentPlan;
            const isPro = plan.id === 'pro';
            const isBusiness = plan.id === 'business';

            return (
              <Card
                key={plan.id}
                variant="elevated"
                className={`relative ${
                  isPro ? 'border-2 border-indigo-500 shadow-xl shadow-indigo-500/10' : ''
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="gradient" size="lg" className="shadow-lg">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2 pt-6">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                      isBusiness
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30'
                        : isPro
                        ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-500/30'
                        : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/30'
                    }`}>
                      {isBusiness ? (
                        <Building className="h-8 w-8 text-white" />
                      ) : isPro ? (
                        <Crown className="h-8 w-8 text-white" />
                      ) : (
                        <Zap className="h-8 w-8 text-white" />
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900">
                      ${plan.price}
                    </span>
                    {plan.interval && (
                      <span className="text-slate-500">/{plan.interval}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <Check className="h-3 w-3 text-emerald-600" />
                        </div>
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations?.map((limitation, i) => (
                      <li key={i} className="flex items-start text-slate-400">
                        <span className="w-5 h-5 mr-3 flex-shrink-0 text-center">-</span>
                        <span className="text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.price === 0 ? (
                    <Button variant="outline" className="w-full" disabled>
                      Free Forever
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isPro ? 'gradient' : 'outline'}
                      onClick={() => handleUpgrade(plan.id as 'pro' | 'business')}
                      isLoading={isProcessing}
                    >
                      {currentPlan === 'FREE' ? 'Upgrade' : 'Switch'} to {plan.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                q: 'Can I cancel anytime?',
                a: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
              },
              {
                q: 'What happens to my data if I downgrade?',
                a: "Your resumes and cover letters are always saved. On the free plan, you can still access them but won't be able to create new versions beyond the limit.",
              },
              {
                q: 'Do you offer refunds?',
                a: "We offer a 7-day money-back guarantee if you're not satisfied with the Pro or Business plan.",
              },
            ].map((item) => (
              <div key={item.q}>
                <h4 className="font-medium text-slate-900 mb-1">{item.q}</h4>
                <p className="text-sm text-slate-600">{item.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Legal Disclaimer */}
        <div className="text-center text-xs text-slate-400 py-4">
          <p>
            This platform does not fabricate experience or guarantee hiring outcomes.
            AI-generated content is based solely on user-provided information.
          </p>
        </div>
      </div>
    </div>
  );
}
