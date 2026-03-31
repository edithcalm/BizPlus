import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyWithSymbol } from '@/lib/formatters';

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
  const [stkPhone, setStkPhone] = useState('');
  const [stkAmount, setStkAmount] = useState('');
  const [b2cPhone, setB2cPhone] = useState('');
  const [b2cAmount, setB2cAmount] = useState('');
  const [b2cRemarks, setB2cRemarks] = useState('');
  const [loadingStk, setLoadingStk] = useState(false);
  const [loadingB2c, setLoadingB2c] = useState(false);
  const [transactions, setTransactions] = useState<PaymentTx[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function fetchTransactions() {
    try {
      const res = await fetch('/api/mpesa/transactions');
      if (!res.ok) return;
      const data = await res.json();
      setTransactions(data.transactions ?? []);
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
        body: JSON.stringify({ phone: stkPhone, amount: Number(stkAmount) }),
      });
      if (!res.ok) throw new Error('Failed to start STK push');
      await res.json();
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
          phone: b2cPhone,
          amount: Number(b2cAmount),
          remarks: b2cRemarks,
        }),
      });
      if (!res.ok) throw new Error('Failed to start B2C payment');
      await res.json();
      fetchTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingB2c(false);
    }
  }

  const statusVariant = (s: TxStatus) =>
    s === 'success' ? 'default' : s === 'pending' ? 'secondary' : 'destructive';

  return (
    <div className="px-3 sm:px-4 pb-24 space-y-6">
      <h1 className="text-lg font-semibold mt-2">M-Pesa Payments</h1>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* STK Push */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-4 shadow-card space-y-3">
        <h2 className="text-sm font-semibold">STK Push (Lipa na M-Pesa)</h2>
        <form className="space-y-3" onSubmit={handleStkSubmit}>
          <div>
            <label className="text-xs font-medium block mb-1">Phone Number</label>
            <Input
              type="tel"
              placeholder="2547XXXXXXXX"
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
      </div>

      {/* B2C */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-4 shadow-card space-y-3">
        <h2 className="text-sm font-semibold">B2C (Business to Customer)</h2>
        <form className="space-y-3" onSubmit={handleB2cSubmit}>
          <div>
            <label className="text-xs font-medium block mb-1">Phone Number</label>
            <Input
              type="tel"
              placeholder="2547XXXXXXXX"
              value={b2cPhone}
              onChange={(e) => setB2cPhone(e.target.value)}
              required
            />
          </div>
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
            <label className="text-xs font-medium block mb-1">Remarks (optional)</label>
            <Textarea
              rows={2}
              value={b2cRemarks}
              onChange={(e) => setB2cRemarks(e.target.value)}
              placeholder="Reason for payment"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loadingB2c}>
            {loadingB2c ? 'Sending…' : 'Send Money'}
          </Button>
        </form>
      </div>

      {/* Transaction list */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-4 shadow-card space-y-3">
        <h2 className="text-sm font-semibold mb-1">Recent Transactions</h2>
        {transactions.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Transactions from STK Push and B2C will show here.
          </p>
        )}
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

