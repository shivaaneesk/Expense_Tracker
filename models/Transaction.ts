import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionType = 'debit' | 'credit';

export interface ITransaction extends Document {
  date: Date;
  purpose: string;
  amount: number;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    purpose: {
      type: String,
      required: [true, 'Please provide a purpose for this transaction'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a valid amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    type: {
      type: String,
      enum: {
        values: ['debit', 'credit'],
        message: '{VALUE} is not supported. Type must be either debit or credit.',
      },
      required: [true, 'Transaction type is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compiling model in Next.js hot reload
const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
