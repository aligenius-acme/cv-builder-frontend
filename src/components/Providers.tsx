'use client';

import { ThemeProvider } from '@/lib/theme';
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppSettingsProvider>
        {children}
      </AppSettingsProvider>
    </ThemeProvider>
  );
}
