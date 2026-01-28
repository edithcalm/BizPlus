import { useState } from 'react';
import { X, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  expectedCash: number;
  onSubmit: (actualCash: number) => void;
}

export function ReconciliationModal({ 
  isOpen, 
  onClose, 
  expectedCash, 
  onSubmit 
}: ReconciliationModalProps) {
  const [actualCash, setActualCash] = useState<string>('');
  
  if (!isOpen) return null;
  
  const actualValue = parseFloat(actualCash) || 0;
  const variance = actualValue - expectedCash;
  const hasInput = actualCash.length > 0;

  const handleSubmit = () => {
    if (hasInput) {
      onSubmit(actualValue);
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
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 animate-slide-up shadow-elevated">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-foreground">End-of-Day Cash Check</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Count your physical cash</p>
          </div>
        </div>
        
        {/* Expected Cash */}
        <div className="bg-secondary/50 rounded-xl p-3 sm:p-4 mb-4">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Today's expected cash</p>
          <p className="text-xl sm:text-amount text-foreground tabular-nums">
            KES {formatCurrency(expectedCash)}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
            Cash sales minus cash expenses
          </p>
        </div>
        
        {/* Input */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            How much cash is physically available?
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
              KES
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              placeholder="0"
              className={cn(
                'w-full pl-14 pr-4 py-3 sm:py-4 bg-background border-2 rounded-xl text-lg sm:text-amount-sm tabular-nums',
                'focus:outline-none focus:ring-0 focus:border-primary transition-colors',
                'placeholder:text-muted-foreground/50'
              )}
            />
          </div>
        </div>
        
        {/* Variance Preview */}
        {hasInput && (
          <div className={cn(
            'p-4 rounded-xl mb-6 animate-fade-in',
            variance === 0 && 'bg-income/10 border border-income/20',
            variance > 0 && 'bg-income/10 border border-income/20',
            variance < 0 && 'bg-destructive/10 border border-destructive/20'
          )}>
            <div className="flex items-center gap-2 mb-2">
              {variance >= 0 ? (
                <CheckCircle className="h-5 w-5 text-income" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              <span className={cn(
                'font-semibold',
                variance >= 0 ? 'text-income' : 'text-destructive'
              )}>
                {variance === 0 ? 'Perfect match!' : variance > 0 ? 'Excess cash' : 'Cash shortage'}
              </span>
            </div>
            {variance !== 0 && (
              <p className={cn(
                'text-amount-sm tabular-nums',
                variance > 0 ? 'text-income' : 'text-destructive'
              )}>
                {variance > 0 ? '+' : '-'}KES {formatCurrency(Math.abs(variance))}
              </p>
            )}
          </div>
        )}
        
        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={!hasInput}
          className="w-full"
          size="lg"
        >
          Confirm Cash Count
        </Button>
      </div>
    </div>
  );
}
