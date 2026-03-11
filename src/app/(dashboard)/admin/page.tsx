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
  Cpu,
  DollarSign,
  TrendingUp,
  Activity,
  ChevronRight,
  Shield,
  Loader2,
  Briefcase,
  Bookmark,
  UserCheck,
  UserPlus,
  Zap,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Crown,
  Settings,
  Sparkles,
  Target,
  PenLine,
  GraduationCap,
  Mic,
  Send,
  Search,
  Layout,
  Kanban,
  FlaskConical,
  Share2,
} from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalResumes: number;
  totalCoverLetters: number;
  totalResumeVersions: number;
  totalJobApplications: number;
  totalSavedJobs: number;
  activeUsers30d: number;
  newUsers30d: number;
  proUsers: number;
  userGrowthRate: number;
  avgVersionsPerResume: number;
  aiRequests30d: number;
  aiCost30d: string;
  aiCreditsRemaining: number;
  aiCreditsUsed: number;
  aiSuccessRate: number;
  parsingSuccessRate: number;
  errorRate24h: number;
  totalParsingErrors: number;
  recentErrors24h: number;
}

interface TopAIUser {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  totalTokens: number;
  totalCost: string;
  requestCount: number;
}

interface AIOperation {
  operation: string;
  count: number;
  totalCost: string;
  avgDuration: number;
}

interface RecentUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
}

