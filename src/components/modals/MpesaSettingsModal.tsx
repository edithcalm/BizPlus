import { X, Smartphone, Wifi, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MpesaCredentials } from '@/lib/mpesaApi';
import { formatDateTime } from '@/lib/formatters';

interface MpesaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: MpesaCredentials | null;
  onDisconnect: () => void;
}

export function MpesaSettingsModal({ 
  isOpen, 
  onClose, 
  credentials,
  onDisconnect 
}: MpesaSettingsModalProps) {
  if (!isOpen || !credentials) return null;

  const handleDisconnect = () => {
    onDisconnect();
    onClose();
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
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-mpesa/10 flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-mpesa" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">M-Pesa Settings</h2>
            <p className="text-sm text-muted-foreground">Manage your connection</p>
          </div>
        </div>

        {/* Connection Info */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="h-4 w-4 text-income" />
            <span className="text-sm font-medium text-income">Connected</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business Name</span>
              <span className="font-medium text-foreground">{credentials.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {credentials.tillNumber ? 'Till Number' : 'Paybill Number'}
              </span>
              <span className="font-medium text-foreground font-mono">
                {credentials.tillNumber || credentials.paybillNumber}
              </span>
            </div>
            {credentials.connectedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connected On</span>
                <span className="font-medium text-foreground">
                  {formatDateTime(credentials.connectedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="bg-muted/50 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Active Features</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-income">✓</span>
              Auto-sync M-Pesa transactions
            </li>
            <li className="flex items-center gap-2">
              <span className="text-income">✓</span>
              Real-time payment notifications
            </li>
            <li className="flex items-center gap-2">
              <span className="text-income">✓</span>
              Transaction categorization
            </li>
          </ul>
        </div>

        {/* Disconnect Button */}
        <div className="border-t pt-4">
          <Button 
            variant="outline"
            onClick={handleDisconnect}
            className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Disconnect M-Pesa
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            This will remove all synced transactions
          </p>
        </div>
      </div>
    </div>
  );
}
