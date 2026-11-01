'use client';

import React from 'react';
import { FilterType } from '@/types';
import { Calendar, Filter, Clock } from 'lucide-react';

interface FilterBarProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  selectedMonth: string;
  onMonthChange: (val: string) => void;
  totalCount: number;
  filteredCount?: number;
}

export default function FilterBar({
  filter,
  onFilterChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedMonth,
  onMonthChange,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const filterOptions: { id: FilterType; label: string }[] = [
    { id: 'weekly', label: 'Weekly (Current Week)' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'custom', label: 'Custom Range' },
    { id: 'all', label: 'All Transactions' },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Tab selection */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-zinc-100/90 p-1 ring-1 ring-black/5">
          {filterOptions.map((opt) => {
            const isActive = filter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onFilterChange(opt.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {opt.id === 'weekly' && <Clock className="h-3.5 w-3.5" />}
                {opt.id === 'monthly' && <Calendar className="h-3.5 w-3.5" />}
                {opt.id === 'custom' && <Filter className="h-3.5 w-3.5" />}
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Right: Record count indicator */}
        <div className="text-xs sm:text-sm font-medium text-zinc-500">
          {filteredCount !== undefined && filteredCount !== totalCount ? (
            <>
              Showing <span className="text-zinc-900 font-bold">{filteredCount}</span> of{' '}
              <span className="text-zinc-900 font-bold">{totalCount}</span> {totalCount === 1 ? 'record' : 'records'}
            </>
          ) : (
            <>
              Showing <span className="text-zinc-900 font-bold">{totalCount}</span>{' '}
              {totalCount === 1 ? 'record' : 'records'}
            </>
          )}
        </div>
      </div>

      {/* Conditional Sub-controls for Monthly or Custom Range */}
      {filter === 'monthly' && (
        <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 text-sm">
          <span className="text-zinc-600 font-medium flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-zinc-400" />
            Select Month:
          </span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="rounded-lg border border-zinc-200/90 bg-zinc-50/60 px-3 py-1.5 text-sm text-zinc-800 focus:border-zinc-800 focus:outline-none"
          />
        </div>
      )}

      {filter === 'custom' && (
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-zinc-100 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-zinc-600 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="rounded-lg border border-zinc-200/90 bg-zinc-50/60 px-3 py-1.5 text-sm text-zinc-800 focus:border-zinc-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-600 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="rounded-lg border border-zinc-200/90 bg-zinc-50/60 px-3 py-1.5 text-sm text-zinc-800 focus:border-zinc-800 focus:outline-none"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => {
                onStartDateChange('');
                onEndDateChange('');
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 underline font-medium"
            >
              Reset range
            </button>
          )}
        </div>
      )}
    </div>
  );
}
