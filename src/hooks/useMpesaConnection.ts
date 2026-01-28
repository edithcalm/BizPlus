import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MpesaCredentials, 
  MpesaTransaction, 
  connectMpesaAccount, 
  disconnectMpesaAccount,
  fetchMpesaTransactions,
  simulateIncomingTransaction,
  mpesaToTransaction,
  getDemoTransactions,
  DEMO_PHONE_NUMBER
} from '@/lib/mpesaApi';
import { Transaction, DailySummary } from '@/types/bizplus';
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

  // Connect to M-Pesa with optional Pochi la Biashara
  const connect = useCallback(async (
    tillOrPaybill: string,
    type: 'till' | 'paybill',
    businessName: string,
    pochiPhoneNumber?: string
  ) => {
    setIsConnecting(true);
    try {
      const creds = await connectMpesaAccount(tillOrPaybill, type, businessName, pochiPhoneNumber);
      setCredentials(creds);
      
      const pochiMessage = pochiPhoneNumber ? ` + Pochi la Biashara (${pochiPhoneNumber})` : '';
      toast({
        title: "M-Pesa Connected! 🎉",
        description: `Successfully linked ${type === 'till' ? 'Till' : 'Paybill'} ${tillOrPaybill}${pochiMessage}`,
      });

      // Load demo transactions if using the demo phone number
      if (pochiPhoneNumber === DEMO_PHONE_NUMBER) {
        const demoTxns = getDemoTransactions().map(mpesaToTransaction);
        setTransactions(demoTxns);
        toast({
          title: "Demo Mode Active 📱",
          description: "Loaded sample transactions for demonstration",
        });
      } else {
        // Fetch initial transactions
        await fetchTransactionsInternal(creds);
      }
      
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

  // Internal fetch function
  const fetchTransactionsInternal = async (creds: MpesaCredentials) => {
    setIsFetching(true);
    try {
      const mpesaTransactions = await fetchMpesaTransactions(creds, 5);
      const newTransactions = mpesaTransactions.map(mpesaToTransaction);
      
      setTransactions(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const unique = newTransactions.filter(t => !existingIds.has(t.id));
        return [...unique, ...prev].slice(0, 50);
      });
      
      setLastFetch(new Date());
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch transactions from M-Pesa API
  const fetchTransactions = useCallback(async (creds?: MpesaCredentials) => {
    const activeCredentials = creds || credentials;
    if (!activeCredentials?.isConnected) return;
    await fetchTransactionsInternal(activeCredentials);
  }, [credentials]);

  // Simulate real-time incoming transactions
  const checkForNewTransactions = useCallback(() => {
    if (!credentials?.isConnected) return;

    const newTxn = simulateIncomingTransaction(credentials);
    if (newTxn) {
      const transaction = mpesaToTransaction(newTxn);
      setTransactions(prev => [transaction, ...prev].slice(0, 50));
      
      const sourceLabel = newTxn.source === 'pochi' ? ' (Pochi)' : '';
      const isIncome = newTxn.transactionType.includes('RECEIVED') || newTxn.transactionType === 'BUYGOODS';
      
      toast({
        title: isIncome ? "💰 Payment Received!" : "💸 Payment Sent",
        description: `KES ${newTxn.amount.toLocaleString()} ${isIncome ? 'from' : 'to'} ${newTxn.partyName}${sourceLabel}`,
      });
    }
  }, [credentials]);

  // Start/stop polling for new transactions
  useEffect(() => {
    if (credentials?.isConnected) {
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

  // Calculate daily summary with Pochi breakdown
  const getDailySummary = useCallback((): DailySummary => {
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

    const pochiSales = todayTransactions
      .filter(t => t.type === 'income' && t.method === 'pochi')
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
      pochiSales,
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
