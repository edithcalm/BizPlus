// Simulated M-Pesa Daraja API Service
// In production, this would connect to Safaricom's sandbox/live API

import { Transaction } from '@/types/bizplus';

export interface MpesaCredentials {
  tillNumber?: string;
  paybillNumber?: string;
  businessName: string;
  isConnected: boolean;
  connectedAt?: Date;
}

export interface MpesaTransaction {
  transactionId: string;
  transactionCode: string;
  transactionType: 'RECEIVED' | 'SENT' | 'PAYBILL' | 'BUYGOODS';
  amount: number;
  phoneNumber: string;
  partyName: string;
  accountReference?: string;
  transactionDate: Date;
  balance: number;
}

// Kenyan names for realistic simulation
const kenyanNames = [
  'John Mwangi', 'Mary Wanjiku', 'Peter Kamau', 'Jane Njeri', 'David Ochieng',
  'Grace Akinyi', 'Samuel Kiprop', 'Elizabeth Chebet', 'James Otieno', 'Sarah Wambui',
  'Michael Kibet', 'Ann Nyambura', 'Joseph Mutua', 'Lucy Muthoni', 'Daniel Kimani',
  'Esther Wairimu', 'Stephen Omondi', 'Rose Adhiambo', 'Paul Kiptoo', 'Faith Njoki'
];

// Business descriptions
const businessDescriptions = [
  'Shop purchase', 'Grocery supplies', 'Hardware materials', 'Food order',
  'Retail goods', 'Wholesale order', 'Services payment', 'Product delivery',
  'Stock purchase', 'Equipment rental'
];

// Generate realistic M-Pesa transaction code (format: QJK2L5M8N9)
const generateTransactionCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Generate Kenyan phone number
const generatePhoneNumber = (): string => {
  const prefixes = ['0712', '0722', '0733', '0741', '0757', '0768', '0790', '0110', '0111'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return prefix + suffix;
};

// Simulate fetching transactions from M-Pesa API
export const fetchMpesaTransactions = async (
  credentials: MpesaCredentials,
  count: number = 5
): Promise<MpesaTransaction[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
  
  if (!credentials.isConnected) {
    throw new Error('M-Pesa account not connected');
  }

  const transactions: MpesaTransaction[] = [];
  let balance = 15000 + Math.random() * 20000;

  for (let i = 0; i < count; i++) {
    const isReceived = Math.random() > 0.25; // 75% are incoming payments
    const amount = Math.round((500 + Math.random() * 4500) / 100) * 100; // Round to nearest 100
    
    if (isReceived) {
      balance += amount;
    } else {
      balance -= amount;
    }

    transactions.push({
      transactionId: `TXN${Date.now()}${i}`,
      transactionCode: generateTransactionCode(),
      transactionType: isReceived ? 'RECEIVED' : 'SENT',
      amount,
      phoneNumber: generatePhoneNumber(),
      partyName: kenyanNames[Math.floor(Math.random() * kenyanNames.length)],
      accountReference: isReceived ? undefined : businessDescriptions[Math.floor(Math.random() * businessDescriptions.length)],
      transactionDate: new Date(Date.now() - i * (Math.random() * 3600000)),
      balance: Math.round(balance),
    });
  }

  return transactions;
};

// Convert M-Pesa transaction to app Transaction format
export const mpesaToTransaction = (mpesa: MpesaTransaction): Transaction => {
  const isIncome = mpesa.transactionType === 'RECEIVED' || mpesa.transactionType === 'BUYGOODS';
  
  return {
    id: mpesa.transactionId,
    type: isIncome ? 'income' : 'expense',
    amount: mpesa.amount,
    method: 'mpesa',
    description: isIncome 
      ? `Payment from ${mpesa.partyName}` 
      : `Paid to ${mpesa.partyName}${mpesa.accountReference ? ` - ${mpesa.accountReference}` : ''}`,
    date: mpesa.transactionDate,
    mpesaCode: mpesa.transactionCode,
    customerName: mpesa.partyName,
  };
};

// Simulate real-time transaction webhook
export const simulateIncomingTransaction = (credentials: MpesaCredentials): MpesaTransaction | null => {
  if (!credentials.isConnected) return null;
  
  // 30% chance of generating a transaction
  if (Math.random() > 0.3) return null;

  const isReceived = Math.random() > 0.2; // 80% are incoming
  const amount = Math.round((200 + Math.random() * 3000) / 100) * 100;

  return {
    transactionId: `TXN${Date.now()}`,
    transactionCode: generateTransactionCode(),
    transactionType: isReceived ? 'RECEIVED' : 'SENT',
    amount,
    phoneNumber: generatePhoneNumber(),
    partyName: kenyanNames[Math.floor(Math.random() * kenyanNames.length)],
    transactionDate: new Date(),
    balance: Math.round(10000 + Math.random() * 30000),
  };
};

// Validate Till/Paybill number format
export const validateTillNumber = (till: string): boolean => {
  return /^\d{5,7}$/.test(till);
};

export const validatePaybillNumber = (paybill: string): boolean => {
  return /^\d{5,6}$/.test(paybill);
};

// Simulate connecting to M-Pesa (OAuth flow simulation)
export const connectMpesaAccount = async (
  tillOrPaybill: string,
  type: 'till' | 'paybill',
  businessName: string
): Promise<MpesaCredentials> => {
  // Simulate API connection delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Validate format
  if (type === 'till' && !validateTillNumber(tillOrPaybill)) {
    throw new Error('Invalid Till Number format. Should be 5-7 digits.');
  }
  if (type === 'paybill' && !validatePaybillNumber(tillOrPaybill)) {
    throw new Error('Invalid Paybill Number format. Should be 5-6 digits.');
  }

  return {
    tillNumber: type === 'till' ? tillOrPaybill : undefined,
    paybillNumber: type === 'paybill' ? tillOrPaybill : undefined,
    businessName,
    isConnected: true,
    connectedAt: new Date(),
  };
};

// Disconnect M-Pesa account
export const disconnectMpesaAccount = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

// Format M-Pesa message for display (like actual M-Pesa SMS format)
export const formatMpesaMessage = (txn: MpesaTransaction): string => {
  const date = txn.transactionDate.toLocaleDateString('en-KE', { 
    day: 'numeric', 
    month: 'numeric', 
    year: '2-digit' 
  });
  const time = txn.transactionDate.toLocaleTimeString('en-KE', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  if (txn.transactionType === 'RECEIVED') {
    return `${txn.transactionCode} Confirmed. You have received Ksh${txn.amount.toLocaleString()}.00 from ${txn.partyName.toUpperCase()} ${txn.phoneNumber} on ${date} at ${time}. New M-PESA balance is Ksh${txn.balance.toLocaleString()}.00.`;
  } else {
    return `${txn.transactionCode} Confirmed. Ksh${txn.amount.toLocaleString()}.00 sent to ${txn.partyName.toUpperCase()} on ${date} at ${time}.${txn.accountReference ? ` For ${txn.accountReference}.` : ''} New M-PESA balance is Ksh${txn.balance.toLocaleString()}.00.`;
  }
};
