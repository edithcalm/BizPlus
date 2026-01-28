import { ArrowDownLeft, ArrowUpRight, Smartphone, Banknote, ChevronRight } from 'lucide-react';
import { Transaction } from '@/types/bizplus';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll: () => void;
}

export function RecentTransactions({ transactions, onViewAll }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="animate-slide-up stagger-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Recent Transactions</h3>
        <button 
          onClick={onViewAll}
          className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {recentTransactions.map((transaction, index) => (
          <div 
            key={transaction.id}
            className={cn(
              'flex items-center gap-3 p-4 transition-colors hover:bg-muted/50',
              index < recentTransactions.length - 1 && 'border-b border-border'
            )}
          >
            {/* Icon */}
            <div className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
              transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
            )}>
              {transaction.type === 'income' ? (
                <ArrowDownLeft className="h-5 w-5 text-income" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-expense" />
              )}
            </div>
            
            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {transaction.description}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {transaction.method === 'mpesa' ? (
                  <Smartphone className="h-3 w-3 text-mpesa" />
                ) : (
                  <Banknote className="h-3 w-3 text-cash" />
                )}
                <span className="text-xs text-muted-foreground">
                  {transaction.method === 'mpesa' ? 'M-Pesa' : 'Cash'} • {formatRelativeTime(transaction.date)}
                </span>
              </div>
            </div>
            
            {/* Amount */}
            <div className="text-right shrink-0">
              <p className={cn(
                'font-semibold tabular-nums',
                transaction.type === 'income' ? 'text-income' : 'text-expense'
              )}>
                {transaction.type === 'income' ? '+' : '-'}KES {formatCurrency(transaction.amount)}
              </p>
              {transaction.mpesaCode && (
                <p className="text-xs text-muted-foreground font-mono">
                  {transaction.mpesaCode}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
