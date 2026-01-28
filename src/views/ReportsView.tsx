import { TrendingUp, Smartphone, Banknote, ShoppingCart, Zap, Truck } from 'lucide-react';
import { WeeklyChart } from '@/components/reports/WeeklyChart';
import { weeklyData, mockDailySummaries } from '@/lib/mockData';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useMpesaConnection } from '@/hooks/useMpesaConnection';

export function ReportsView() {
  const { transactions } = useMpesaConnection();
  
  // Calculate weekly totals from actual transactions or use mock data
  const weeklyTotals = weeklyData.reduce(
    (acc, day) => ({
      sales: acc.sales + day.sales,
      expenses: acc.expenses + day.expenses,
    }),
    { sales: 0, expenses: 0 }
  );
  
  const weeklyProfit = weeklyTotals.sales - weeklyTotals.expenses;
  
  // Calculate from real transactions if available
  const realMpesaTotal = transactions
    .filter(t => t.type === 'income' && t.method === 'mpesa')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const realCashTotal = transactions
    .filter(t => t.type === 'income' && t.method === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Use real data if available, otherwise fall back to mock
  const mpesaTotal = realMpesaTotal || mockDailySummaries.reduce((sum, d) => sum + d.mpesaSales, 0);
  const cashTotal = realCashTotal || mockDailySummaries.reduce((sum, d) => sum + d.cashSales, 0);
  const totalSales = mpesaTotal + cashTotal;
  
  const expenseCategories = [
    { name: 'Stock Purchase', amount: 4500, icon: ShoppingCart, color: 'expense' },
    { name: 'Utilities', amount: 1200, icon: Zap, color: 'warning' },
    { name: 'Transport', amount: 800, icon: Truck, color: 'muted-foreground' },
  ];

  return (
    <div className="px-3 sm:px-4 pb-24 space-y-4 sm:space-y-6">
      {/* Weekly Summary */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-card animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h2 className="font-semibold text-foreground text-sm sm:text-base">Weekly Summary</h2>
        </div>
        
        <div className="text-center py-3 sm:py-4 mb-4">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Weekly Profit</p>
          <p className={cn(
            'text-2xl sm:text-amount tabular-nums',
            weeklyProfit >= 0 ? 'text-income' : 'text-expense'
          )}>
            KES {formatCurrency(weeklyProfit)}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-income/10 rounded-xl p-3 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Sales</p>
            <p className="text-base sm:text-lg font-semibold text-income tabular-nums">
              +{formatCurrency(weeklyTotals.sales)}
            </p>
          </div>
          <div className="bg-expense/10 rounded-xl p-3 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-base sm:text-lg font-semibold text-expense tabular-nums">
              -{formatCurrency(weeklyTotals.expenses)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Weekly Chart */}
      <div className="animate-slide-up stagger-1">
        <WeeklyChart data={weeklyData} />
      </div>
      
      {/* Payment Methods Breakdown */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-card animate-slide-up stagger-2">
        <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Payment Methods</h3>
        
        <div className="space-y-4">
          {/* M-Pesa */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-mpesa/10 flex items-center justify-center shrink-0">
              <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-mpesa" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">M-Pesa</span>
                <span className="text-xs sm:text-sm font-semibold tabular-nums">
                  KES {formatCurrency(mpesaTotal)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-mpesa rounded-full transition-all duration-500"
                  style={{ width: `${totalSales > 0 ? (mpesaTotal / totalSales) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {totalSales > 0 ? Math.round((mpesaTotal / totalSales) * 100) : 0}% of sales
              </p>
            </div>
          </div>
          
          {/* Cash */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-cash/10 flex items-center justify-center shrink-0">
              <Banknote className="h-4 w-4 sm:h-5 sm:w-5 text-cash" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">Cash</span>
                <span className="text-xs sm:text-sm font-semibold tabular-nums">
                  KES {formatCurrency(cashTotal)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cash rounded-full transition-all duration-500"
                  style={{ width: `${totalSales > 0 ? (cashTotal / totalSales) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {totalSales > 0 ? Math.round((cashTotal / totalSales) * 100) : 0}% of sales
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Expense Categories */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-card animate-slide-up stagger-3">
        <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Top Expenses</h3>
        
        <div className="space-y-2 sm:space-y-3">
          {expenseCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div 
                key={category.name}
                className="flex items-center gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-xl"
              >
                <div className={cn(
                  'h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shrink-0',
                  `bg-${category.color}/10`
                )}>
                  <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', `text-${category.color}`)} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-expense tabular-nums">
                  -{formatCurrency(category.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
