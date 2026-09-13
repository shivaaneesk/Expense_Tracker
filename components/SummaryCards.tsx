'use client';

import React from 'react';
import { SummaryData } from '@/types';
import { Wallet, ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react';

interface SummaryCardsProps {
  summary: SummaryData;
  currencySymbol?: string;
  loading?: boolean;
}

export default function SummaryCards({
  summary,
  currencySymbol = '₹',
  loading = false,
}: SummaryCardsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(val));
  };

  const isBalancePositive = summary.totalBalance >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
      {/* Total Balance Card */}
      <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Total Net Balance
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
              isBalancePositive
                ? 'bg-zinc-900 text-white'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            {isBalancePositive ? (
              <Wallet className="h-4.5 w-4.5" />
            ) : (
              <Scale className="h-4.5 w-4.5" />
            )}
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-base sm:text-lg font-semibold text-zinc-400">
            {currencySymbol}
          </span>
          <span
            className={`text-3xl sm:text-4xl font-bold tracking-tight tabular-nums ${
              loading
                ? 'opacity-40'
                : isBalancePositive
                ? 'text-zinc-900'
                : 'text-rose-600'
            }`}
          >
            {loading ? '---' : `${isBalancePositive ? '' : '-'}${formatCurrency(summary.totalBalance)}`}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-zinc-500 font-medium">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isBalancePositive ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
          <span>
            {isBalancePositive ? 'Healthy Cashflow' : 'Negative Balance Warning'}
          </span>
        </div>
      </div>

      {/* Total Income Card */}
      <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Total Income (Credits)
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors">
            <ArrowDownRight className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-base sm:text-lg font-semibold text-emerald-600">
            +{currencySymbol}
          </span>
          <span
            className={`text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-zinc-900 ${
              loading ? 'opacity-40' : ''
            }`}
          >
            {loading ? '---' : formatCurrency(summary.totalIncome)}
          </span>
        </div>

        <div className="mt-3 text-xs sm:text-sm text-zinc-500 font-medium">
          Incoming cashflow recorded
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-rose-500">
            Total Expenses (Debits)
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-colors">
            <ArrowUpRight className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-base sm:text-lg font-semibold text-rose-500">
            -{currencySymbol}
          </span>
          <span
            className={`text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-zinc-900 ${
              loading ? 'opacity-40' : ''
            }`}
          >
            {loading ? '---' : formatCurrency(summary.totalExpenses)}
          </span>
        </div>

        <div className="mt-3 text-xs sm:text-sm text-zinc-500 font-medium">
          Outgoing payments & bills
        </div>
      </div>
    </div>
  );
}
