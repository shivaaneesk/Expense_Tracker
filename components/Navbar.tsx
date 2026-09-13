'use client';

import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar() {
  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm ring-1 ring-black/5">
            <Sparkles className="h-5 w-5 text-zinc-200" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900">
              ThotamTracker
            </h1>
            <p className="text-xs text-zinc-500 hidden sm:block">
              Minimal personal ledger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-zinc-500 tabular-nums">
            {todayStr}
          </div>
        </div>
      </div>
    </header>
  );
}
