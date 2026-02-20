'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  ArrowLeft,
  Building,
  Users,
  ChevronLeft,
  ChevronRight,
  Globe,
  Calendar,
  CreditCard,
  Loader2,
} from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Organization {
  id: string;
  name: string;
  domain: string | null;
  userCount: number;
  subscription: {
    planType: string;
    status: string;
  } | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminOrganizationsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/resumes');
      return;
    }
    loadOrganizations();
  }, [user, router, page]);

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminOrganizations(page, 20);
      if (response.success && response.data) {
        setOrganizations(response.data.organizations);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  const getPlanBadge = (planType: string | undefined) => {
    switch (planType) {
      case 'BUSINESS':
        return <Badge variant="primary" size="sm">Business</Badge>;
      case 'PRO':
        return <Badge variant="warning" size="sm">Pro</Badge>;
      default:
        return <Badge variant="default" size="sm">Free</Badge>;
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'CANCELLED':
        return <Badge variant="error" size="sm">Cancelled</Badge>;
      case 'PAST_DUE':
        return <Badge variant="warning" size="sm">Past Due</Badge>;
      default:
        return <Badge variant="default" size="sm">{status || 'N/A'}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
              <p className="text-slate-500">
                {pagination?.total || 0} B2B organizations
              </p>
            </div>
          </div>
        </div>

        {/* Organizations List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : organizations.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="py-12">
              <div className="text-center">
                <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No organizations found</p>
                <p className="text-sm text-slate-400 mt-1">Organizations will appear here when B2B customers sign up</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <Card key={org.id} variant="elevated" className="hover:border-blue-200 transition-colors">
                <CardContent className="py-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                      <Building className="h-7 w-7 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{org.name}</h3>
                      {org.domain && (
                        <p className="text-sm text-slate-500 flex items-center gap-1 truncate">
                          <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                          {org.domain}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        Users
                      </span>
                      <span className="font-semibold text-slate-900">{org.userCount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4" />
                        Plan
                      </span>
                      <div className="flex items-center gap-2">
                        {getPlanBadge(org.subscription?.planType)}
                        {getStatusBadge(org.subscription?.status)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Created
                      </span>
                      <span className="text-sm text-slate-600">{formatDate(org.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * pagination.limit + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
