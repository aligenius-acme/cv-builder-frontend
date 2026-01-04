'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  Users,
  FileText,
  Mail,
  CreditCard,
  Cpu,
  DollarSign,
  TrendingUp,
  Activity,
  ChevronRight,
  Shield,
  Building,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalResumes: number;
  totalCoverLetters: number;
  aiRequests30d: number;
  aiCost30d: string;
}

interface RecentUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/resumes');
      return;
    }
    loadDashboard();
  }, [user, router]);

  const loadDashboard = async () => {
    try {
      const response = await api.getAdminDashboard();
      if (response.success && response.data) {
        setStats(response.data.stats);
        setRecentUsers(response.data.recentUsers);
      }
    } catch (error) {
      toast.error('Failed to load admin dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-slate-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      href: '/admin/users',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      icon: CreditCard,
      color: 'from-emerald-500 to-emerald-600',
      href: '/admin/users',
    },
    {
      title: 'Total Resumes',
      value: stats?.totalResumes || 0,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      href: '/admin/users',
    },
    {
      title: 'Cover Letters',
      value: stats?.totalCoverLetters || 0,
      icon: Mail,
      color: 'from-amber-500 to-amber-600',
      href: '/admin/users',
    },
  ];

  const aiStats = [
    {
      title: 'AI Requests (30d)',
      value: stats?.aiRequests30d || 0,
      icon: Cpu,
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      title: 'AI Cost (30d)',
      value: `$${stats?.aiCost30d || '0.00'}`,
      icon: DollarSign,
      color: 'from-rose-500 to-rose-600',
    },
  ];

  const adminLinks = [
    { title: 'User Management', description: 'View and manage all users', href: '/admin/users', icon: Users },
    { title: 'Organizations', description: 'View B2B organizations', href: '/admin/organizations', icon: Building },
    { title: 'AI Usage', description: 'Monitor AI API usage and costs', href: '/admin/ai-usage', icon: Cpu },
    { title: 'AI Prompts', description: 'Manage AI prompt templates', href: '/admin/prompts', icon: FileText },
    { title: 'Templates', description: 'Manage resume templates', href: '/admin/templates', icon: FileText },
    { title: 'System Logs', description: 'View parsing errors and audit logs', href: '/admin/logs', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500">System overview and management</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card variant="elevated" className="group hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* AI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiStats.map((stat) => (
            <Card key={stat.title} variant="elevated">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                          <link.icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{link.title}</h3>
                          <p className="text-sm text-slate-500">{link.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Recent Signups
              </CardTitle>
              <Link href="/admin/users">
                <Badge variant="info" className="cursor-pointer hover:bg-indigo-200 transition-colors">
                  View All
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No recent users</p>
              ) : (
                recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.email}
                        </p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">{formatDate(user.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
