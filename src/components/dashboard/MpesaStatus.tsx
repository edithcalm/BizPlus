import { Smartphone, Wifi, WifiOff, RefreshCw, Settings, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';

interface MpesaStatusProps {
  isConnected: boolean;
  businessName?: string;
  tillNumber?: string;
  paybillNumber?: string;
  pochiPhoneNumber?: string;
  hasPochi?: boolean;
  lastFetch: Date | null;
  isFetching: boolean;
  onConnect: () => void;
  onRefresh: () => void;
  onSettings: () => void;
}

export function MpesaStatus({
  isConnected,
  businessName,
  tillNumber,
  paybillNumber,
  pochiPhoneNumber,
  hasPochi,
  lastFetch,
  isFetching,
  onConnect,
  onRefresh,
  onSettings,
}: MpesaStatusProps) {
  if (!isConnected) {
    return (
      <button
        onClick={onConnect}
        className="w-full flex items-center gap-3 p-3 sm:p-4 bg-card rounded-xl sm:rounded-2xl shadow-card hover:shadow-elevated transition-all animate-slide-up"
      >
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-mpesa/10 flex items-center justify-center shrink-0">
          <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-mpesa" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-semibold text-foreground text-sm sm:text-base">Connect M-Pesa</h3>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            Link Till, Paybill & Pochi la Biashara
          </p>
        </div>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground text-lg">+</span>
        </div>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 bg-card rounded-xl sm:rounded-2xl shadow-card animate-slide-up">
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-income/10 flex items-center justify-center shrink-0">
        <Wifi className="h-5 w-5 sm:h-6 sm:w-6 text-income" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{businessName}</h3>
          <span className="px-2 py-0.5 bg-income/10 text-income text-[10px] sm:text-xs font-medium rounded-full shrink-0">
            Connected
          </span>
          {hasPochi && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-pochi/10 text-pochi text-[10px] sm:text-xs font-medium rounded-full shrink-0">
              <Wallet className="h-2.5 w-2.5" />
              Pochi
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {tillNumber ? `Till: ${tillNumber}` : `Paybill: ${paybillNumber}`}
          {pochiPhoneNumber && ` • Pochi: ${pochiPhoneNumber}`}
          {lastFetch && (
            <span className="ml-2">• Synced {formatRelativeTime(lastFetch)}</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={cn(
            "h-4 w-4 sm:h-5 sm:w-5",
            isFetching && "animate-spin"
          )} />
        </button>
        <button
          onClick={onSettings}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
}
