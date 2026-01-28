import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MpesaCredentials, 
  MpesaTransaction, 
  connectMpesaAccount, 
  disconnectMpesaAccount,
  fetchMpesaTransactions,
  simulateIncomingTransaction,
  mpesaToTransaction
} from '@/lib/mpesaApi';
import { Transaction } from '@/types/bizplus';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'bizplus_mpesa_credentials';
const TRANSACTIONS_KEY = 'bizplus_mpesa_transactions';

export function useMpesaConnection() {
  const [credentials, setCredentials] = useState<MpesaCredentials | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        connectedAt: parsed.connectedAt ? new Date(parsed.connectedAt) : undefined
      };
    }
    return null;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem(TRANSACTIONS_KEY);
    if (stored) {
      return JSON.parse(stored).map((t: Transaction) => ({
        ...t,
        date: new Date(t.date)
      }));
    }
    return [];
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Persist credentials
  useEffect(() => {
    if (credentials) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [credentials]);

  // Persist transactions
  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Connect to M-Pesa
  const connect = useCallback(async (
    tillOrPaybill: string,
    type: 'till' | 'paybill',
    businessName: string
  ) => {
    setIsConnecting(true);
    try {
      const creds = await connectMpesaAccount(tillOrPaybill, type, businessName);
      setCredentials(creds);
      
      toast({
        title: "M-Pesa Connected! 🎉",
        description: `Successfully linked ${type === 'till' ? 'Till' : 'Paybill'} ${tillOrPaybill}`,
      });

      // Fetch initial transactions
      await fetchTransactions(creds);
      
      return creds;
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect to M-Pesa",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect from M-Pesa
  const disconnect = useCallback(async () => {
    try {
      await disconnectMpesaAccount();
      setCredentials(null);
      setTransactions([]);
      
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      
      toast({
        title: "Disconnected",
        description: "M-Pesa account has been unlinked",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not disconnect M-Pesa account",
        variant: "destructive",
      });
    }
  }, []);

  // Fetch transactions from M-Pesa API
  const fetchTransactions = useCallback(async (creds?: MpesaCredentials) => {
    const activeCredentials = creds || credentials;
    if (!activeCredentials?.isConnected) return;

    setIsFetching(true);
    try {
      const mpesaTransactions = await fetchMpesaTransactions(activeCredentials, 5);
      const newTransactions = mpesaTransactions.map(mpesaToTransaction);
      
      // Merge with existing, avoiding duplicates
      setTransactions(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const unique = newTransactions.filter(t => !existingIds.has(t.id));
        return [...unique, ...prev].slice(0, 50); // Keep last 50 transactions
      });
      
      setLastFetch(new Date());
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsFetching(false);
    }
  }, [credentials]);

  // Simulate real-time incoming transactions
  const checkForNewTransactions = useCallback(() => {
    if (!credentials?.isConnected) return;

    const newTxn = simulateIncomingTransaction(credentials);
    if (newTxn) {
      const transaction = mpesaToTransaction(newTxn);
      setTransactions(prev => [transaction, ...prev].slice(0, 50));
      
      // Show notification for new transaction
      toast({
        title: newTxn.transactionType === 'RECEIVED' ? "💰 Payment Received!" : "💸 Payment Sent",
        description: `KES ${newTxn.amount.toLocaleString()} ${newTxn.transactionType === 'RECEIVED' ? 'from' : 'to'} ${newTxn.partyName}`,
      });
    }
  }, [credentials]);

  // Start/stop polling for new transactions
  useEffect(() => {
    if (credentials?.isConnected) {
      // Poll every 30 seconds for demo purposes
      pollingRef.current = setInterval(checkForNewTransactions, 30000);
      
      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [credentials?.isConnected, checkForNewTransactions]);

  // Add manual transaction (cash)
  const addManualTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `MANUAL${Date.now()}`,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, []);

  // Calculate daily summary
  const getDailySummary = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = transactions.filter(t => {
      const txnDate = new Date(t.date);
      txnDate.setHours(0, 0, 0, 0);
      return txnDate.getTime() === today.getTime();
    });

    const totalSales = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const mpesaSales = todayTransactions
      .filter(t => t.type === 'income' && t.method === 'mpesa')
      .reduce((sum, t) => sum + t.amount, 0);

    const cashSales = todayTransactions
      .filter(t => t.type === 'income' && t.method === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);

    const cashExpenses = todayTransactions
      .filter(t => t.type === 'expense' && t.method === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      date: today,
      totalSales,
      totalExpenses,
      netProfit: totalSales - totalExpenses,
      mpesaSales,
      cashSales,
      expectedCash: cashSales - cashExpenses,
      transactionCount: todayTransactions.length,
    };
  }, [transactions]);

  return {
    credentials,
    transactions,
    isConnected: credentials?.isConnected ?? false,
    isConnecting,
    isFetching,
    lastFetch,
    connect,
    disconnect,
    fetchTransactions,
    addManualTransaction,
    getDailySummary,
  };
}
