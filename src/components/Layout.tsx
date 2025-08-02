import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 px-4 py-12">
      <div className="w-full max-w-lg md:max-w-4xl mx-auto">
        {children}
      </div>
    </main>
  );
}