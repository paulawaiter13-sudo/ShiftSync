import { useEffect, useState } from 'react';
import { AppShell, type ShellNavId } from './layouts/AppShell';
import { AlertDetailsPage } from './pages/AlertDetailsPage';
import { AlertsDashboardPage } from './pages/AlertsDashboardPage';
import { CreateHandoverPage } from './pages/CreateHandoverPage';
import { HandoverDetailsPage } from './pages/HandoverDetailsPage';
import { HandoversPage } from './pages/HandoversPage';
import { IncidentDetailsPage } from './pages/IncidentDetailsPage';
import { IncidentsDashboardPage } from './pages/IncidentsDashboardPage';
import { InvestigationsPage } from './pages/InvestigationsPage';

type AlertReturnTo = 'alerts' | 'investigations';

type AppRoute =
  | { name: 'dashboard' }
  | { name: 'investigations' }
  | {
      name: 'alert-details';
      alertId: string;
      returnTo: AlertReturnTo;
    }
  | { name: 'incidents' }
  | {
      name: 'incident-details';
      incidentId: string;
    }
  | { name: 'handovers' }
  | { name: 'handover-new' }
  | {
      name: 'handover-details';
      handoverId: string;
    }
  | {
      name: 'handover-edit';
      handoverId: string;
    };

function parseAlertReturnTo(search: string): AlertReturnTo {
  const from = new URLSearchParams(search).get('from');
  return from === 'investigations' ? 'investigations' : 'alerts';
}

function getRoute(pathname: string, search: string): AppRoute {
  const handoverNew = pathname === '/handovers/new';
  const handoverEditMatch = pathname.match(/^\/handovers\/([^/]+)\/edit$/);
  const handoverDetailMatch = pathname.match(/^\/handovers\/([^/]+)$/);

  if (handoverNew) {
    return { name: 'handover-new' };
  }

  if (handoverEditMatch) {
    return {
      name: 'handover-edit',
      handoverId: decodeURIComponent(handoverEditMatch[1])
    };
  }

  if (handoverDetailMatch) {
    return {
      name: 'handover-details',
      handoverId: decodeURIComponent(handoverDetailMatch[1])
    };
  }

  if (pathname === '/handovers') {
    return { name: 'handovers' };
  }

  const incidentMatch = pathname.match(/^\/incidents\/([^/]+)$/);
  const alertMatch = pathname.match(/^\/alerts\/([^/]+)$/);

  if (incidentMatch) {
    return {
      name: 'incident-details',
      incidentId: decodeURIComponent(incidentMatch[1])
    };
  }

  if (alertMatch) {
    return {
      name: 'alert-details',
      alertId: decodeURIComponent(alertMatch[1]),
      returnTo: parseAlertReturnTo(search)
    };
  }

  if (pathname === '/incidents') {
    return { name: 'incidents' };
  }

  if (pathname === '/investigations') {
    return { name: 'investigations' };
  }

  if (pathname === '/' || pathname === '/alerts') {
    return { name: 'dashboard' };
  }

  return { name: 'dashboard' };
}

