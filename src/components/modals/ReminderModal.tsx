import { X, MessageSquare, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { CreditEntry } from '@/types/bizplus';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  credit: CreditEntry | null;
}

export function ReminderModal({ isOpen, onClose, credit }: ReminderModalProps) {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen || !credit) return null;
  
  const paidAmount = credit.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = credit.amount - paidAmount;
  
  const reminderMessage = `Hello ${credit.customerName}! 👋

This is a friendly reminder about your outstanding balance with us.

📋 Details:
• Original amount: KES ${formatCurrency(credit.amount)}
• Remaining balance: KES ${formatCurrency(remainingAmount)}
${credit.dueDate ? `• Due date: ${formatDate(credit.dueDate)}` : ''}

Please settle at your earliest convenience. You can pay via M-Pesa or cash.

Thank you for your business! 🙏`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reminderMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const phone = credit.phoneNumber?.replace(/^0/, '254');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(reminderMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up shadow-elevated max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Send Reminder</h2>
            <p className="text-sm text-muted-foreground">to {credit.customerName}</p>
          </div>
        </div>
        
        {/* Message Preview */}
        <div className="bg-chat-received rounded-2xl p-4 mb-4 text-sm whitespace-pre-wrap">
          {reminderMessage}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={handleCopy}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Message
              </>
            )}
          </Button>
          
          {credit.phoneNumber && (
            <Button 
              onClick={handleWhatsApp}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
