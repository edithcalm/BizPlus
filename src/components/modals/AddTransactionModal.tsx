import { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Smartphone, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  onSubmit: (data: {
    amount: number;
    description: string;
    method: 'mpesa' | 'cash';
    category?: string;
  }) => void;
}

const incomeCategories = ['Sales', 'Payment Received', 'Other Income'];
const expenseCategories = ['Stock Purchase', 'Rent', 'Utilities', 'Transport', 'Salaries', 'Other'];

export function AddTransactionModal({ 
  isOpen, 
  onClose, 
  type,
  onSubmit 
}: AddTransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState<'mpesa' | 'cash'>('mpesa');
  const [category, setCategory] = useState('');
  
  if (!isOpen) return null;
  
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  const isValid = amount && description && method;

  const handleSubmit = () => {
    if (isValid) {
      onSubmit({
        amount: parseFloat(amount),
        description,
        method,
        category: category || undefined,
      });
      // Reset form
      setAmount('');
      setDescription('');
      setMethod('mpesa');
      setCategory('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal: flex column so the body scrolls and the submit button stays reachable on small screens / keyboard */}
      <div
        className={cn(
          'relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl animate-slide-up shadow-elevated',
          'flex min-h-0 max-h-[90dvh] flex-col overflow-hidden sm:max-h-[min(90dvh,720px)]'
        )}
      >
        {/* Close button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 px-5 pt-5 pb-2 sm:p-6 sm:pb-3 pr-14">
          <div className={cn(
            'h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shrink-0',
            type === 'income' ? 'bg-income/10' : 'bg-expense/10'
          )}>
            {type === 'income' ? (
              <ArrowDownLeft className="h-5 w-5 sm:h-6 sm:w-6 text-income" />
            ) : (
              <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6 text-expense" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Add {type === 'income' ? 'Income' : 'Expense'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Record a new {type === 'income' ? 'sale or payment' : 'expense'}
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-5 pb-2 sm:px-6 [-webkit-overflow-scrolling:touch]">
        {/* Amount */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
              KES
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className={cn(
                'w-full pl-14 pr-4 py-3 sm:py-4 bg-background border-2 rounded-xl text-lg sm:text-amount-sm tabular-nums',
                'focus:outline-none focus:ring-0 focus:border-primary transition-colors',
                'placeholder:text-muted-foreground/50'
              )}
            />
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={type === 'income' ? "e.g. Payment from John" : "e.g. Bought stock"}
            className={cn(
              'w-full px-4 py-2.5 sm:py-3 bg-background border-2 rounded-xl text-sm',
              'focus:outline-none focus:ring-0 focus:border-primary transition-colors',
              'placeholder:text-muted-foreground'
            )}
          />
        </div>
        
        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={() => setMethod('mpesa')}
              className={cn(
                'flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all',
                method === 'mpesa' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Smartphone className={cn(
                'h-4 w-4 sm:h-5 sm:w-5',
                method === 'mpesa' ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'font-medium text-sm',
                method === 'mpesa' ? 'text-primary' : 'text-foreground'
              )}>M-Pesa</span>
            </button>
            <button
              onClick={() => setMethod('cash')}
              className={cn(
                'flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all',
                method === 'cash' 
                  ? 'border-cash bg-cash/5' 
                  : 'border-border hover:border-cash/50'
              )}
            >
              <Banknote className={cn(
                'h-4 w-4 sm:h-5 sm:w-5',
                method === 'cash' ? 'text-cash' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'font-medium text-sm',
                method === 'cash' ? 'text-cash' : 'text-foreground'
              )}>Cash</span>
            </button>
          </div>
        </div>
        
        {/* Category */}
        <div className="mb-5 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            Category (optional)
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(category === cat ? '' : cat)}
                className={cn(
                  'px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all',
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        </div>

        {/* Submit — fixed to bottom of sheet so it stays tappable while fields scroll above */}
        <div className="shrink-0 border-t border-border/60 bg-card px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-b-2xl sm:px-6">
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            variant={type === 'income' ? 'income' : 'destructive'}
            className="w-full"
            size="lg"
          >
            Add {type === 'income' ? 'Income' : 'Expense'}
          </Button>
        </div>
      </div>
    </div>
  );
}
