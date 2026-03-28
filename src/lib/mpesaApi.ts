/**
 * Simulated M-Pesa Daraja API Service containing Pochi la Biashara Support.
 * 
 * Note: In a real-world production environment, this code behaves as a placeholder 
 * that would directly interact with Safaricom's Daraja Sandbox or Live APIs
 * using authenticated OAuth API calls and registered webhooks.
 */

import { Transaction, TransactionSource, PaymentMethod } from '@/types/bizplus';

// Demo phone number for Pochi la Biashara
export const DEMO_PHONE_NUMBER = '0721606409';

export interface MpesaCredentials {
  tillNumber?: string;
  paybillNumber?: string;
  pochiPhoneNumber?: string;
  businessName: string;
  isConnected: boolean;
  connectedAt?: Date;
  hasPochi: boolean;
}

export interface MpesaTransaction {
  transactionId: string;
  transactionCode: string;
  transactionType: 'RECEIVED' | 'SENT' | 'PAYBILL' | 'BUYGOODS' | 'POCHI_RECEIVED' | 'POCHI_SENT';
  source: TransactionSource;
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

// Supplier names for expenses
const supplierNames = [
  'KPLC PREPAID', 'NAIROBI WATER', 'Safaricom', 'Kenya Power', 
  'Wholesale Supplier', 'Hardware Store', 'Transport Services', 'Fuel Station'
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

// Preloaded dummy transactions for demo (linked to 0721606409)
export const getDemoTransactions = (): MpesaTransaction[] => {
  const now = new Date();
  
  return [
    // Pochi la Biashara transactions
    {
      transactionId: 'POCHI001',
      transactionCode: 'RJK2L5M8N9',
      transactionType: 'POCHI_RECEIVED',
      source: 'pochi',
      amount: 2500,
      phoneNumber: '0712345678',
      partyName: 'John Mwangi',
      transactionDate: new Date(now.getTime() - 1000 * 60 * 30), // 30 mins ago
      balance: 18500,
    },
    {
      transactionId: 'POCHI002',
      transactionCode: 'SJK3M6N9P0',
      transactionType: 'POCHI_SENT',
      source: 'pochi',
      amount: 800,
      phoneNumber: '0723456789',
      partyName: 'Wholesale Supplier',
      accountReference: 'Stock purchase',
      transactionDate: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
      balance: 16000,
    },
    {
      transactionId: 'POCHI003',
      transactionCode: 'TJK4N7P0Q1',
      transactionType: 'POCHI_RECEIVED',
      source: 'pochi',
      amount: 1500,
      phoneNumber: '0734567890',
      partyName: 'Mary Wanjiku',
      transactionDate: new Date(now.getTime() - 1000 * 60 * 60 * 4), // 4 hours ago
      balance: 16800,
    },
    // M-Pesa (Till) transactions
    {
      transactionId: 'TILL001',
      transactionCode: 'QJK2L5M8N9',
      transactionType: 'BUYGOODS',
      source: 'till',
      amount: 1200,
      phoneNumber: '0745678901',
      partyName: 'Peter Kamau',
      transactionDate: new Date(now.getTime() - 1000 * 60 * 60), // 1 hour ago
      balance: 15300,
    },
    {
      transactionId: 'TILL002',
      transactionCode: 'UJK5P8Q1R2',
      transactionType: 'BUYGOODS',
      source: 'till',
      amount: 3500,
      phoneNumber: '0756789012',
      partyName: 'Jane Njeri',
      transactionDate: new Date(now.getTime() - 1000 * 60 * 60 * 3), // 3 hours ago
      balance: 14100,
    },
    // M-Pesa (Paybill) expenses
    {
      transactionId: 'PAYBILL001',
      transactionCode: 'VJK6Q9R2S3',
      transactionType: 'PAYBILL',
      source: 'paybill',
      amount: 500,
      phoneNumber: DEMO_PHONE_NUMBER,
      partyName: 'KPLC PREPAID',
      accountReference: 'Electricity token',
      transactionDate: new Date(now.getTime() - 1000 * 60 * 45), // 45 mins ago
      balance: 10600,
    },
    {
      transactionId: 'PAYBILL002',
      transactionCode: 'WJK7R0S3T4',
      transactionType: 'PAYBILL',
      source: 'paybill',
      amount: 300,
      phoneNumber: DEMO_PHONE_NUMBER,
      partyName: 'NAIROBI WATER',
      accountReference: 'Water bill',
      transactionDate: new Date(now.getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
      balance: 10100,
    },
    // Yesterday's transactions
    {
      transactionId: 'POCHI004',
      transactionCode: 'XJK8S1T4U5',
      transactionType: 'POCHI_RECEIVED',
      source: 'pochi',
      amount: 4500,
      phoneNumber: '0767890123',
      partyName: 'David Ochieng',
      transactionDate: new Date(now.getTime() - 1000 * 60 * 60 * 24), // Yesterday
      balance: 10400,
    },
    {
      transactionId: 'TILL003',
      transactionCode: 'YJK9T2U5V6',
      transactionType: 'BUYGOODS',
      source: 'till',
      amount: 2200,
      phoneNumber: '0778901234',
      partyName: 'Grace Akinyi',
      transactionDate: new Date(now.getTime() - 1000 * 60 * 60 * 26), // Yesterday
      balance: 5900,
    },
  ];
};

/**
 * Simulates fetching batched historical or recent transactions from an M-Pesa endpoint.
 * Artificially delays output using a timeout for realism and bounds returned counts constraints.
 */
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
    // Determine transaction source randomly
    const sourceRandom = Math.random();
    let source: TransactionSource;
    let transactionType: MpesaTransaction['transactionType'];
    let isReceived: boolean;

    if (credentials.hasPochi && sourceRandom < 0.4) {
      // 40% Pochi la Biashara if enabled
      source = 'pochi';
      isReceived = Math.random() > 0.25;
      transactionType = isReceived ? 'POCHI_RECEIVED' : 'POCHI_SENT';
    } else if (sourceRandom < 0.7) {
      // 30% Till/Buy Goods
      source = 'till';
      isReceived = true; // Till transactions are always income
      transactionType = 'BUYGOODS';
    } else {
      // 30% Paybill (usually expenses)
      source = 'paybill';
      isReceived = Math.random() > 0.7; // 30% receive, 70% send
      transactionType = isReceived ? 'RECEIVED' : 'PAYBILL';
    }

    const amount = Math.round((500 + Math.random() * 4500) / 100) * 100;
    
    if (isReceived) {
      balance += amount;
    } else {
      balance -= amount;
    }

    transactions.push({
      transactionId: `TXN${Date.now()}${i}`,
      transactionCode: generateTransactionCode(),
      transactionType,
      source,
      amount,
      phoneNumber: generatePhoneNumber(),
      partyName: isReceived 
        ? kenyanNames[Math.floor(Math.random() * kenyanNames.length)]
        : supplierNames[Math.floor(Math.random() * supplierNames.length)],
      accountReference: !isReceived ? businessDescriptions[Math.floor(Math.random() * businessDescriptions.length)] : undefined,
      transactionDate: new Date(Date.now() - i * (Math.random() * 3600000)),
      balance: Math.round(balance),
    });
  }

  return transactions;
};

/**
 * Converts a raw M-Pesa transaction object to a flattened internal standard 'Transaction' format.
 */
export const mpesaToTransaction = (mpesa: MpesaTransaction): Transaction => {
  const isIncome = mpesa.transactionType === 'RECEIVED' || 
                   mpesa.transactionType === 'BUYGOODS' || 
                   mpesa.transactionType === 'POCHI_RECEIVED';
  
  // Determine payment method
  let method: PaymentMethod = 'mpesa';
  if (mpesa.source === 'pochi') {
    method = 'pochi';
  }
  
  return {
    id: mpesa.transactionId,
    type: isIncome ? 'income' : 'expense',
    amount: mpesa.amount,
    method,
    source: mpesa.source,
    description: isIncome 
      ? `Payment from ${mpesa.partyName}` 
      : `Paid to ${mpesa.partyName}${mpesa.accountReference ? ` - ${mpesa.accountReference}` : ''}`,
    date: mpesa.transactionDate,
    mpesaCode: mpesa.transactionCode,
    customerName: mpesa.partyName,
  };
};

/**
 * Simulates an incoming real-time websocket/webhook transaction triggered randomly.
 * Mimics a backend receiving a message event and updating frontend cache.
 */
export const simulateIncomingTransaction = (credentials: MpesaCredentials): MpesaTransaction | null => {
  if (!credentials.isConnected) return null;
  
  // 30% chance of generating a transaction
  if (Math.random() > 0.3) return null;

  // Determine source
  const sourceRandom = Math.random();
  let source: TransactionSource;
  let transactionType: MpesaTransaction['transactionType'];
  let isReceived: boolean;

  if (credentials.hasPochi && sourceRandom < 0.4) {
    source = 'pochi';
    isReceived = Math.random() > 0.2;
    transactionType = isReceived ? 'POCHI_RECEIVED' : 'POCHI_SENT';
  } else if (sourceRandom < 0.7) {
    source = 'till';
    isReceived = true;
    transactionType = 'BUYGOODS';
  } else {
    source = 'paybill';
    isReceived = Math.random() > 0.6;
    transactionType = isReceived ? 'RECEIVED' : 'PAYBILL';
  }

  const amount = Math.round((200 + Math.random() * 3000) / 100) * 100;

  return {
    transactionId: `TXN${Date.now()}`,
    transactionCode: generateTransactionCode(),
    transactionType,
    source,
    amount,
    phoneNumber: generatePhoneNumber(),
    partyName: isReceived 
      ? kenyanNames[Math.floor(Math.random() * kenyanNames.length)]
      : supplierNames[Math.floor(Math.random() * supplierNames.length)],
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

export const validatePhoneNumber = (phone: string): boolean => {
  return /^0[17]\d{8}$/.test(phone);
};

/**
 * Imitates an OAuth flow to authenticate and connect a business till/paybill/pochi account.
 * Completes format validation before accepting identifiers.
 */
export const connectMpesaAccount = async (
  identifier: string,
  type: 'till' | 'paybill' | 'pochi',
  businessName: string,
  pochiPhoneNumber?: string
): Promise<MpesaCredentials> => {
  // Simulate API connection delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Validate format
  if (type === 'till' && !validateTillNumber(identifier)) {
    throw new Error('Invalid Till Number format. Should be 5-7 digits.');
  }
  if (type === 'paybill' && !validatePaybillNumber(identifier)) {
    throw new Error('Invalid Paybill Number format. Should be 5-6 digits.');
  }
  if (type === 'pochi' && !validatePhoneNumber(identifier)) {
    throw new Error('Invalid phone number format. Should be 07XXXXXXXX or 01XXXXXXXX.');
  }
  
  const phoneToUse = type === 'pochi' ? identifier : pochiPhoneNumber;
  if (type !== 'pochi' && phoneToUse && !validatePhoneNumber(phoneToUse)) {
    throw new Error('Invalid phone number format. Should be 07XXXXXXXX or 01XXXXXXXX.');
  }

  return {
    tillNumber: type === 'till' ? identifier : undefined,
    paybillNumber: type === 'paybill' ? identifier : undefined,
    pochiPhoneNumber: phoneToUse || undefined,
    businessName,
    isConnected: true,
    connectedAt: new Date(),
    hasPochi: !!pochiPhoneNumber,
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

  const sourceLabel = txn.source === 'pochi' ? ' (Pochi la Biashara)' : '';

  if (txn.transactionType === 'RECEIVED' || txn.transactionType === 'BUYGOODS' || txn.transactionType === 'POCHI_RECEIVED') {
    return `${txn.transactionCode} Confirmed. You have received Ksh${txn.amount.toLocaleString()}.00 from ${txn.partyName.toUpperCase()} ${txn.phoneNumber} on ${date} at ${time}${sourceLabel}. New M-PESA balance is Ksh${txn.balance.toLocaleString()}.00.`;
  } else {
    return `${txn.transactionCode} Confirmed. Ksh${txn.amount.toLocaleString()}.00 sent to ${txn.partyName.toUpperCase()} on ${date} at ${time}${sourceLabel}.${txn.accountReference ? ` For ${txn.accountReference}.` : ''} New M-PESA balance is Ksh${txn.balance.toLocaleString()}.00.`;
  }
};

// Get source display label
export const getSourceLabel = (source?: TransactionSource): string => {
  switch (source) {
    case 'pochi': return 'Pochi la Biashara';
    case 'till': return 'Till Number';
    case 'paybill': return 'Paybill';
    case 'cash': return 'Cash';
    default: return 'M-Pesa';
  }
};
