import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Transaction, { ITransaction } from '@/models/Transaction';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  parseISO,
} from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const monthParam = searchParams.get('month'); // optional YYYY-MM

    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (filter === 'weekly') {
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
      query.date = {
        $gte: startOfDay(weekStart),
        $lte: endOfDay(weekEnd),
      };
    } else if (filter === 'monthly') {
      let targetDate = now;
      if (monthParam) {
        const parsed = parseISO(`${monthParam}-01`);
        if (!isNaN(parsed.getTime())) {
          targetDate = parsed;
        }
      }
      query.date = {
        $gte: startOfMonth(targetDate),
        $lte: endOfMonth(targetDate),
      };
    } else if (filter === 'custom') {
      if (startDateParam && endDateParam) {
        const start = parseISO(startDateParam);
        const end = parseISO(endDateParam);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          query.date = {
            $gte: startOfDay(start),
            $lte: endOfDay(end),
          };
        }
      } else if (startDateParam) {
        const start = parseISO(startDateParam);
        if (!isNaN(start.getTime())) {
          query.date = { $gte: startOfDay(start) };
        }
      } else if (endDateParam) {
        const end = parseISO(endDateParam);
        if (!isNaN(end.getTime())) {
          query.date = { $lte: endOfDay(end) };
        }
      }
    }

    const searchParam = searchParams.get('search');
    if (searchParam && searchParam.trim()) {
      query.purpose = { $regex: searchParam.trim(), $options: 'i' };
    }

    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });

    const totalIncome = transactions
      .filter((t: ITransaction) => t.type === 'credit')
      .reduce((acc: number, curr: ITransaction) => acc + curr.amount, 0);

    const totalExpenses = transactions
      .filter((t: ITransaction) => t.type === 'debit')
      .reduce((acc: number, curr: ITransaction) => acc + curr.amount, 0);

    const totalBalance = totalIncome - totalExpenses;

    return NextResponse.json({
      success: true,
      count: transactions.length,
      summary: {
        totalBalance: Math.round(totalBalance * 100) / 100,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
      },
      transactions,
    });
  } catch (error: unknown) {
    console.error('GET /api/transactions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { date, purpose, amount, type } = body;

    if (!purpose || typeof purpose !== 'string' || purpose.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Transaction purpose is required' },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (!type || !['debit', 'credit'].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Type must be either 'debit' or 'credit'" },
        { status: 400 }
      );
    }

    const transactionDate = date ? new Date(date) : new Date();
    if (isNaN(transactionDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format provided' },
        { status: 400 }
      );
    }

    const newTransaction = await Transaction.create({
      date: transactionDate,
      purpose: purpose.trim(),
      amount: numericAmount,
      type,
    });

    return NextResponse.json(
      {
        success: true,
        data: newTransaction,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('POST /api/transactions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
