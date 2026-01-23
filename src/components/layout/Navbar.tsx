'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();

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
    { name: 'Subscription', href: '/subscription', icon: CreditCard },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const isMoreActive = moreNavigation.some(item => isActive(item.href));

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                JobTools AI
              </span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:ml-10 md:flex md:items-center md:space-x-1">
                {/* Primary Navigation */}
                {primaryNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                      isActive(item.href)
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <item.icon className={cn(
                      'h-4 w-4 mr-1.5',
                      isActive(item.href) ? 'text-indigo-600' : 'text-slate-400'
                    )} />
                    {item.name}
                  </Link>
                ))}

                {/* More Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                      isMoreActive
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <MoreHorizontal className={cn(
                      'h-4 w-4 mr-1.5',
                      isMoreActive ? 'text-indigo-600' : 'text-slate-400'
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
                      <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/60 py-2 z-20 animate-slide-down">
                        {moreNavigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setShowMoreMenu(false)}
                            className={cn(
                              'flex items-center px-4 py-2.5 text-sm transition-colors',
                              isActive(item.href)
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            )}
                          >
                            <item.icon className={cn(
                              'h-4 w-4 mr-3',
                              isActive(item.href) ? 'text-indigo-600' : 'text-slate-400'
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
          <div className="hidden md:flex md:items-center md:space-x-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
                  >
                    <Shield className="h-4 w-4 mr-2 text-amber-500" />
                    Admin
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
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
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/60 py-2 z-20 animate-slide-down">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        {userNavigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                            <item.icon className="h-4 w-4 mr-3 text-slate-400" />
                            {item.name}
                          </Link>
                        ))}
                        <div className="border-t border-slate-100 mt-2 pt-2">
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
                <Link href="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button variant="gradient">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="flex items-center space-x-3 px-3 py-3 mb-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>

                {/* All navigation items for mobile */}
                {allNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                      isActive(item.href)
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-5 w-5 mr-3 text-amber-500" />
                    Admin Panel
                  </Link>
                )}

                <div className="border-t border-slate-100 my-3" />

                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
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
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
                  <Button variant="gradient" className="w-full">Get Started Free</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
