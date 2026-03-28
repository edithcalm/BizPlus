import { useState } from 'react';
import { X, Smartphone, Shield, Check, Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DEMO_PHONE_NUMBER } from '@/lib/mpesaApi';

interface MpesaConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (identifier: string, type: 'till' | 'paybill' | 'pochi', businessName: string, pochiPhone?: string) => Promise<void>;
  isConnecting: boolean;
}

export function MpesaConnectionModal({ 
  isOpen, 
  onClose, 
  onConnect,
  isConnecting 
}: MpesaConnectionModalProps) {
  const [step, setStep] = useState<'type' | 'details' | 'success'>('type');
  const [connectionType, setConnectionType] = useState<'till' | 'paybill' | 'pochi'>('till');
  const [number, setNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConnect = async () => {
    setError('');
    
    if (!number.trim()) {
      setError(`Please enter your ${connectionType === 'till' ? 'Till' : connectionType === 'paybill' ? 'Paybill' : 'Phone'} number`);
      return;
    }
    
    if (!businessName.trim()) {
      setError('Please enter your business name');
      return;
    }

    try {
      await onConnect(
        number.trim(), 
        connectionType, 
        businessName.trim(),
        undefined
      );
      setStep('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed');
    }
  };

  const handleClose = () => {
    setStep('type');
    setNumber('');
    setBusinessName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 pb-8 animate-slide-up shadow-elevated max-h-[85vh] overflow-y-auto mb-16 sm:mb-0">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        {step === 'type' && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-mpesa/10 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-mpesa" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Connect M-Pesa</h2>
                <p className="text-sm text-muted-foreground">Link your business account</p>
              </div>
            </div>

            {/* Connection Types */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  setConnectionType('till');
                  setStep('details');
                }}
                className="w-full flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors text-left"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">T</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">Till Number</h3>
                  <p className="text-sm text-muted-foreground">For Lipa na M-Pesa (Buy Goods)</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setConnectionType('pochi');
                  setStep('details');
                }}
                className="w-full flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors text-left"
              >
                <div className="h-12 w-12 rounded-full bg-pochi/10 flex items-center justify-center shrink-0">
                  <Wallet className="h-6 w-6 text-pochi" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">Pochi la Biashara</h3>
                  <p className="text-sm text-muted-foreground">For business wallets</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setConnectionType('paybill');
                  setStep('details');
                }}
                className="w-full flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors text-left"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">P</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">Paybill Number</h3>
                  <p className="text-sm text-muted-foreground">For business payments</p>
                </div>
              </button>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Your M-Pesa credentials are encrypted and stored securely. 
                BizPlus only reads transaction data.
              </p>
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => setStep('type')}
                className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                ←
              </button>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Enter {connectionType === 'till' ? 'Till' : connectionType === 'paybill' ? 'Paybill' : 'Pochi la Biashara'} Details
                </h2>
                <p className="text-sm text-muted-foreground">We'll verify your account</p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {connectionType === 'till' ? 'Till Number' : connectionType === 'paybill' ? 'Paybill Number' : 'Phone Number'}
                </label>
                <div className="relative">
                  <input
                    type={connectionType === 'pochi' ? 'tel' : 'text'}
                    inputMode={connectionType === 'pochi' ? 'tel' : 'numeric'}
                    value={number}
                    onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder={connectionType === 'till' ? 'e.g. 123456' : connectionType === 'paybill' ? 'e.g. 247247' : 'e.g. 0721606409'}
                    className={cn(
                      'w-full px-4 py-3 bg-background border-2 rounded-xl text-base',
                      'focus:outline-none focus:ring-0 focus:border-primary transition-colors',
                      'placeholder:text-muted-foreground'
                    )}
                    maxLength={connectionType === 'pochi' ? 10 : 7}
                  />
                  {connectionType === 'pochi' && (
                    <p className="text-xs text-muted-foreground mt-1 text-left">
                      Demo: Use {DEMO_PHONE_NUMBER} for sample transactions
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Mama Mboga Stores"
                  className={cn(
                    'w-full px-4 py-3 bg-background border-2 rounded-xl text-base',
                    'focus:outline-none focus:ring-0 focus:border-primary transition-colors',
                    'placeholder:text-muted-foreground'
                  )}
                />
              </div>
            </div>



            {error && (
              <p className="text-sm text-destructive mb-4">{error}</p>
            )}

            {/* Submit Button */}
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                'Connect M-Pesa Account'
              )}
            </Button>
          </>
        )}

        {step === 'success' && (
          <div className="text-center py-6">
            <div className="h-16 w-16 rounded-full bg-income/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-income" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Connected! 🎉</h2>
            <p className="text-muted-foreground mb-2">
              Your M-Pesa transactions will now sync automatically
            </p>
            {connectionType === 'pochi' && (
              <p className="text-sm text-pochi mb-4">
                ✓ Pochi la Biashara connected
              </p>
            )}
            <Button onClick={handleClose} className="w-full" size="lg">
              Start Tracking
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
