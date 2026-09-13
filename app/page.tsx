'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import SummaryCards from '@/components/SummaryCards';
import TransactionForm from '@/components/TransactionForm';
import FilterBar from '@/components/FilterBar';
import TransactionList from '@/components/TransactionList';
import { TransactionItem, SummaryData, FilterType } from '@/types';
import { RefreshCw, Download } from 'lucide-react';
import { generateTransactionPdf } from '@/lib/pdfGenerator';

export default function DashboardPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('filter', filter);

      if (filter === 'monthly' && selectedMonth) {
        params.set('month', selectedMonth);
      } else if (filter === 'custom') {
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
      }

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      setTransactions(data.transactions || []);
      setSummary(
        data.summary || {
          totalBalance: 0,
          totalIncome: 0,
          totalExpenses: 0,
        }
      );
    } catch (err: unknown) {
      console.error('Error loading transactions:', err);
      setError(err instanceof Error ? err.message : 'Error loading transactions');
    } finally {
      setLoading(false);
    }
  }, [filter, startDate, endDate, selectedMonth]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDownloadPdf = () => {
    generateTransactionPdf({
      transactions,
      summary,
      filter,
      selectedMonth,
      startDate,
      endDate,
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-16 font-sans text-zinc-900 selection:bg-zinc-800 selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 space-y-7">
        {/* Controls Bar: Overview Title & Refresh */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs sm:text-sm font-bold tracking-wider text-zinc-500 uppercase">
              Financial Overview
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency badge */}
            <div className="rounded-xl border border-zinc-200/80 bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-zinc-700 shadow-sm">
              ₹ INR
            </div>

            {/* Manual refresh button */}
            <button
              onClick={() => fetchTransactions()}
              disabled={loading}
              title="Refresh transactions"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 bg-white text-zinc-500 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-800 active:scale-95 disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Top Summary Cards */}
        <SummaryCards
          summary={summary}
          currencySymbol={currencySymbol}
          loading={loading}
        />

        {/* Quick Add Form */}
        <TransactionForm
          onTransactionAdded={fetchTransactions}
          currencySymbol={currencySymbol}
        />

        {/* Filter Bar */}
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          totalCount={transactions.length}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-600 font-medium">
            <strong>Notice:</strong> {error}
          </div>
        )}

        {/* Transactions List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500">
              Transaction History
            </h2>
            <button
              onClick={handleDownloadPdf}
              disabled={loading || transactions.length === 0}
              title={transactions.length === 0 ? 'No transactions to export' : 'Download history as PDF'}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-zinc-800 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 text-zinc-600" />
              Download PDF
            </button>
          </div>

          <TransactionList
            transactions={transactions}
            currencySymbol={currencySymbol}
            loading={loading}
            onTransactionDeleted={fetchTransactions}
          />
        </div>
      </main>
    </div>
  );
}
