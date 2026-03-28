import { useState, useEffect } from 'react';
import { Plus, Users, AlertTriangle, Search } from 'lucide-react';
import { CreditCard } from '@/components/credits/CreditCard';
import { ReminderModal } from '@/components/modals/ReminderModal';
import { Button } from '@/components/ui/button';
import { CreditEntry } from '@/types/bizplus';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const CREDITS_STORAGE_KEY = 'bizplus_credits';

function loadCreditsFromStorage(): CreditEntry[] {
  try {
    const raw = localStorage.getItem(CREDITS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CreditEntry[];
    return parsed.map((c) => ({
      ...c,
      date: new Date(c.date),
      dueDate: c.dueDate ? new Date(c.dueDate) : undefined,
      payments: (c.payments ?? []).map((p) => ({
        ...p,
        date: new Date(p.date),
      })),
    }));
  } catch {
    return [];
  }
}

export function CreditsView() {
  const [credits, setCredits] = useState<CreditEntry[]>(loadCreditsFromStorage);

  useEffect(() => {
    localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(credits));
  }, [credits]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue'>('all');
  const [selectedCredit, setSelectedCredit] = useState<CreditEntry | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const now = new Date();
  
  const filteredCredits = credits.filter(credit => {
    // Filter by status
    if (filter === 'all' && credit.status === 'paid') return false;
    if (filter === 'pending' && credit.status !== 'pending') return false;
    if (filter === 'overdue') {
      const isOverdue = credit.dueDate && now > credit.dueDate && credit.status !== 'paid';
      if (!isOverdue) return false;
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        credit.customerName.toLowerCase().includes(query) ||
        credit.phoneNumber?.includes(query) ||
        credit.description.toLowerCase().includes(query)
      );
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
    <div className="px-3 sm:px-4 pb-24">
      {/* Header Stats */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-card mb-4 sm:mb-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-xl sm:text-amount text-foreground tabular-nums truncate">
              {credits.length === 0 ? (
                <span className="text-muted-foreground">—</span>
              ) : (
                <>KES {formatCurrency(totalOutstanding)}</>
              )}
            </p>
            {credits.length === 0 && (
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                Add credit sales to see amounts owed here.
              </p>
            )}
          </div>
        </div>
        
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-destructive">
              {overdueCount} {overdueCount === 1 ? 'customer' : 'customers'} overdue
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
        {(['all', 'pending', 'overdue'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all',
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
      <div className="space-y-3 sm:space-y-4">
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
            <p className="text-muted-foreground text-sm">
              {searchQuery ? 'No customers match your search' : 'No credits to show'}
            </p>
          </div>
        )}
      </div>
      
      {/* Add Credit FAB */}
      <Button
        variant="fab"
        size="fab"
        className="fixed bottom-20 right-3 sm:right-4 z-40"
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
