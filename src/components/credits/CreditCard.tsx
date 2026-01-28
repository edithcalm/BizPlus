import { User, Phone, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { CreditEntry } from '@/types/bizplus';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CreditCardProps {
  credit: CreditEntry;
  onRemind: (credit: CreditEntry) => void;
  onPayment: (credit: CreditEntry) => void;
}

export function CreditCard({ credit, onRemind, onPayment }: CreditCardProps) {
  const paidAmount = credit.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = credit.amount - paidAmount;
  const progress = (paidAmount / credit.amount) * 100;
  
  const isOverdue = credit.dueDate && new Date() > credit.dueDate && credit.status !== 'paid';

  return (
    <div className={cn(
      'bg-card rounded-2xl p-4 shadow-card animate-slide-up',
      isOverdue && 'ring-2 ring-destructive/30'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{credit.customerName}</h3>
            {credit.phoneNumber && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {credit.phoneNumber}
              </div>
            )}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={cn(
          'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
          credit.status === 'paid' && 'bg-income/10 text-income',
          credit.status === 'partial' && 'bg-warning/10 text-warning',
          credit.status === 'pending' && isOverdue && 'bg-destructive/10 text-destructive',
          credit.status === 'pending' && !isOverdue && 'bg-muted text-muted-foreground',
        )}>
          {credit.status === 'paid' && <CheckCircle className="h-3 w-3" />}
          {credit.status === 'partial' && <Clock className="h-3 w-3" />}
          {credit.status === 'pending' && isOverdue && <AlertCircle className="h-3 w-3" />}
          {credit.status === 'pending' && !isOverdue && <Clock className="h-3 w-3" />}
          <span className="capitalize">
            {isOverdue && credit.status === 'pending' ? 'Overdue' : credit.status}
          </span>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3">{credit.description}</p>
      
      {/* Amount & Progress */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-muted-foreground">Outstanding</span>
          <span className="text-amount-sm text-expense tabular-nums">
            KES {formatCurrency(remainingAmount)}
          </span>
        </div>
        
        {credit.status === 'partial' && (
          <div className="space-y-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-income rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Paid: KES {formatCurrency(paidAmount)}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Dates */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Given: {formatRelativeTime(credit.date)}</span>
        </div>
        {credit.dueDate && (
          <div className={cn(
            'flex items-center gap-1',
            isOverdue && 'text-destructive'
          )}>
            <AlertCircle className="h-3 w-3" />
            <span>Due: {formatDate(credit.dueDate)}</span>
          </div>
        )}
      </div>
      
      {/* Actions */}
      {credit.status !== 'paid' && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs sm:text-sm"
            onClick={() => onRemind(credit)}
          >
            Send Reminder
          </Button>
          <Button 
            variant="income" 
            size="sm" 
            className="flex-1 text-xs sm:text-sm"
            onClick={() => onPayment(credit)}
          >
            Record Payment
          </Button>
        </div>
      )}
    </div>
  );
}
