import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { Sidebar } from '../components/Sidebar';
import type { ShellNavId } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

export type { ShellNavId } from '../components/Sidebar';

interface AppShellProps extends PropsWithChildren {
  activeNav: ShellNavId;
  headerContext: 'alerts' | 'investigations' | 'incidents' | 'handover';
  onNavSelect: (id: ShellNavId) => void;
}

export function AppShell({ children, activeNav, headerContext, onNavSelect }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const handleNavSelect = useCallback(
    (id: ShellNavId) => {
      onNavSelect(id);
      setMobileNavOpen(false);
    },
    [onNavSelect]
  );

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (mq.matches) {
        setMobileNavOpen(false);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="flex min-h-screen bg-ops-canvas text-ops-foreground">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-ops-canvas/75 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={closeMobileNav}
        />
      ) : null}

      <Sidebar
        activeNav={activeNav}
        onNavSelect={handleNavSelect}
        mobileOpen={mobileNavOpen}
        onMobileClose={closeMobileNav}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar context={headerContext} onOpenNavigation={() => setMobileNavOpen(true)} />
        <main className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
          <div className="mx-auto max-w-[1680px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
