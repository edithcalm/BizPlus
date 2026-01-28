import { TrendingUp, Smartphone, Banknote, ShoppingCart, Zap, Truck } from 'lucide-react';
import { WeeklyChart } from '@/components/reports/WeeklyChart';
import { weeklyData, mockDailySummaries } from '@/lib/mockData';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export function ReportsView() {
  // Calculate weekly totals
  const weeklyTotals = weeklyData.reduce(
    (acc, day) => ({
      sales: acc.sales + day.sales,
      expenses: acc.expenses + day.expenses,
    }),
    { sales: 0, expenses: 0 }
  );
  
  const weeklyProfit = weeklyTotals.sales - weeklyTotals.expenses;
  
  // Calculate payment method breakdown
  const mpesaTotal = mockDailySummaries.reduce((sum, d) => sum + d.mpesaSales, 0);
  const cashTotal = mockDailySummaries.reduce((sum, d) => sum + d.cashSales, 0);
  const totalSales = mpesaTotal + cashTotal;
  
  const expenseCategories = [
    { name: 'Stock Purchase', amount: 4500, icon: ShoppingCart, color: 'bg-expense' },
    { name: 'Utilities', amount: 1200, icon: Zap, color: 'bg-warning' },
    { name: 'Transport', amount: 800, icon: Truck, color: 'bg-muted-foreground' },
  ];

  return (
    <div className="px-4 pb-24 space-y-6">
      {/* Weekly Summary */}
      <div className="bg-card rounded-2xl p-5 shadow-card animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Weekly Summary</h2>
        </div>
        
        <div className="text-center py-4 mb-4">
          <p className="text-sm text-muted-foreground mb-1">Weekly Profit</p>
          <p className={cn(
            'text-amount tabular-nums',
            weeklyProfit >= 0 ? 'text-income' : 'text-expense'
          )}>
            KES {formatCurrency(weeklyProfit)}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-income/10 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
            <p className="text-lg font-semibold text-income tabular-nums">
              +{formatCurrency(weeklyTotals.sales)}
            </p>
          </div>
          <div className="bg-expense/10 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-lg font-semibold text-expense tabular-nums">
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
      <div className="bg-card rounded-2xl p-5 shadow-card animate-slide-up stagger-2">
        <h3 className="font-semibold text-foreground mb-4">Payment Methods</h3>
        
        <div className="space-y-4">
          {/* M-Pesa */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-mpesa/10 flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-mpesa" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">M-Pesa</span>
                <span className="text-sm font-semibold tabular-nums">
                  KES {formatCurrency(mpesaTotal)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-mpesa rounded-full transition-all duration-500"
                  style={{ width: `${(mpesaTotal / totalSales) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((mpesaTotal / totalSales) * 100)}% of sales
              </p>
            </div>
          </div>
          
          {/* Cash */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-cash/10 flex items-center justify-center shrink-0">
              <Banknote className="h-5 w-5 text-cash" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">Cash</span>
                <span className="text-sm font-semibold tabular-nums">
                  KES {formatCurrency(cashTotal)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cash rounded-full transition-all duration-500"
                  style={{ width: `${(cashTotal / totalSales) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((cashTotal / totalSales) * 100)}% of sales
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Expense Categories */}
      <div className="bg-card rounded-2xl p-5 shadow-card animate-slide-up stagger-3">
        <h3 className="font-semibold text-foreground mb-4">Top Expenses</h3>
        
        <div className="space-y-3">
          {expenseCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div 
                key={category.name}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
              >
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                  category.color.replace('bg-', 'bg-') + '/10'
                )}>
                  <Icon className={cn('h-5 w-5', category.color.replace('bg-', 'text-'))} />
                </div>
                <div className="flex-1">
                  <span className="font-medium">{category.name}</span>
                </div>
                <span className="text-sm font-semibold text-expense tabular-nums">
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
