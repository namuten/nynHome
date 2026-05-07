import React from 'react';
import { RouteTracker } from './RouteTracker';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Global provider to handle automatic route views and custom user events.
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  return (
    <>
      <RouteTracker />
      {children}
    </>
  );
};
