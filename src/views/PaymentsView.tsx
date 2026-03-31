import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyWithSymbol } from '@/lib/formatters';
import { useMpesaConnection } from '@/hooks/useMpesaConnection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TxStatus = 'pending' | 'success' | 'failed';

interface PaymentTx {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  phone: string;
  reference: string;
  source: string;
  status: TxStatus;
  createdAt: string;
}

export function PaymentsView() {
  const [mode, setMode] = useState<'stk' | 'b2c' | 'b2b'>('stk');
  const [stkPhone, setStkPhone] = useState('');
  const [stkAmount, setStkAmount] = useState('');
  const [b2cPhone, setB2cPhone] = useState('');
  const [b2cAmount, setB2cAmount] = useState('');
  const [b2cRemarks, setB2cRemarks] = useState('');
  const [b2bBusiness, setB2bBusiness] = useState('');
  const [b2bAmount, setB2bAmount] = useState('');
  const [b2bRemarks, setB2bRemarks] = useState('');
  const [b2bChannel, setB2bChannel] = useState<'till' | 'paybill' | 'pochi'>('till');
  const [loadingStk, setLoadingStk] = useState(false);
  const [loadingB2c, setLoadingB2c] = useState(false);
  const [loadingB2b, setLoadingB2b] = useState(false);
  const [transactions, setTransactions] = useState<PaymentTx[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { addManualTransaction } = useMpesaConnection();
  const syncedIdsRef = useRef<Set<string>>(new Set());

  // Normalize phone into 2547/2541 format expected by Daraja
  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) {
      return `254${digits.slice(1)}`;
    }
    if (digits.startsWith('254')) return digits;
    return digits;
  };

  const syncToDashboard = (list: PaymentTx[]) => {
    const synced = syncedIdsRef.current;
    list
      .filter((tx) => tx.status === 'success' && !synced.has(tx.id))
      .forEach((tx) => {
        addManualTransaction({
          type: tx.type,
          amount: tx.amount,
          method: 'mpesa',
          description:
            tx.type === 'income'
              ? `${tx.source} from ${tx.phone}`
              : `${tx.source} to ${tx.phone}`,
          date: new Date(tx.createdAt),
          category: tx.type === 'expense' ? 'M-Pesa Expense' : 'M-Pesa Income',
        });
        synced.add(tx.id);
      });
  };

  async function fetchTransactions() {
    try {
      const res = await fetch('/api/mpesa/transactions');
      if (!res.ok) return;
      const data = await res.json();
      const txs: PaymentTx[] = data.transactions ?? [];
      setTransactions(txs);
      syncToDashboard(txs);
    } catch {
      // non-fatal
    }
  }

  useEffect(() => {
    fetchTransactions();
    const id = setInterval(fetchTransactions, 8000);
    return () => clearInterval(id);
  }, []);

  async function handleStkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoadingStk(true);
    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizePhone(stkPhone),
          amount: Number(stkAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start STK push');
      }
      fetchTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingStk(false);
    }
  }

  async function handleB2cSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoadingB2c(true);
    try {
      const res = await fetch('/api/mpesa/b2c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizePhone(b2cPhone),
          amount: Number(b2cAmount),
          remarks: b2cRemarks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start B2C payment');
      }
      fetchTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingB2c(false);
    }
  }

  async function handleB2bSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoadingB2b(true);
    try {
      const res = await fetch('/api/mpesa/b2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessNumber: b2bBusiness,
          amount: Number(b2bAmount),
          remarks: b2bRemarks,
          channel: b2bChannel,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start B2B payment');
      }
      fetchTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingB2b(false);
    }
  }

  const statusVariant = (s: TxStatus) =>
    s === 'success' ? 'default' : s === 'pending' ? 'secondary' : 'destructive';

  return (
    <div className="px-3 sm:px-4 pb-24 space-y-5">
      <div className="mt-2">
        <h1 className="text-lg font-semibold">M-Pesa Payments</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Request customer payments, send refunds, or pay suppliers from one place.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Unified payment modes */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex gap-2 mb-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
          <button
            type="button"
            onClick={() => setMode('stk')}
            className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              mode === 'stk'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            STK Push (Customer pays)
          </button>
          <button
            type="button"
            onClick={() => setMode('b2c')}
            className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              mode === 'b2c'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            B2C · Send Money
          </button>
          <button
            type="button"
            onClick={() => setMode('b2b')}
            className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              mode === 'b2b'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            B2B · Pay Business
          </button>
        </div>

        {mode === 'stk' && (
          <form className="space-y-3 pt-1" onSubmit={handleStkSubmit}>
            <p className="text-[11px] text-muted-foreground">
              Customer receives an M-Pesa popup to confirm payment.
            </p>
            <div>
              <label className="text-xs font-medium block mb-1">Customer Phone Number</label>
              <Input
                type="tel"
                placeholder="07XXXXXXXX or 2547XXXXXXXX"
                value={stkPhone}
                onChange={(e) => setStkPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Amount</label>
              <Input
                type="number"
                min={1}
                value={stkAmount}
                onChange={(e) => setStkAmount(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loadingStk}>
              {loadingStk ? 'Requesting…' : 'Request Payment'}
            </Button>
          </form>
        )}

        {mode === 'b2c' && (
          <form className="space-y-3 pt-1" onSubmit={handleB2cSubmit}>
            <p className="text-[11px] text-muted-foreground">
              Send money from your business wallet to a customer.
            </p>
            <div>
              <label className="text-xs font-medium block mb-1">Customer Phone Number</label>
              <Input
                type="tel"
                placeholder="07XXXXXXXX or 2547XXXXXXXX"
                value={b2cPhone}
                onChange={(e) => setB2cPhone(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Amount</label>
                <Input
                  type="number"
                  min={1}
                  value={b2cAmount}
                  onChange={(e) => setB2cAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Reason (optional)</label>
                <Input
                  type="text"
                  placeholder="Refund, winnings, salary..."
                  value={b2cRemarks}
                  onChange={(e) => setB2cRemarks(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loadingB2c}>
              {loadingB2c ? 'Sending…' : 'Send Money'}
            </Button>
          </form>
        )}

        {mode === 'b2b' && (
          <form className="space-y-3 pt-1" onSubmit={handleB2bSubmit}>
            <p className="text-[11px] text-muted-foreground">
              Pay another business via Till, Paybill, or Pochi la Biashara.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Business Channel</label>
                <Select
                  value={b2bChannel}
                  onValueChange={(val) =>
                    setB2bChannel(val as 'till' | 'paybill' | 'pochi')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="till">Till Number (Buy Goods)</SelectItem>
                    <SelectItem value="paybill">Paybill</SelectItem>
                    <SelectItem value="pochi">Pochi la Biashara</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">
                  {b2bChannel === 'till'
                    ? 'Till Number'
                    : b2bChannel === 'paybill'
                    ? 'Paybill Number'
                    : 'Business Phone (Pochi)'}
                </label>
                <Input
                  type="text"
                  placeholder={
                    b2bChannel === 'till'
                      ? 'e.g. 123456'
                      : b2bChannel === 'paybill'
                      ? 'e.g. 247247'
                      : '07XXXXXXXX or 2547XXXXXXXX'
                  }
                  value={b2bBusiness}
                  onChange={(e) => setB2bBusiness(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Amount</label>
                <Input
                  type="number"
                  min={1}
                  value={b2bAmount}
                  onChange={(e) => setB2bAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Reason (optional)</label>
                <Input
                  type="text"
                  placeholder="Stock, rent, utilities..."
                  value={b2bRemarks}
                  onChange={(e) => setB2bRemarks(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loadingB2b}>
              {loadingB2b ? 'Sending…' : 'Pay Business'}
            </Button>
          </form>
        )}
      </div>

      {/* Transaction list */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-4 shadow-card space-y-3">
        <h2 className="text-sm font-semibold mb-1">Recent Transactions</h2>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-medium">
                  {tx.type === 'income' ? 'Income' : 'Expense'} · {tx.source}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx.phone} · Ref: {tx.reference || '—'}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-semibold">
                  {formatCurrencyWithSymbol(tx.amount)}
                </p>
                <Badge variant={statusVariant(tx.status)} className="text-[10px]">
                  {tx.status === 'pending'
                    ? 'Pending'
                    : tx.status === 'success'
                    ? 'Success'
                    : 'Failed'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

