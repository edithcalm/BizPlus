import { Bell, Settings } from 'lucide-react';
import { getGreeting } from '@/lib/formatters';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">{getGreeting()} 👋</p>
            <h1 className="text-xl font-bold tracking-tight">BizPlus</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Curved bottom edge */}
      <div className="h-4 bg-background rounded-t-3xl" />
    </header>
  );
}