function readLocation(): AppRoute {
  return getRoute(window.location.pathname, window.location.search);
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => readLocation());

  useEffect(() => {
    const handlePopState = () => {
      setRoute(readLocation());
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateToAlerts = () => {
    window.history.pushState({}, '', '/alerts');
    setRoute({ name: 'dashboard' });
  };

  const navigateToInvestigations = () => {
    window.history.pushState({}, '', '/investigations');
    setRoute({ name: 'investigations' });
  };

  const navigateToIncidents = () => {
    window.history.pushState({}, '', '/incidents');
    setRoute({ name: 'incidents' });
  };

  const navigateToHandovers = () => {
    window.history.pushState({}, '', '/handovers');
    setRoute({ name: 'handovers' });
  };

  const navigateToCreateHandover = () => {
    window.history.pushState({}, '', '/handovers/new');
    setRoute({ name: 'handover-new' });
  };

  const navigateToHandover = (handoverId: string) => {
    window.history.pushState({}, '', `/handovers/${encodeURIComponent(handoverId)}`);
    setRoute({
      name: 'handover-details',
      handoverId
    });
  };

  const navigateToEditHandover = (handoverId: string) => {
    window.history.pushState({}, '', `/handovers/${encodeURIComponent(handoverId)}/edit`);
    setRoute({
      name: 'handover-edit',
      handoverId
    });
  };

  const navigateToAlert = (alertId: string, returnTo: AlertReturnTo = 'alerts') => {
    const query = returnTo === 'investigations' ? '?from=investigations' : '';
    window.history.pushState({}, '', `/alerts/${encodeURIComponent(alertId)}${query}`);
    setRoute({
      name: 'alert-details',
      alertId,
      returnTo
    });
  };

  const navigateToIncident = (incidentId: string) => {
    window.history.pushState({}, '', `/incidents/${encodeURIComponent(incidentId)}`);
    setRoute({
      name: 'incident-details',
      incidentId
    });
  };

  const activeNav: ShellNavId =
    route.name === 'investigations'
      ? 'investigations'
      : route.name === 'alert-details'
        ? route.returnTo === 'investigations'
          ? 'investigations'
          : 'alerts'
        : route.name === 'incidents' || route.name === 'incident-details'
            ? 'incidents'
            : route.name === 'handovers' ||
                route.name === 'handover-new' ||
                route.name === 'handover-details' ||
                route.name === 'handover-edit'
              ? 'handover'
              : 'alerts';

  const headerContext: 'alerts' | 'investigations' | 'incidents' | 'handover' =
    route.name === 'investigations' ||
    (route.name === 'alert-details' && route.returnTo === 'investigations')
      ? 'investigations'
      : route.name === 'incidents' || route.name === 'incident-details'
        ? 'incidents'
        : route.name === 'handovers' ||
            route.name === 'handover-new' ||
            route.name === 'handover-details' ||
            route.name === 'handover-edit'
          ? 'handover'
          : 'alerts';

  const handleNavSelect = (id: ShellNavId) => {
    if (id === 'incidents') {
      navigateToIncidents();
      return;
    }

    if (id === 'handover') {
      navigateToHandovers();
      return;
    }

    if (id === 'investigations') {
      navigateToInvestigations();
      return;
    }

    if (id === 'alerts') {
      navigateToAlerts();
    }
  };

  const alertDetailsBack =
    route.name === 'alert-details' && route.returnTo === 'investigations'
      ? navigateToInvestigations
      : navigateToAlerts;

  return (
    <AppShell activeNav={activeNav} headerContext={headerContext} onNavSelect={handleNavSelect}>
      {route.name === 'dashboard' ? (
        <AlertsDashboardPage onSelectAlert={(id) => navigateToAlert(id, 'alerts')} />
      ) : null}
      {route.name === 'investigations' ? (
        <InvestigationsPage onSelectAlert={(id) => navigateToAlert(id, 'investigations')} />
      ) : null}
      {route.name === 'alert-details' ? (
        <AlertDetailsPage
          alertId={route.alertId}
          onBack={alertDetailsBack}
          onNavigateToIncident={navigateToIncident}
        />
      ) : null}
      {route.name === 'incidents' ? (
        <IncidentsDashboardPage onSelectIncident={navigateToIncident} />
      ) : null}
      {route.name === 'incident-details' ? (
        <IncidentDetailsPage
          incidentId={route.incidentId}
          onBack={navigateToIncidents}
          onOpenSourceAlert={(id) => navigateToAlert(id, 'alerts')}
        />
      ) : null}
      {route.name === 'handovers' ? (
        <HandoversPage
          onCreate={navigateToCreateHandover}
          onView={navigateToHandover}
          onEdit={navigateToEditHandover}
        />
      ) : null}
      {route.name === 'handover-new' ? (
        <CreateHandoverPage
          mode="create"
          onCancel={navigateToHandovers}
          onSaved={navigateToHandover}
        />
      ) : null}
      {route.name === 'handover-details' ? (
        <HandoverDetailsPage
          handoverId={route.handoverId}
          onBack={navigateToHandovers}
          onEdit={navigateToEditHandover}
        />
      ) : null}
      {route.name === 'handover-edit' ? (
        <CreateHandoverPage
          mode="edit"
          handoverId={route.handoverId}
          onCancel={() => navigateToHandover(route.handoverId)}
          onSaved={navigateToHandover}
        />
      ) : null}
    </AppShell>
  );
}
