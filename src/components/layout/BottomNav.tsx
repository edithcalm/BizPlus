import { Home, MessageSquare, Users, BarChart3, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', id: 'home' },
  { icon: MessageSquare, label: 'Messages', id: 'messages' },
  { icon: Users, label: 'Credits', id: 'credits' },
  { icon: Wallet, label: 'Payments', id: 'payments' },
  { icon: BarChart3, label: 'Reports', id: 'reports' },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className={cn(
                  'p-2 rounded-xl transition-all duration-200',
                  isActive && 'bg-primary/10'
                )}>
                  <Icon className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    isActive && 'scale-110'
                  )} />
                </div>
                <span className={cn(
                  'text-[10px] sm:text-xs font-medium transition-all duration-200',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
