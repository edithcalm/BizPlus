import { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Smartphone, Banknote, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Transaction } from '@/types/bizplus';
import { formatCurrency, formatRelativeTime, formatTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface TransactionFeedProps {
  transactions: Transaction[];
  isConnected: boolean;
  isFetching: boolean;
  onRefresh: () => void;
}

export function TransactionFeed({ 
  transactions, 
  isConnected, 
  isFetching,
  onRefresh 
}: TransactionFeedProps) {
  const [showNewIndicator, setShowNewIndicator] = useState(false);

  // Show "new" indicator briefly when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      setShowNewIndicator(true);
      const timer = setTimeout(() => setShowNewIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [transactions.length]);

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground text-sm sm:text-base">Live Transactions</h3>
          {isConnected && (
            <span className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium",
              "bg-income/10 text-income"
            )}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-income opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-income"></span>
              </span>
              <span className="hidden sm:inline">Live</span>
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={isFetching || !isConnected}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </button>
      </div>

      {/* Empty State */}
      {transactions.length === 0 && (
        <div className="p-6 sm:p-8 text-center">
          {isConnected ? (
            <>
              <Wifi className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Waiting for transactions...</p>
              <p className="text-xs text-muted-foreground/70 mt-1">New M-Pesa payments will appear here</p>
            </>
          ) : (
            <>
              <WifiOff className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">M-Pesa not connected</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Connect your account to see transactions</p>
            </>
          )}
        </div>
      )}

      {/* Transaction List */}
      <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
        {transactions.slice(0, 10).map((transaction, index) => (
          <div 
            key={transaction.id}
            className={cn(
              'flex items-center gap-3 p-3 sm:p-4 transition-all hover:bg-muted/50',
              index < transactions.length - 1 && 'border-b border-border',
              index === 0 && showNewIndicator && 'bg-income/5 animate-pulse-soft'
            )}
          >
            {/* Icon */}
            <div className={cn(
              'h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shrink-0',
              transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
            )}>
              {transaction.type === 'income' ? (
                <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 text-income" />
              ) : (
                <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-expense" />
              )}
            </div>
            
            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">
                {transaction.customerName || transaction.description}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {transaction.method === 'mpesa' ? (
                  <Smartphone className="h-3 w-3 text-mpesa" />
                ) : (
                  <Banknote className="h-3 w-3 text-cash" />
                )}
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {transaction.mpesaCode && (
                    <span className="font-mono">{transaction.mpesaCode} • </span>
                  )}
                  {formatTime(transaction.date)}
                </span>
              </div>
            </div>
            
            {/* Amount */}
            <div className="text-right shrink-0">
              <p className={cn(
                'font-semibold tabular-nums text-sm sm:text-base',
                transaction.type === 'income' ? 'text-income' : 'text-expense'
              )}>
                {transaction.type === 'income' ? '+' : '-'}
                <span className="text-xs sm:text-sm">KES </span>
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {transactions.length > 10 && (
        <div className="p-3 border-t text-center">
          <button className="text-sm text-primary font-medium hover:underline">
            View all {transactions.length} transactions
          </button>
        </div>
      )}
    </div>
  );
}
