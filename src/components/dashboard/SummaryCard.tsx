import { TrendingUp, TrendingDown, ArrowRight, AlertTriangle, Smartphone, Banknote, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { DailySummary } from '@/types/bizplus';

interface SummaryCardProps {
  summary: DailySummary;
  onReconcile?: () => void;
}

export function SummaryCard({ summary, onReconcile }: SummaryCardProps) {
  const hasVariance = summary.variance !== undefined && summary.variance !== 0;
  const isNegativeVariance = summary.variance !== undefined && summary.variance < 0;
  
  // Calculate total digital sales for percentage
  const totalDigitalSales = summary.mpesaSales + summary.pochiSales;
  const totalSalesForCalc = summary.totalSales || 1; // Avoid division by zero
  
  return (
    <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground text-sm sm:text-base">Today's Summary</h2>
        <span className="text-xs text-muted-foreground">
          {summary.transactionCount} transactions
        </span>
      </div>
      
      {/* Net Profit - Main Number */}
      <div className="text-center py-3 sm:py-4 mb-4">
        <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
        <p className={cn(
          'text-2xl sm:text-amount tabular-nums font-bold',
          summary.netProfit >= 0 ? 'text-income' : 'text-expense'
        )}>
          KES {formatCurrency(summary.netProfit)}
        </p>
        <div className="flex items-center justify-center gap-1 mt-2">
          {summary.netProfit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-income" />
          ) : (
            <TrendingDown className="h-4 w-4 text-expense" />
          )}
          <span className={cn(
            'text-sm font-medium',
            summary.netProfit >= 0 ? 'text-income' : 'text-expense'
          )}>
            {summary.netProfit >= 0 ? 'Profit' : 'Loss'}
          </span>
        </div>
      </div>
      
      {/* Sales vs Expenses */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Sales</p>
          <p className="text-lg sm:text-amount-sm text-income tabular-nums font-semibold">
            +{formatCurrency(summary.totalSales)}
          </p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Expenses</p>
          <p className="text-lg sm:text-amount-sm text-expense tabular-nums font-semibold">
            -{formatCurrency(summary.totalExpenses)}
          </p>
        </div>
      </div>
      
      {/* Three-way Breakdown: M-Pesa vs Pochi vs Cash */}
      <div className="space-y-3 p-3 bg-muted/50 rounded-xl mb-4">
        <p className="text-xs font-medium text-muted-foreground">Sales Breakdown</p>
        
        {/* M-Pesa */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-mpesa/10 flex items-center justify-center shrink-0">
            <Smartphone className="h-4 w-4 text-mpesa" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground text-xs">M-Pesa</span>
              <span className="font-medium tabular-nums text-xs">KES {formatCurrency(summary.mpesaSales)}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-mpesa rounded-full transition-all duration-500"
                style={{ width: `${(summary.mpesaSales / totalSalesForCalc) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Pochi la Biashara */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-pochi/10 flex items-center justify-center shrink-0">
            <Wallet className="h-4 w-4 text-pochi" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground text-xs">Pochi la Biashara</span>
              <span className="font-medium tabular-nums text-xs">KES {formatCurrency(summary.pochiSales)}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-pochi rounded-full transition-all duration-500"
                style={{ width: `${(summary.pochiSales / totalSalesForCalc) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Cash */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-cash/10 flex items-center justify-center shrink-0">
            <Banknote className="h-4 w-4 text-cash" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground text-xs">Cash</span>
              <span className="font-medium tabular-nums text-xs">KES {formatCurrency(summary.cashSales)}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-cash rounded-full transition-all duration-500"
                style={{ width: `${(summary.cashSales / totalSalesForCalc) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Cash Reconciliation */}
      {summary.actualCash === undefined ? (
        <button 
          onClick={onReconcile}
          className="w-full flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded-xl hover:bg-warning/15 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs sm:text-sm font-medium">End-of-day cash check needed</span>
          </div>
          <ArrowRight className="h-4 w-4 text-warning" />
        </button>
      ) : hasVariance ? (
        <div className={cn(
          'p-3 rounded-xl border',
          isNegativeVariance 
            ? 'bg-destructive/10 border-destructive/20' 
            : 'bg-income/10 border-income/20'
        )}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Cash Variance</span>
            <span className={cn(
              'text-sm font-semibold tabular-nums',
              isNegativeVariance ? 'text-destructive' : 'text-income'
            )}>
              {isNegativeVariance ? '-' : '+'}KES {formatCurrency(Math.abs(summary.variance!))}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-income/10 border border-income/20 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-income">✓</span>
            <span className="text-sm font-medium text-income">Cash balanced perfectly!</span>
          </div>
        </div>
      )}
    </div>
  );
}
