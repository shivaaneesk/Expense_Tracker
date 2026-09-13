export type TransactionType = 'debit' | 'credit';

export interface TransactionItem {
  _id: string;
  date: string;
  purpose: string;
  amount: number;
  type: TransactionType;
  createdAt?: string;
  updatedAt?: string;
}

export interface SummaryData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export type FilterType = 'weekly' | 'monthly' | 'custom' | 'all';
