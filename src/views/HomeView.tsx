import { useState } from 'react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SalesForecast } from '@/components/dashboard/SalesForecast';
import { ReconciliationModal } from '@/components/modals/ReconciliationModal';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { mockTransactions, mockDailySummaries } from '@/lib/mockData';
import { Transaction } from '@/types/bizplus';

interface HomeViewProps {
  onViewAllTransactions: () => void;
}

export function HomeView({ onViewAllTransactions }: HomeViewProps) {
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [transactions, setTransactions] = useState(mockTransactions);
  const [todaySummary, setTodaySummary] = useState(mockDailySummaries[0]);

  const handleAddIncome = () => {
    setTransactionType('income');
    setShowAddTransaction(true);
  };

  const handleAddExpense = () => {
    setTransactionType('expense');
    setShowAddTransaction(true);
  };

  const handleReconcile = (actualCash: number) => {
    setTodaySummary(prev => ({
      ...prev,
      actualCash,
      variance: actualCash - prev.expectedCash,
    }));
  };

  const handleAddTransaction = (data: {
    amount: number;
    description: string;
    method: 'mpesa' | 'cash';
    category?: string;
  }) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      amount: data.amount,
      method: data.method,
      description: data.description,
      date: new Date(),
      category: data.category,
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update summary
    setTodaySummary(prev => ({
      ...prev,
      totalSales: transactionType === 'income' 
        ? prev.totalSales + data.amount 
        : prev.totalSales,
      totalExpenses: transactionType === 'expense' 
        ? prev.totalExpenses + data.amount 
        : prev.totalExpenses,
      netProfit: transactionType === 'income'
        ? prev.netProfit + data.amount
        : prev.netProfit - data.amount,
      mpesaSales: transactionType === 'income' && data.method === 'mpesa'
        ? prev.mpesaSales + data.amount
        : prev.mpesaSales,
      cashSales: transactionType === 'income' && data.method === 'cash'
        ? prev.cashSales + data.amount
        : prev.cashSales,
      expectedCash: data.method === 'cash'
        ? transactionType === 'income'
          ? prev.expectedCash + data.amount
          : prev.expectedCash - data.amount
        : prev.expectedCash,
      transactionCount: prev.transactionCount + 1,
    }));
  };

  return (
    <div className="px-4 pb-24 space-y-6">
      <SummaryCard 
        summary={todaySummary}
        onReconcile={() => setShowReconciliation(true)}
      />
      
      <QuickActions 
        onAddIncome={handleAddIncome}
        onAddExpense={handleAddExpense}
        onReconcile={() => setShowReconciliation(true)}
      />
      
      <RecentTransactions 
        transactions={transactions}
        onViewAll={onViewAllTransactions}
      />
      
      <SalesForecast 
        predictedMin={5500}
        predictedMax={8200}
        trend="up"
        busyDays={['Fri', 'Sat']}
        slowDays={['Mon', 'Wed']}
      />
      
      <ReconciliationModal 
        isOpen={showReconciliation}
        onClose={() => setShowReconciliation(false)}
        expectedCash={todaySummary.expectedCash}
        onSubmit={handleReconcile}
      />
      
      <AddTransactionModal 
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        type={transactionType}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
}
