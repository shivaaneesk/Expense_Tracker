'use client';

import React, { useState } from 'react';
import { TransactionItem } from '@/types';
import { format, parseISO } from 'date-fns';
import {
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Inbox,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface TransactionListProps {
  transactions: TransactionItem[];
  currencySymbol?: string;
  loading?: boolean;
  onTransactionDeleted: () => void;
}

export default function TransactionList({
  transactions,
  currencySymbol = '₹',
  loading = false,
  onTransactionDeleted,
}: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this transaction?');
    if (!confirmed) return;

    setDeletingId(id);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete transaction');
      }

      onTransactionDeleted();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Error deleting item');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-400" />
        <p className="mt-2 text-xs font-medium text-zinc-400">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/50 p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
          <Inbox className="h-7 w-7" />
        </div>
        <h3 className="mt-3 text-base font-bold text-zinc-900">
          No transactions found
        </h3>
        <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">
          There are no records for the selected time filter. Add your first transaction above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {deleteError && (
        <div className="flex items-center gap-2 border-b border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/70 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Purpose</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {transactions.map((t) => {
              const isCredit = t.type === 'credit';
              const parsedDate = typeof t.date === 'string' ? parseISO(t.date) : new Date(t.date);
              const formattedDate = !isNaN(parsedDate.getTime())
                ? format(parsedDate, 'MMM d, yyyy')
                : 'Invalid date';

              return (
                <tr
                  key={t._id}
                  className="group transition-colors hover:bg-zinc-50/80"
                >
                  {/* Date */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 tabular-nums font-medium">
                    {formattedDate}
                  </td>

                  {/* Type Badge */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        isCredit
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                          : 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-500/10'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                      )}
                      {isCredit ? 'Credit' : 'Debit'}
                    </span>
                  </td>

                  {/* Purpose */}
                  <td className="px-6 py-4 text-sm sm:text-base font-semibold text-zinc-900 max-w-md truncate">
                    {t.purpose}
                  </td>

                  {/* Amount */}
                  <td className="whitespace-nowrap px-6 py-4 text-right font-bold tabular-nums text-sm sm:text-base">
                    <span
                      className={
                        isCredit
                          ? 'text-emerald-600'
                          : 'text-zinc-900'
                      }
                    >
                      {isCredit ? '+' : '-'}{currencySymbol}{formatCurrency(t.amount)}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(t._id)}
                      disabled={deletingId === t._id}
                      title="Delete Transaction"
                      className="rounded-lg p-2 text-zinc-400 opacity-60 transition-all hover:bg-rose-50 hover:text-rose-600 hover:opacity-100 group-hover:opacity-100 disabled:opacity-30"
                    >
                      {deletingId === t._id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card / List View */}
      <div className="divide-y divide-zinc-100 sm:hidden">
        {transactions.map((t) => {
          const isCredit = t.type === 'credit';
          const parsedDate = typeof t.date === 'string' ? parseISO(t.date) : new Date(t.date);
          const formattedDate = !isNaN(parsedDate.getTime())
            ? format(parsedDate, 'MMM d, yyyy')
            : 'Invalid date';

          return (
            <div
              key={t._id}
              className="flex items-center justify-between p-4 transition-colors hover:bg-zinc-50/50"
            >
              <div className="flex items-start gap-3 min-w-0 pr-3">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isCredit
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {isCredit ? (
                    <ArrowDownRight className="h-4.5 w-4.5" />
                  ) : (
                    <ArrowUpRight className="h-4.5 w-4.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {t.purpose}
                  </p>
                  <p className="text-xs text-zinc-500 tabular-nums">
                    {formattedDate} • {isCredit ? 'Credit' : 'Debit'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold tabular-nums ${
                    isCredit ? 'text-emerald-600' : 'text-zinc-900'
                  }`}
                >
                  {isCredit ? '+' : '-'}{currencySymbol}{formatCurrency(t.amount)}
                </span>
                <button
                  onClick={() => handleDelete(t._id)}
                  disabled={deletingId === t._id}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  {deletingId === t._id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
