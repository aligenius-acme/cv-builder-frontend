'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AppSettings {
  proSubscriptionEnabled: boolean;
  isLoaded: boolean;
}

const AppSettingsContext = createContext<AppSettings>({
  proSubscriptionEnabled: false,
  isLoaded: false,
});

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    proSubscriptionEnabled: false,
    isLoaded: false,
  });

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${apiUrl}/api/public/settings`)
      .then((r) => r.json())
      .then((body) => {
        setSettings({
          proSubscriptionEnabled: body.data?.proSubscriptionEnabled ?? false,
          isLoaded: true,
        });
      })
      .catch(() => {
        setSettings({ proSubscriptionEnabled: false, isLoaded: true });
      });
  }, []);

  return (
    <AppSettingsContext.Provider value={settings}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}
