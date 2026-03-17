'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/lib/theme';
import Logo from '@/components/ui/Logo';
import {
  Menu,
  X,
  FileText,
  Briefcase,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  User,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  DollarSign,
  Search,
  PenTool,
  Kanban,
  FlaskConical,
  GraduationCap,
  BookOpen,
  Wand2,
  MoreHorizontal,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import CreditBadge from '@/components/shared/CreditBadge';
import api from '@/lib/api';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  // Keep credit count in sync after any AI action without requiring a page refresh
  useEffect(() => {
    api.registerCreditSync((aiCredits, aiCreditsUsed) => {
      useAuthStore.setState(state => ({
        user: state.user ? { ...state.user, aiCredits, aiCreditsUsed } : null,
      }));
    });
  }, []);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Primary navigation - most used features
  const primaryNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Resumes', href: '/resumes', icon: FileText },
    { name: 'Builder', href: '/resume-builder', icon: PenTool },
    { name: 'Letters', href: '/cover-letters', icon: BookOpen },
    { name: 'AI Tools', href: '/ai-tools', icon: Wand2 },
    { name: 'Tracker', href: '/job-tracker', icon: Kanban },
    { name: 'Jobs', href: '/jobs', icon: Search },
  ];

  // Secondary navigation - "More" dropdown
  const moreNavigation = [
    { name: 'Interview Prep', href: '/interview-prep', icon: MessageSquare },
    { name: 'Salary Analyzer', href: '/salary-analyzer', icon: DollarSign },
    { name: 'A/B Testing', href: '/ab-testing', icon: FlaskConical },
    { name: 'Skill Gap', href: '/skill-gap', icon: GraduationCap },
  ];

  // All navigation for mobile
  const allNavigation = [...primaryNavigation, ...moreNavigation];

  const userNavigation = [
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const isMoreActive = moreNavigation.some(item => isActive(item.href));

  // Auto-close all dropdowns when route changes
  useEffect(() => {
    setShowUserMenu(false);
    setShowMoreMenu(false);
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-[var(--surface)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo size="sm" />
            </Link>

            {isAuthenticated && (
              <div className="hidden md:ml-10 md:flex md:items-center md:space-x-1">
                {/* Primary Navigation */}
                {primaryNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]'
                    )}
                  >
                    <item.icon className={cn(
                      'h-4 w-4 mr-1.5',
                      isActive(item.href) ? 'text-blue-600' : 'text-[var(--text-muted)]'
                    )} />
                    {item.name}
                  </Link>
                ))}

                {/* More Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      isMoreActive
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]'
                    )}
                  >
                    <MoreHorizontal className={cn(
                      'h-4 w-4 mr-1.5',
                      isMoreActive ? 'text-blue-600' : 'text-slate-400 dark:text-zinc-500'
                    )} />
                    More
                    <ChevronDown className={cn(
                      'h-3.5 w-3.5 ml-1 transition-transform duration-200',
                      showMoreMenu && 'rotate-180'
                    )} />
                  </button>

                  {showMoreMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMoreMenu(false)}
                      />
                      <div className="absolute left-0 mt-2 w-56 bg-[var(--surface)] rounded-xl shadow-[var(--shadow-lg)] border border-[var(--border)] py-2 z-20 animate-slide-down">
                        {moreNavigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setShowMoreMenu(false)}
                            className={cn(
                              'flex items-center px-4 py-2.5 text-sm transition-colors',
                              isActive(item.href)
                                ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'
                            )}
                          >
                            <item.icon className={cn(
                              'h-4 w-4 mr-3',
                              isActive(item.href) ? 'text-blue-600' : 'text-[var(--text-muted)]'
                            )} />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] rounded-lg transition-all duration-200"
                  >
                    <Shield className="h-4 w-4 mr-2 text-amber-500" />
                    Admin
                  </Link>
                )}

                {/* AI Credits Badge */}
                {user?.aiCredits !== undefined && (
                  <CreditBadge
                    total={user.aiCredits}
                    used={user.aiCreditsUsed || 0}
                    showLabel={false}
                  />
                )}

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] transition-all duration-200"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] rounded-lg transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden lg:block">{user?.firstName || 'User'}</span>
                    <ChevronDown className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      showUserMenu && 'rotate-180'
                    )} />
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] rounded-xl shadow-[var(--shadow-lg)] border border-[var(--border)] py-2 z-20 animate-slide-down">
                        <div className="px-4 py-3 border-b border-[var(--border)]">
                          <p className="text-sm font-semibold text-[var(--text)]">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                        </div>
                        {userNavigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)] transition-colors"
                          >
                            <item.icon className="h-4 w-4 mr-3 text-[var(--text-muted)]" />
                            {item.name}
                          </Link>
                        ))}
                        <div className="border-t border-[var(--border)] mt-2 pt-2">
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                              router.push('/login');
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Theme Toggle (unauthenticated) */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] transition-all duration-200"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <Link href="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[var(--surface)] border-t border-[var(--border)] animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="flex items-center space-x-3 px-3 py-3 mb-3 bg-[var(--surface-raised)] rounded-xl">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
                  </div>
                </div>

                {/* AI Credits Badge (Mobile) */}
                {user?.aiCredits !== undefined && (
                  <div className="px-3 mb-3">
                    <CreditBadge
                      total={user.aiCredits}
                      used={user.aiCreditsUsed || 0}
                      showLabel={true}
                      className="w-full justify-center"
                    />
                  </div>
                )}

                {/* All navigation items for mobile */}
                {allNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                ))}

                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className={cn(
                      'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                      isActive('/admin')
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-5 w-5 mr-3 text-amber-500" />
                    Admin Panel
                  </Link>
                )}

                <div className="border-t border-[var(--border)] my-3" />

                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] rounded-xl transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                ))}

                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                    router.push('/login');
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block"
                  onClick={() => setIsOpen(false)}
                >
                  <Button variant="outline" className="w-full">Sign in</Button>
                </Link>
                <Link
                  href="/register"
                  className="block"
                  onClick={() => setIsOpen(false)}
                >
                  <Button variant="primary" className="w-full">Get Started Free</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
