import React from 'react';
import { PartyPopper } from 'lucide-react';

interface DashboardProps {
  name: string;
}

export function DashboardPlaceholder({ name }: DashboardProps) {
  return (
    <div className="w-full max-w-md mx-auto text-center animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-accent/20">
        <PartyPopper className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-bold text-ink mb-4">Welcome, {name}!</h1>
      <p className="text-slate-600 text-lg">Your profile is fully set up.</p>
      <div className="mt-12 p-8 bg-surface-alt rounded-xl border border-border shadow-sm">
        <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Dashboard features coming soon...</p>
      </div>
    </div>
  );
}
