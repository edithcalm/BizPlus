export type PaymentMethod = 'mpesa' | 'cash' | 'pochi';
export type TransactionSource = 'till' | 'paybill' | 'pochi' | 'cash';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  method: PaymentMethod;
  source?: TransactionSource;
  description: string;
  date: Date;
  category?: string;
  mpesaCode?: string;
  customerName?: string;
}

export interface CreditEntry {
  id: string;
  customerName: string;
  phoneNumber?: string;
  amount: number;
  description: string;
  date: Date;
  dueDate?: Date;
  status: 'pending' | 'partial' | 'paid';
  payments: CreditPayment[];
}

export interface CreditPayment {
  id: string;
  amount: number;
  date: Date;
  method: PaymentMethod;
}

export interface DailySummary {
  date: Date;
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  mpesaSales: number;
  cashSales: number;
  pochiSales: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
  transactionCount: number;
}

export interface ChatMessage {
  id: string;
  type: 'sent' | 'received' | 'system';
  content: string;
  timestamp: Date;
  parsed?: ParsedMpesa;
}

export interface ParsedMpesa {
  transactionCode: string;
  amount: number;
  type: 'received' | 'sent';
  party: string;
  date: Date;
  balance?: number;
  source?: TransactionSource;
}

export interface SalesForecast {
  predictedRange: { min: number; max: number };
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  busyDays: string[];
  slowDays: string[];
}
