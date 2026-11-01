'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import SummaryCards from '@/components/SummaryCards';
import TransactionForm from '@/components/TransactionForm';
import FilterBar from '@/components/FilterBar';
import TransactionList from '@/components/TransactionList';
import { TransactionItem, SummaryData, FilterType } from '@/types';
import { RefreshCw, Download, Search, X } from 'lucide-react';
import { generateTransactionPdf } from '@/lib/pdfGenerator';

export default function DashboardPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const query = searchQuery.trim().toLowerCase();
    return transactions.filter((t) =>
      t.purpose.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  const filteredSummary = useMemo(() => {
    if (!searchQuery.trim()) return summary;
    const income = filteredTransactions
      .filter((t) => t.type === 'credit')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === 'debit')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalBalance: Math.round((income - expense) * 100) / 100,
      totalIncome: Math.round(income * 100) / 100,
      totalExpenses: Math.round(expense * 100) / 100,
    };
  }, [transactions, filteredTransactions, searchQuery, summary]);

  const handleDownloadPdf = () => {
    generateTransactionPdf({
      transactions: filteredTransactions,
      summary: searchQuery.trim() ? filteredSummary : summary,
      filter,
      selectedMonth,
      startDate,
      endDate,
      searchQuery: searchQuery.trim() || undefined,
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
          filteredCount={searchQuery.trim() ? filteredTransactions.length : undefined}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-600 font-medium">
            <strong>Notice:</strong> {error}
          </div>
        )}

        {/* Transactions List */}
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500">
                Transaction History
              </h2>
              {searchQuery.trim() && (
                <span className="rounded-full bg-zinc-200/80 px-2 py-0.5 text-xs font-semibold text-zinc-700">
                  {filteredTransactions.length} of {transactions.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Search by purpose input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by purpose..."
                  className="w-full rounded-xl border border-zinc-200/90 bg-white py-2 pl-9 pr-8 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm transition-all focus:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={handleDownloadPdf}
                disabled={loading || filteredTransactions.length === 0}
                title={filteredTransactions.length === 0 ? 'No transactions to export' : 'Download history as PDF'}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-zinc-800 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Download className="h-4 w-4 text-zinc-600" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          <TransactionList
            transactions={filteredTransactions}
            currencySymbol={currencySymbol}
            loading={loading}
            onTransactionDeleted={fetchTransactions}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        </div>
      </main>
    </div>
  );
}
