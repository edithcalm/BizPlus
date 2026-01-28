import { Plus, ArrowDownLeft, ArrowUpRight, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onReconcile: () => void;
}

export function QuickActions({ onAddIncome, onAddExpense, onReconcile }: QuickActionsProps) {
  return (
    <div className="animate-slide-up stagger-1">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button 
          onClick={onAddIncome}
          className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-card rounded-xl sm:rounded-2xl shadow-card hover:shadow-elevated transition-all duration-200 active:scale-[0.98]"
        >
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-income/10 flex items-center justify-center">
            <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 text-income" />
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">Add Income</span>
        </button>
        
        <button 
          onClick={onAddExpense}
          className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-card rounded-xl sm:rounded-2xl shadow-card hover:shadow-elevated transition-all duration-200 active:scale-[0.98]"
        >
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-expense/10 flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-expense" />
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">Add Expense</span>
        </button>
        
        <button 
          onClick={onReconcile}
          className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-card rounded-xl sm:rounded-2xl shadow-card hover:shadow-elevated transition-all duration-200 active:scale-[0.98]"
        >
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-warning/10 flex items-center justify-center">
            <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">Cash Check</span>
        </button>
      </div>
    </div>
  );
}
