'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Menu, X, FileText, Briefcase, CreditCard, Settings, LogOut, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FileText },
    { name: 'Resumes', href: '/resumes', icon: FileText },
    { name: 'Cover Letters', href: '/cover-letters', icon: Briefcase },
  ];

  const userNavigation = [
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Subscription', href: '/subscription', icon: CreditCard },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ResumeAI</span>
            </Link>

            {isAuthenticated && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md',
                      pathname === item.href || pathname.startsWith(item.href + '/')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                )}

                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">
                    <User className="h-5 w-5" />
                    <span>{user?.firstName || user?.email}</span>
                  </button>

                  <div className="absolute right-0 w-48 mt-2 py-1 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    ))}
                    <hr className="my-1" />
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'block px-4 py-2 text-base font-medium',
                      pathname === item.href
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <hr className="my-2" />
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-base font-medium text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
