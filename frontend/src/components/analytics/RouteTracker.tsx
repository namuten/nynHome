import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../../lib/analytics';

/**
 * RouteTracker automatically tracks route changes and dispatches page_view events.
 */
export const RouteTracker: React.FC = () => {
  const location = useLocation();
  const prevPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    if (prevPathRef.current === currentPath) return;
    prevPathRef.current = currentPath;

    trackEvent({
      eventName: 'page_view',
      route: location.pathname,
      metadata: {
        search: location.search || undefined,
      },
    });
  }, [location]);

  return null;
};
