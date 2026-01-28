import { useState } from 'react';
import { Plus, Users, AlertTriangle } from 'lucide-react';
import { CreditCard } from '@/components/credits/CreditCard';
import { ReminderModal } from '@/components/modals/ReminderModal';
import { Button } from '@/components/ui/button';
import { mockCredits } from '@/lib/mockData';
import { CreditEntry } from '@/types/bizplus';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export function CreditsView() {
  const [credits, setCredits] = useState<CreditEntry[]>(mockCredits);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue'>('all');
  const [selectedCredit, setSelectedCredit] = useState<CreditEntry | null>(null);
  const [showReminder, setShowReminder] = useState(false);

  const now = new Date();
  
  const filteredCredits = credits.filter(credit => {
    if (filter === 'all') return credit.status !== 'paid';
    if (filter === 'pending') return credit.status === 'pending';
    if (filter === 'overdue') {
      return credit.dueDate && now > credit.dueDate && credit.status !== 'paid';
    }
    return true;
  });

  const totalOutstanding = credits
    .filter(c => c.status !== 'paid')
    .reduce((sum, c) => {
      const paid = c.payments.reduce((s, p) => s + p.amount, 0);
      return sum + (c.amount - paid);
    }, 0);

  const overdueCount = credits.filter(c => 
    c.dueDate && now > c.dueDate && c.status !== 'paid'
  ).length;

  const handleRemind = (credit: CreditEntry) => {
    setSelectedCredit(credit);
    setShowReminder(true);
  };

  const handlePayment = (credit: CreditEntry) => {
    // TODO: Implement payment recording modal
    console.log('Record payment for:', credit.customerName);
  };

  return (
    <div className="px-4 pb-24">
      {/* Header Stats */}
      <div className="bg-card rounded-2xl p-5 shadow-card mb-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-amount text-foreground tabular-nums">
              KES {formatCurrency(totalOutstanding)}
            </p>
          </div>
        </div>
        
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {overdueCount} {overdueCount === 1 ? 'customer' : 'customers'} overdue
            </span>
          </div>
        )}
      </div>
      
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {(['all', 'pending', 'overdue'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted'
            )}
          >
            {f === 'all' && 'All Credits'}
            {f === 'pending' && 'Pending'}
            {f === 'overdue' && `Overdue (${overdueCount})`}
          </button>
        ))}
      </div>
      
      {/* Credits List */}
      <div className="space-y-4">
        {filteredCredits.map((credit, index) => (
          <div key={credit.id} className={`stagger-${(index % 4) + 1}`}>
            <CreditCard 
              credit={credit}
              onRemind={handleRemind}
              onPayment={handlePayment}
            />
          </div>
        ))}
        
        {filteredCredits.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No credits to show</p>
          </div>
        )}
      </div>
      
      {/* Add Credit FAB */}
      <Button
        variant="fab"
        size="fab"
        className="fixed bottom-20 right-4 z-40"
      >
        <Plus className="h-6 w-6" />
      </Button>
      
      <ReminderModal 
        isOpen={showReminder}
        onClose={() => setShowReminder(false)}
        credit={selectedCredit}
      />
    </div>
  );
}
