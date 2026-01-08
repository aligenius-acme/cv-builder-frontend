'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Building,
  Users,
  UserPlus,
  Crown,
  Globe,
  Settings,
  Trash2,
  LogOut,
  Loader2,
  Mail,
  Shield,
  User,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Member {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'ORG_ADMIN' | 'ORG_USER';
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  domain: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  anonymizationEnabled: boolean;
  subscription: {
    seatsTotal: number;
    seatsUsed: number;
    status: string;
  } | null;
  members: Member[];
  isAdmin: boolean;
}

export default function OrganizationPage() {
  const { user, fetchUser } = useAuthStore();
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Form states
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDomain, setNewOrgDomain] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings form
  const [settingsName, setSettingsName] = useState('');
  const [settingsDomain, setSettingsDomain] = useState('');
  const [settingsAnonymization, setSettingsAnonymization] = useState(false);

  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      const response = await api.getOrganization();
      if (response.success && response.data) {
        setOrganization(response.data);
        setSettingsName(response.data.name);
        setSettingsDomain(response.data.domain || '');
        setSettingsAnonymization(response.data.anonymizationEnabled);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load organization');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createOrganization({
        name: newOrgName,
        domain: newOrgDomain || undefined,
      });
      if (response.success) {
        toast.success('Organization created!');
        setShowCreateForm(false);
        loadOrganization();
        fetchUser(); // Refresh user data to update role
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.inviteMember(inviteEmail);
      if (response.success) {
        toast.success(response.message || 'Invitation sent!');
        setInviteEmail('');
        setShowInviteForm(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.updateOrganization({
        name: settingsName,
        domain: settingsDomain || undefined,
        anonymizationEnabled: settingsAnonymization,
      });
      if (response.success) {
        toast.success('Settings updated!');
        setShowSettings(false);
        loadOrganization();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, email: string) => {
    if (!confirm(`Remove ${email} from the organization?`)) return;

    try {
      const response = await api.removeMember(memberId);
      if (response.success) {
        toast.success('Member removed');
        loadOrganization();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'ORG_ADMIN' | 'ORG_USER') => {
    try {
      const response = await api.updateMemberRole(memberId, newRole);
      if (response.success) {
        toast.success('Role updated');
        loadOrganization();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update role');
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this organization?')) return;

    try {
      const response = await api.leaveOrganization();
      if (response.success) {
        toast.success('You have left the organization');
        fetchUser();
        setOrganization(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to leave organization');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-slate-500">Loading organization...</p>
        </div>
      </div>
    );
  }

  // No organization - show create form
  if (!organization) {
    return (
      <div className="min-h-screen bg-mesh">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
              <Building className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Organization</h1>
            <p className="text-slate-500">Create or join an organization for team collaboration</p>
          </div>

          {!showCreateForm ? (
            <Card variant="elevated" className="text-center">
              <CardContent className="py-12">
                <Building className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">No Organization</h2>
                <p className="text-slate-500 mb-6">
                  You&apos;re not part of an organization yet. Create one to collaborate with your team.
                </p>
                <Button variant="gradient" onClick={() => setShowCreateForm(true)}>
                  Create Organization
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Create Organization</CardTitle>
                <CardDescription>Set up your organization for team collaboration</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrg} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="e.g., Acme Corporation"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Domain (optional)
                    </label>
                    <div className="flex items-center">
                      <span className="px-4 py-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500">
                        @
                      </span>
                      <input
                        type="text"
                        value={newOrgDomain}
                        onChange={(e) => setNewOrgDomain(e.target.value)}
                        placeholder="acme.com"
                        className="flex-1 px-4 py-3 rounded-r-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                      />
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      Users with this email domain can request to join
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" variant="gradient" isLoading={isSubmitting}>
                      Create Organization
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Has organization - show management
  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Building className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{organization.name}</h1>
              <div className="flex items-center gap-2 text-slate-500">
                {organization.domain && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    @{organization.domain}
                  </span>
                )}
                <Badge variant={organization.isAdmin ? 'gradient' : 'default'} size="sm">
                  {organization.isAdmin ? 'Admin' : 'Member'}
                </Badge>
              </div>
            </div>
          </div>

          {organization.isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Settings className="h-4 w-4" />}
                onClick={() => setShowSettings(!showSettings)}
              >
                Settings
              </Button>
              <Button
                variant="gradient"
                size="sm"
                leftIcon={<UserPlus className="h-4 w-4" />}
                onClick={() => setShowInviteForm(true)}
              >
                Invite Member
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card variant="elevated">
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Members</p>
                  <p className="text-2xl font-bold text-slate-900">{organization.members.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Crown className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Seats Used</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {organization.subscription?.seatsUsed || 0} / {organization.subscription?.seatsTotal || 5}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="col-span-2 sm:col-span-1">
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Anonymization</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {organization.anonymizationEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Form */}
        {showSettings && organization.isAdmin && (
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Organization Settings</CardTitle>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSettings} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={settingsName}
                      onChange={(e) => setSettingsName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Domain
                    </label>
                    <input
                      type="text"
                      value={settingsDomain}
                      onChange={(e) => setSettingsDomain(e.target.value)}
                      placeholder="acme.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsAnonymization}
                    onChange={(e) => setSettingsAnonymization(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-slate-900">Enable Resume Anonymization</span>
                    <p className="text-sm text-slate-500">Remove personal details from resumes for unbiased hiring</p>
                  </div>
                </label>

                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Save Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Invite Form */}
        {showInviteForm && (
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invite Team Member</CardTitle>
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                </div>
                <Button type="submit" variant="gradient" isLoading={isSubmitting}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invite
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Members List */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {organization.members.map((member) => (
                <div key={member.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {(member.firstName?.[0] || member.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : member.email}
                      </p>
                      <p className="text-sm text-slate-500">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={member.role === 'ORG_ADMIN' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {member.role === 'ORG_ADMIN' ? 'Admin' : 'Member'}
                    </Badge>

                    {organization.isAdmin && member.id !== user?.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            handleUpdateRole(
                              member.id,
                              member.role === 'ORG_ADMIN' ? 'ORG_USER' : 'ORG_ADMIN'
                            )
                          }
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title={member.role === 'ORG_ADMIN' ? 'Demote to member' : 'Promote to admin'}
                        >
                          {member.role === 'ORG_ADMIN' ? (
                            <User className="h-4 w-4 text-slate-500" />
                          ) : (
                            <Crown className="h-4 w-4 text-amber-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id, member.email)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    )}

                    {member.id === user?.id && (
                      <span className="text-xs text-slate-400">(You)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leave Organization */}
        {!organization.isAdmin && (
          <Card variant="elevated" className="border-red-200">
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Leave Organization</h3>
                  <p className="text-sm text-slate-500">
                    You will lose access to organization features
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  leftIcon={<LogOut className="h-4 w-4" />}
                  onClick={handleLeave}
                >
                  Leave
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
