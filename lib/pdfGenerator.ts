import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TransactionItem, SummaryData, FilterType } from '@/types';
import { format, parseISO } from 'date-fns';

interface GeneratePdfProps {
  transactions: TransactionItem[];
  summary: SummaryData;
  filter: FilterType;
  selectedMonth?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export function generateTransactionPdf({
  transactions,
  summary,
  filter,
  selectedMonth,
  startDate,
  endDate,
  searchQuery,
}: GeneratePdfProps) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Header Banner
  doc.setFillColor(24, 24, 27); // Zinc 900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ThotamTracker', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(212, 212, 216); // Zinc 300
  doc.text('Transaction History & Expense Statement', 14, 20);

  const todayStr = format(new Date(), 'dd MMM yyyy, hh:mm a');
  doc.text(`Generated: ${todayStr}`, pageWidth - 14, 13, { align: 'right' });

  // Filter description
  let filterText = 'All Transactions';
  if (filter === 'weekly') filterText = 'Period: Current Week';
  else if (filter === 'monthly') filterText = `Period: ${selectedMonth || 'Current Month'}`;
  else if (filter === 'custom') filterText = `Period: ${startDate || 'Start'} to ${endDate || 'End'}`;

  if (searchQuery) {
    filterText += ` • Search: "${searchQuery}"`;
  }

  doc.text(filterText, pageWidth - 14, 20, { align: 'right' });

  // 2. Financial Summary Box
  const boxY = 36;
  doc.setDrawColor(228, 228, 231); // Zinc 200
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(14, boxY, pageWidth - 28, 24, 3, 3, 'FD');

  const colWidth = (pageWidth - 28) / 3;

  // Net Balance
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122); // Zinc 500
  doc.setFont('helvetica', 'bold');
  doc.text('NET BALANCE', 20, boxY + 8);
  doc.setFontSize(14);
  const isPositive = summary.totalBalance >= 0;
  doc.setTextColor(isPositive ? 24 : 225, isPositive ? 24 : 29, isPositive ? 27 : 72);
  const sign = isPositive ? '' : '-';
  doc.text(`${sign}Rs. ${Math.abs(summary.totalBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 20, boxY + 18);

  // Total Income
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL INCOME', 20 + colWidth, boxY + 8);
  doc.setFontSize(14);
  doc.setTextColor(22, 163, 74); // Emerald 600
  doc.text(`+Rs. ${summary.totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 20 + colWidth, boxY + 18);

  // Total Expenses
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL EXPENSES', 20 + colWidth * 2, boxY + 8);
  doc.setFontSize(14);
  doc.setTextColor(225, 29, 72); // Rose 600
  doc.text(`-Rs. ${summary.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 20 + colWidth * 2, boxY + 18);

  // 3. Transactions Table
  const tableData = transactions.map((t, idx) => {
    const parsedDate = typeof t.date === 'string' ? parseISO(t.date) : new Date(t.date);
    const dateFormatted = !isNaN(parsedDate.getTime())
      ? format(parsedDate, 'dd MMM yyyy')
      : 'N/A';

    const isCredit = t.type === 'credit';
    const amountStr = `${isCredit ? '+' : '-'}Rs. ${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    return [
      (idx + 1).toString(),
      dateFormatted,
      isCredit ? 'Credit (Income)' : 'Debit (Expense)',
      t.purpose,
      amountStr,
    ];
  });

  autoTable(doc, {
    startY: boxY + 30,
    head: [['#', 'Date', 'Type', 'Purpose', 'Amount']],
    body: tableData.length > 0 ? tableData : [['-', '-', '-', 'No transactions recorded', '-']],
    theme: 'plain',
    headStyles: {
      fillColor: [244, 244, 245],
      textColor: [24, 24, 27],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 3.5,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      lineColor: [244, 244, 245],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 28 },
      2: { cellWidth: 32 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 4) {
        const rawText = String(data.cell.raw);
        if (rawText.startsWith('+')) {
          data.cell.styles.textColor = [22, 163, 74];
        } else if (rawText.startsWith('-')) {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 20 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didDrawPage: (data: any) => {
      // Footer
      const str = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170);
      doc.text(str, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      doc.text('ThotamTracker - Confidential Personal Finance Statement', 14, doc.internal.pageSize.getHeight() - 10);
    },
  });

  // Save the PDF
  const filename = `ThotamTracker_History_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`;
  doc.save(filename);
}
