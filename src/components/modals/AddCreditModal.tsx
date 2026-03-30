import { useState } from 'react';
import { X, UserPlus, Phone, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreditEntry } from '@/types/bizplus';

interface AddCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customerName: string;
    amount: number;
    description: string;
    phoneNumber?: string;
    dueDate?: Date;
  }) => void;
}

export function AddCreditModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: AddCreditModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dueDateStr, setDueDateStr] = useState('');
  
  if (!isOpen) return null;
  
  const isValid = customerName && amount && description;

  const handleSubmit = () => {
    if (isValid) {
      onSubmit({
        customerName,
        amount: parseFloat(amount),
        description,
        phoneNumber: phoneNumber || undefined,
        dueDate: dueDateStr ? new Date(dueDateStr) : undefined,
      });
      // Reset form
      setCustomerName('');
      setAmount('');
      setDescription('');
      setPhoneNumber('');
      setDueDateStr('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
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
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
            <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Add Credit Customer
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Record a new credit sale
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-5 pb-2 sm:px-6 [-webkit-overflow-scrolling:touch]">
          {/* Customer Name */}
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className={cn(
                'w-full px-4 py-2.5 sm:py-3 bg-background border-2 rounded-xl text-sm',
                'focus:outline-none focus:ring-0 focus:border-primary transition-colors',
                'placeholder:text-muted-foreground'
              )}
            />
          </div>

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
              Description / Items
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 2 bags of flour"
              className={cn(
                'w-full px-4 py-2.5 sm:py-3 bg-background border-2 rounded-xl text-sm',
                'focus:outline-none focus:ring-0 focus:border-primary transition-colors',
                'placeholder:text-muted-foreground'
              )}
            />
          </div>

          {/* Phone Number (Optional) */}
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <Phone className="h-3 w-3" /> Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 0712345678"
              className={cn(
                'w-full px-4 py-2.5 sm:py-3 bg-background border-2 rounded-xl text-sm',
                'focus:outline-none focus:ring-0 focus:border-primary transition-colors',
                'placeholder:text-muted-foreground'
              )}
            />
          </div>

          {/* Due Date (Optional) */}
          <div className="mb-5 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <CalendarDays className="h-3 w-3" /> Expected Payment Date (Optional)
            </label>
            <input
              type="date"
              value={dueDateStr}
              onChange={(e) => setDueDateStr(e.target.value)}
              className={cn(
                'w-full px-4 py-2.5 sm:py-3 bg-background border-2 rounded-xl text-sm',
                'focus:outline-none focus:ring-0 focus:border-primary transition-colors',
                'text-foreground'
              )}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="shrink-0 border-t border-border/60 bg-card px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-b-2xl sm:px-6">
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full"
            variant="default"
            size="lg"
          >
            Add Credit Customer
          </Button>
        </div>
      </div>
    </div>
  );
}
