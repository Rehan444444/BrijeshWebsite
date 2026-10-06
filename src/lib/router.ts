import { useState, useEffect, useCallback } from 'react';

export type Route =
  | { name: 'dashboard' }
  | { name: 'scan' }
  | { name: 'review'; id: string }
  | { name: 'invoices' }
  | { name: 'invoice'; id: string };

function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  if (h.startsWith('scan')) return { name: 'scan' };
  if (h.startsWith('review/')) {
    const id = h.substring('review/'.length);
    return { name: 'review', id };
  }
  if (h.startsWith('invoices')) return { name: 'invoices' };
  if (h.startsWith('invoice/')) {
    const id = h.substring('invoice/'.length);
    return { name: 'invoice', id };
  }
  return { name: 'dashboard' };
}

function toHash(route: Route): string {
  switch (route.name) {
    case 'dashboard': return '#/';
    case 'scan': return '#/scan';
    case 'review': return `#/review/${route.id}`;
    case 'invoices': return '#/invoices';
    case 'invoice': return `#/invoice/${route.id}`;
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>({ name: 'dashboard' });

  useEffect(() => {
    setRoute(parseHash(window.location.hash));
    const handler = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((r: Route) => {
    window.location.hash = toHash(r);
  }, []);

  return { route, navigate };
}
