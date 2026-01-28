import { useState, useEffect } from 'react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { MpesaStatus } from '@/components/dashboard/MpesaStatus';
import { TransactionFeed } from '@/components/dashboard/TransactionFeed';
import { SalesForecast } from '@/components/dashboard/SalesForecast';
import { ReconciliationModal } from '@/components/modals/ReconciliationModal';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { MpesaConnectionModal } from '@/components/modals/MpesaConnectionModal';
import { MpesaSettingsModal } from '@/components/modals/MpesaSettingsModal';
import { useMpesaConnection } from '@/hooks/useMpesaConnection';
import { DailySummary } from '@/types/bizplus';

interface HomeViewProps {
  onViewAllTransactions: () => void;
}

export function HomeView({ onViewAllTransactions }: HomeViewProps) {
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showMpesaConnect, setShowMpesaConnect] = useState(false);
  const [showMpesaSettings, setShowMpesaSettings] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [reconciliationData, setReconciliationData] = useState<{ actualCash?: number; variance?: number }>({});

  const {
    credentials,
    transactions,
    isConnected,
    isConnecting,
    isFetching,
    lastFetch,
    connect,
    disconnect,
    fetchTransactions,
    addManualTransaction,
    getDailySummary,
  } = useMpesaConnection();

  // Get daily summary from transactions
  const baseSummary = getDailySummary();
  const todaySummary: DailySummary = {
    ...baseSummary,
    actualCash: reconciliationData.actualCash,
    variance: reconciliationData.variance,
  };

  const handleAddIncome = () => {
    setTransactionType('income');
    setShowAddTransaction(true);
  };

  const handleAddExpense = () => {
    setTransactionType('expense');
    setShowAddTransaction(true);
  };

  const handleReconcile = (actualCash: number) => {
    setReconciliationData({
      actualCash,
      variance: actualCash - todaySummary.expectedCash,
    });
  };

  const handleAddTransaction = (data: {
    amount: number;
    description: string;
    method: 'mpesa' | 'cash';
    category?: string;
  }) => {
    addManualTransaction({
      type: transactionType,
      amount: data.amount,
      method: data.method,
      description: data.description,
      date: new Date(),
      category: data.category,
    });
  };

  const handleMpesaConnect = async (
    tillOrPaybill: string,
    type: 'till' | 'paybill',
    businessName: string
  ) => {
    await connect(tillOrPaybill, type, businessName);
  };

  return (
    <div className="px-3 sm:px-4 pb-24 space-y-4 sm:space-y-6">
      {/* M-Pesa Connection Status */}
      <MpesaStatus
        isConnected={isConnected}
        businessName={credentials?.businessName}
        tillNumber={credentials?.tillNumber}
        paybillNumber={credentials?.paybillNumber}
        lastFetch={lastFetch}
        isFetching={isFetching}
        onConnect={() => setShowMpesaConnect(true)}
        onRefresh={() => fetchTransactions()}
        onSettings={() => setShowMpesaSettings(true)}
      />

      {/* Daily Summary */}
      <SummaryCard 
        summary={todaySummary}
        onReconcile={() => setShowReconciliation(true)}
      />
      
      {/* Quick Actions */}
      <QuickActions 
        onAddIncome={handleAddIncome}
        onAddExpense={handleAddExpense}
        onReconcile={() => setShowReconciliation(true)}
      />
      
      {/* Live Transaction Feed */}
      <TransactionFeed
        transactions={transactions}
        isConnected={isConnected}
        isFetching={isFetching}
        onRefresh={() => fetchTransactions()}
      />
      
      {/* Sales Forecast */}
      <SalesForecast 
        predictedMin={5500}
        predictedMax={8200}
        trend="up"
        busyDays={['Fri', 'Sat']}
        slowDays={['Mon', 'Wed']}
      />
      
      {/* Modals */}
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

      <MpesaConnectionModal
        isOpen={showMpesaConnect}
        onClose={() => setShowMpesaConnect(false)}
        onConnect={handleMpesaConnect}
        isConnecting={isConnecting}
      />

      <MpesaSettingsModal
        isOpen={showMpesaSettings}
        onClose={() => setShowMpesaSettings(false)}
        credentials={credentials}
        onDisconnect={disconnect}
      />
    </div>
  );
}
