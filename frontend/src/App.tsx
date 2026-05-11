import { useEffect, useState } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { AlertDetailsPage } from './pages/AlertDetailsPage';
import { AlertsDashboardPage } from './pages/AlertsDashboardPage';
import { IncidentDetailsPage } from './pages/IncidentDetailsPage';
import { IncidentsDashboardPage } from './pages/IncidentsDashboardPage';

type AppRoute =
  | { name: 'dashboard' }
  | {
      name: 'alert-details';
      alertId: string;
    }
  | { name: 'incidents' }
  | {
      name: 'incident-details';
      incidentId: string;
    };

function getRoute(pathname: string): AppRoute {
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
      alertId: decodeURIComponent(alertMatch[1])
    };
  }

  if (pathname === '/incidents') {
    return {
      name: 'incidents'
    };
  }

  return {
    name: 'dashboard'
  };
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => getRoute(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateToDashboard = () => {
    window.history.pushState({}, '', '/');
    setRoute({ name: 'dashboard' });
  };

  const navigateToIncidents = () => {
    window.history.pushState({}, '', '/incidents');
    setRoute({ name: 'incidents' });
  };

  const navigateToAlert = (alertId: string) => {
    window.history.pushState({}, '', `/alerts/${encodeURIComponent(alertId)}`);
    setRoute({
      name: 'alert-details',
      alertId
    });
  };

  const navigateToIncident = (incidentId: string) => {
    window.history.pushState({}, '', `/incidents/${encodeURIComponent(incidentId)}`);
    setRoute({
      name: 'incident-details',
      incidentId
    });
  };

  const activeView = route.name === 'dashboard' || route.name === 'alert-details' ? 'alerts' : 'incidents';

  return (
    <AppLayout
      activeView={activeView}
      onNavigateToAlerts={navigateToDashboard}
      onNavigateToIncidents={navigateToIncidents}
    >
      {route.name === 'dashboard' ? <AlertsDashboardPage onSelectAlert={navigateToAlert} /> : null}
      {route.name === 'alert-details' ? (
        <AlertDetailsPage
          alertId={route.alertId}
          onBack={navigateToDashboard}
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
          onOpenSourceAlert={navigateToAlert}
        />
      ) : null}
    </AppLayout>
  );
}
