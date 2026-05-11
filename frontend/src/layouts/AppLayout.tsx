import type { PropsWithChildren } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';

interface AppLayoutProps extends PropsWithChildren {
  activeView: 'alerts' | 'incidents';
  onNavigateToAlerts: () => void;
  onNavigateToIncidents: () => void;
}

export function AppLayout({
  children,
  activeView,
  onNavigateToAlerts,
  onNavigateToIncidents
}: AppLayoutProps) {
  return (
    <div className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-[1600px] gap-4 xl:grid-cols-[280px,minmax(0,1fr)]">
        <Sidebar
          activeView={activeView}
          onNavigateToAlerts={onNavigateToAlerts}
          onNavigateToIncidents={onNavigateToIncidents}
        />

        <main className="space-y-4">
          <TopHeader />
          {children}
        </main>
      </div>
    </div>
  );
}
