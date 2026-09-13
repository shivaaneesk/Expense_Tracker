'use client';

import React, { useState } from 'react';
import { TransactionType } from '@/types';
import { Plus, Loader2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface TransactionFormProps {
  onTransactionAdded: () => void;
  currencySymbol?: string;
}

export default function TransactionForm({
  onTransactionAdded,
  currencySymbol = '₹',
}: TransactionFormProps) {
  const todayIso = new Date().toISOString().split('T')[0];

  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayIso);
  const [type, setType] = useState<TransactionType>('debit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!purpose.trim()) {
      setError('Please enter a description / purpose.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: purpose.trim(),
          amount: numAmount,
          date: date || todayIso,
          type,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record transaction');
      }

      // Reset form
      setPurpose('');
      setAmount('');
      setDate(todayIso);
      onTransactionAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900">
            Quick Add Transaction
          </h2>
          <p className="text-sm text-zinc-500">
            Record a new incoming or outgoing expense
          </p>
        </div>

        {/* Segmented Type Toggle */}
        <div className="flex rounded-xl bg-zinc-100/90 p-1 ring-1 ring-black/5">
          <button
            type="button"
            onClick={() => setType('debit')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
              type === 'debit'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ArrowUpCircle className="h-4 w-4" />
            Debit (Expense)
          </button>
          <button
            type="button"
            onClick={() => setType('credit')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
              type === 'credit'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ArrowDownCircle className="h-4 w-4" />
            Credit (Income)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          {/* Purpose Input */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Purpose / Description
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="enter the purpose alone"
              className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/60 px-4 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-800 transition-all"
            />
          </div>

          {/* Amount Input */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Amount ({currencySymbol})
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-base font-medium text-zinc-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/60 pl-9 pr-4 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-800 tabular-nums transition-all"
              />
            </div>
          </div>

          {/* Date Input */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/60 px-4 py-2.5 text-base text-zinc-800 focus:border-zinc-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-800 transition-all"
            />
          </div>
        </div>

        {/* Submit button bar */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98] ${
              type === 'credit'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-zinc-900 hover:bg-zinc-800'
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add {type === 'credit' ? 'Income' : 'Expense'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
