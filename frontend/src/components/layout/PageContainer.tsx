import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(env(safe-area-inset-top)+4.5rem)] pb-28 md:py-10 overflow-y-auto md:overflow-visible [-webkit-overflow-scrolling:touch]">
      {children}
    </main>
  );
}