interface ModuleUsageItem {
  module: string;
  type: 'ai' | 'non-ai';
  actions30d: number;
  uniqueUsers30d: number;
  cost30d: number;
  trend: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topAIUsers, setTopAIUsers] = useState<TopAIUser[]>([]);
  const [aiOperations, setAIOperations] = useState<AIOperation[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [moduleUsage, setModuleUsage] = useState<ModuleUsageItem[]>([]);
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
        setTopAIUsers(response.data.topAIUsers || []);
        setAIOperations(response.data.aiOperations || []);
        setRecentUsers(response.data.recentUsers);
        setModuleUsage(response.data.moduleUsage || []);
      }
    } catch (error) {
      toast.error('Failed to load admin dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <LoadingSpinner text="Loading admin dashboard..." />
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
      color: 'bg-blue-600',
      href: '/admin/users',
      subtext: `${stats?.activeUsers30d || 0} active (30d)`,
    },
    {
      title: 'Total Resumes',
      value: stats?.totalResumes || 0,
      icon: FileText,
      color: 'bg-purple-600',
      href: '/admin/users',
      subtext: `${stats?.avgVersionsPerResume || 0} avg versions`,
    },
    {
      title: 'Cover Letters',
      value: stats?.totalCoverLetters || 0,
      icon: Mail,
      color: 'bg-amber-500',
      href: '/admin/users',
    },
    {
      title: 'Resume Versions',
      value: stats?.totalResumeVersions || 0,
      icon: FileText,
      color: 'bg-indigo-600',
      href: '/admin/users',
    },
  ];

  const secondaryCards = [
    {
      title: 'Pro Users',
      value: stats?.proUsers || 0,
      icon: Crown,
      color: 'bg-blue-600',
      subtext: 'Active subscriptions',
    },
    {
      title: 'Job Applications',
      value: stats?.totalJobApplications || 0,
      icon: Briefcase,
      color: 'bg-emerald-600',
    },
    {
      title: 'Active Users (30d)',
      value: stats?.activeUsers30d || 0,
      icon: UserCheck,
      color: 'bg-green-600',
    },
    {
      title: 'New Users (30d)',
      value: stats?.newUsers30d || 0,
      icon: UserPlus,
      color: 'bg-rose-600',
      badge: stats?.userGrowthRate ? `${stats.userGrowthRate > 0 ? '+' : ''}${stats.userGrowthRate}%` : null,
    },
  ];

  const aiStats = [
    {
      title: 'AI Requests (30d)',
      value: stats?.aiRequests30d || 0,
      icon: Cpu,
      color: 'bg-cyan-600',
      subtext: `${stats?.aiSuccessRate || 0}% success rate`,
    },
    {
      title: 'AI Cost (30d)',
      value: `$${stats?.aiCost30d || '0.00'}`,
      icon: DollarSign,
      color: 'bg-rose-600',
    },
    {
      title: 'AI Credits Used',
      value: stats?.aiCreditsUsed || 0,
      icon: Zap,
      color: 'bg-orange-600',
      subtext: `${stats?.aiCreditsRemaining || 0} remaining`,
    },
  ];

  const healthStats = [
    {
      title: 'Parsing Success',
      value: `${stats?.parsingSuccessRate || 100}%`,
      icon: CheckCircle2,
      color: Number(stats?.parsingSuccessRate || 100) >= 95 ? 'bg-green-600' : 'bg-yellow-600',
      subtext: `${stats?.totalParsingErrors || 0} total errors`,
    },
    {
      title: 'Error Rate (24h)',
      value: `${stats?.errorRate24h || 0}%`,
      icon: AlertCircle,
      color: Number(stats?.errorRate24h || 0) < 1 ? 'bg-green-600' : 'bg-red-600',
      subtext: `${stats?.recentErrors24h || 0} recent errors`,
    },
  ];

  const MODULE_ICONS: Record<string, React.ReactNode> = {
    'Resume Tailoring':   <Sparkles className="h-4 w-4" />,
    'ATS Analysis':       <Target className="h-4 w-4" />,
    'Cover Letters':      <FileText className="h-4 w-4" />,
    'Job Match Score':    <TrendingUp className="h-4 w-4" />,
    'AI Writing':         <PenLine className="h-4 w-4" />,
    'Career Performance': <BarChart3 className="h-4 w-4" />,
    'Skill Gap':          <GraduationCap className="h-4 w-4" />,
    'Salary Analyzer':    <DollarSign className="h-4 w-4" />,
    'Interview Prep':     <Mic className="h-4 w-4" />,
    'Networking':         <Send className="h-4 w-4" />,
    'Job Board':          <Search className="h-4 w-4" />,
    'Resume Builder':     <Layout className="h-4 w-4" />,
    'Job Tracker':        <Kanban className="h-4 w-4" />,
    'A/B Testing':        <FlaskConical className="h-4 w-4" />,
    'Resume Sharing':     <Share2 className="h-4 w-4" />,
  };

  const adminLinks = [
    { title: 'User Management', description: 'View and manage all users', href: '/admin/users', icon: Users },
    { title: 'AI Usage', description: 'Monitor AI API usage and costs', href: '/admin/ai-usage', icon: Cpu },
    { title: 'AI Prompts', description: 'Manage AI prompt templates', href: '/admin/prompts', icon: FileText },
    { title: 'Templates', description: 'Manage resume templates', href: '/admin/templates', icon: FileText },
    { title: 'Affiliate Links', description: 'Manage course recommendation URLs', href: '/admin/affiliates', icon: TrendingUp },
    { title: 'System Logs', description: 'View parsing errors and audit logs', href: '/admin/logs', icon: Activity },
    { title: 'App Settings', description: 'Monetization, Pro subscription, monthly credits', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500">Comprehensive system insights and management</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card variant="elevated" className="group hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
                      {stat.subtext && (
                        <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
                      )}
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryCards.map((stat) => (
            <Card key={stat.title} variant="elevated">
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
                      {stat.badge && (
                        <Badge variant={parseFloat(stat.badge) >= 0 ? 'success' : 'error'} size="sm">
                          {stat.badge}
                        </Badge>
                      )}
                    </div>
                    {(stat as any).subtext && (
                      <p className="text-xs text-slate-400 mt-1">{(stat as any).subtext}</p>
                    )}
                  </div>
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Stats & System Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {aiStats.map((stat) => (
            <Card key={stat.title} variant="elevated">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                    {stat.subtext && (
                      <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {healthStats.map((stat) => (
            <Card key={stat.title} variant="elevated">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    {stat.subtext && (
                      <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top AI Users */}
        {topAIUsers.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Top AI Users (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topAIUsers.map((user, index) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        #{index + 1}
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
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">{user.requestCount} requests</p>
                      <p className="text-xs text-slate-500">{user.totalTokens.toLocaleString()} tokens · ${user.totalCost}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Operations Breakdown */}
        {aiOperations.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-cyan-600" />
                AI Operations Breakdown (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiOperations.map((op) => (
                  <div
                    key={op.operation}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="info" size="sm">{op.operation}</Badge>
                      <p className="text-lg font-bold text-slate-900">{op.count}</p>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Total: ${op.totalCost}</span>
                      <span>{op.avgDuration}ms avg</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Module Usage */}
        {moduleUsage.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Module Usage
                <span className="text-sm font-normal text-[var(--text-muted)] ml-1">Last 30 days</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {moduleUsage.map((mod, idx) => {
                  const maxActions = moduleUsage[0].actions30d || 1;
                  const pct = (mod.actions30d / maxActions) * 100;
                  return (
                    <div key={mod.module} className="flex items-center gap-4 px-6 py-3 hover:bg-[var(--surface-raised)] transition-colors">
                      {/* Rank */}
                      <span className="w-6 text-sm font-bold text-[var(--text-muted)] text-right flex-shrink-0">
                        {idx + 1}
                      </span>
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                        {MODULE_ICONS[mod.module]}
                      </div>
                      {/* Name + type badge */}
                      <div className="w-44 flex-shrink-0">
                        <p className="text-sm font-medium text-[var(--text)]">{mod.module}</p>
                        <Badge variant={mod.type === 'ai' ? 'primary' : 'default'} size="sm">
                          {mod.type === 'ai' ? 'AI' : 'Tracker'}
                        </Badge>
                      </div>
                      {/* Usage bar */}
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-[var(--text)] w-14 text-right flex-shrink-0">
                          {mod.actions30d.toLocaleString()}
                        </span>
                      </div>
                      {/* Unique users (AI only) */}
                      <div className="w-24 text-right flex-shrink-0 hidden lg:block">
                        <p className="text-sm text-[var(--text)]">
                          {mod.type === 'ai' ? mod.uniqueUsers30d : '—'}
                        </p>
                        <p className="text-xs text-slate-400">users</p>
                      </div>
                      {/* Cost (AI only) */}
                      <div className="w-20 text-right flex-shrink-0 hidden xl:block">
                        <p className="text-sm text-[var(--text)]">
                          {mod.cost30d > 0 ? `$${mod.cost30d.toFixed(3)}` : '—'}
                        </p>
                        <p className="text-xs text-slate-400">cost</p>
                      </div>
                      {/* Trend */}
                      <div className="w-20 flex-shrink-0 text-right">
                        {mod.actions30d === 0 ? (
                          <Badge variant="default" size="sm">Unused</Badge>
                        ) : mod.trend >= 10 ? (
                          <Badge variant="success" size="sm">+{mod.trend.toFixed(0)}%</Badge>
                        ) : mod.trend <= -10 ? (
                          <Badge variant="error" size="sm">{mod.trend.toFixed(0)}%</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Stable</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <link.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{link.title}</h3>
                          <p className="text-sm text-slate-500">{link.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
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
                <Badge variant="info" className="cursor-pointer hover:bg-blue-200 transition-colors">
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
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
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
