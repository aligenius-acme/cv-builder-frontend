'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  User,
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Palette,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, fetchUser } = useAuthStore();

  // Profile state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const response = await api.updateProfile({ firstName, lastName });
      if (response.success) {
        await fetchUser();
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await api.changePassword(currentPassword, newPassword);
      if (response.success) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadge = (role: string | undefined) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="error">Admin</Badge>;
      default:
        return <Badge variant="default">User</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)]">Settings</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your account preferences</p>
        </div>

        {/* Account Overview */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Account Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[var(--text)]">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : 'Set your name'}
                </h3>
                <p className="text-[var(--text-secondary)]">{user?.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  {getRoleBadge(user?.role)}
                </div>
              </div>
              {user?.emailVerified ? (
                <Badge variant="success" size="lg">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="warning" size="lg">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Unverified
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Credits */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Credits
            </CardTitle>
            <CardDescription>
              Your AI-powered feature usage credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Credit Display */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Remaining Credits</p>
                  <p className="text-4xl font-bold text-[var(--text)]">
                    {user?.aiCredits ?? 0}
                    <span className="text-lg text-[var(--text-muted)] ml-2">/ 5</span>
                  </p>
                </div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Zap className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[var(--text-secondary)]">Usage</span>
                  <span className="text-[var(--text)] font-medium">
                    {user?.aiCreditsUsed ?? 0} used
                  </span>
                </div>
                <div className="h-3 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{
                      width: `${((user?.aiCreditsUsed ?? 0) / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  What are AI Credits?
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                  AI Credits are used when you access AI-powered features like resume tailoring,
                  ATS analysis, cover letter generation, interview preparation, and more.
                  Each user receives 5 lifetime credits to explore these premium features.
                </p>
              </div>

              {/* Credit Status Badge */}
              <div className="flex items-center justify-between pt-2">
                {(user?.aiCredits ?? 0) > 0 ? (
                  <Badge variant="success" size="lg">
                    <Zap className="h-4 w-4 mr-1" />
                    {user?.aiCredits} Credit{(user?.aiCredits ?? 0) !== 1 ? 's' : ''} Available
                  </Badge>
                ) : (
                  <Badge variant="warning" size="lg">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    No Credits Remaining
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="input-modern w-full px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="input-modern w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-muted)] cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1.5">Email cannot be changed</p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isUpdatingProfile}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-400" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="input-modern w-full px-4 py-3 pr-12 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="input-modern w-full px-4 py-3 pr-12 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="input-modern w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              <p className="text-xs text-[var(--text-muted)]">
                Password must be at least 8 characters long
              </p>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isChangingPassword}
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                  leftIcon={<Lock className="h-4 w-4" />}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-400" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Control how you receive updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[var(--surface-raised)] rounded-xl cursor-pointer hover:bg-[var(--border-subtle)] transition-colors">
                <div>
                  <h4 className="font-medium text-[var(--text)]">Email Notifications</h4>
                  <p className="text-sm text-[var(--text-secondary)]">Receive updates about your resume customizations</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-12 h-7 rounded-full transition-colors duration-200 ${
                    emailNotifications ? 'bg-blue-600' : 'bg-[var(--border)]'
                  }`}>
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
                      emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 bg-[var(--surface-raised)] rounded-xl cursor-pointer hover:bg-[var(--border-subtle)] transition-colors">
                <div>
                  <h4 className="font-medium text-[var(--text)]">Marketing Emails</h4>
                  <p className="text-sm text-[var(--text-secondary)]">Tips, updates, and promotional content</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={marketingEmails}
                    onChange={(e) => setMarketingEmails(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-12 h-7 rounded-full transition-colors duration-200 ${
                    marketingEmails ? 'bg-blue-600' : 'bg-[var(--border)]'
                  }`}>
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
                      marketingEmails ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card variant="elevated" className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900">
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-200">Delete Account</h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50"
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    toast.error('Account deletion is not implemented yet');
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
