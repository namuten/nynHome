import { useLocation } from 'react-router-dom';
import { trackEvent, isOptedOut, setOptOut } from '../lib/analytics';

/**
 * React hook to track custom interaction events dynamically within components.
 */
export function useAnalytics() {
  const location = useLocation();

  const track = (eventName: string, metadata?: Record<string, any>) => {
    trackEvent({
      eventName,
      route: location.pathname,
      metadata,
    });
  };

  return {
    track,
    isOptedOut,
    setOptOut,
  };
}
