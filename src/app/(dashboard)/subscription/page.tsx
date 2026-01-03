'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Check, Crown, Zap, Building, Loader2 } from 'lucide-react';
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentPlan = user?.planType || 'FREE';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-600 mt-2">
          Choose the plan that best fits your job search needs
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  {currentPlan === 'BUSINESS' ? (
                    <Building className="h-6 w-6 text-blue-600" />
                  ) : currentPlan === 'PRO' ? (
                    <Crown className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <Zap className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{subscription.planType} Plan</h3>
                  <p className="text-sm text-gray-500">
                    {subscription.currentPeriodEnd
                      ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                      : 'Free forever'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={subscription.status === 'ACTIVE' ? 'success' : 'warning'}>
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
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Usage</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {subscription.resumes?.used || 0}
                    <span className="text-gray-400">
                      /{subscription.resumes?.unlimited ? '∞' : subscription.resumes?.limit || 1}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">Resumes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {subscription.coverLetters?.count || 0}
                  </p>
                  <p className="text-sm text-gray-500">Cover Letters</p>
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
              className={`relative ${
                isPro ? 'border-blue-500 border-2 shadow-lg' : ''
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  {isBusiness ? (
                    <Building className="h-10 w-10 text-purple-600" />
                  ) : isPro ? (
                    <Crown className="h-10 w-10 text-yellow-500" />
                  ) : (
                    <Zap className="h-10 w-10 text-gray-600" />
                  )}
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  {plan.interval && (
                    <span className="text-gray-500">/{plan.interval}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation, i) => (
                    <li key={i} className="flex items-start text-gray-400">
                      <span className="h-5 w-5 mr-2 flex-shrink-0 text-center">-</span>
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
                    variant={isPro ? 'primary' : 'outline'}
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
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600 mt-1">
              Yes, you can cancel your subscription at any time. You'll continue to have access until
              the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">What happens to my data if I downgrade?</h4>
            <p className="text-sm text-gray-600 mt-1">
              Your resumes and cover letters are always saved. On the free plan, you can still access
              them but won't be able to create new versions beyond the limit.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Do you offer refunds?</h4>
            <p className="text-sm text-gray-600 mt-1">
              We offer a 7-day money-back guarantee if you're not satisfied with the Pro or Business
              plan.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legal Disclaimer */}
      <div className="text-center text-xs text-gray-500">
        <p>
          This platform does not fabricate experience or guarantee hiring outcomes.
          AI-generated content is based solely on user-provided information.
        </p>
      </div>
    </div>
  );
}
