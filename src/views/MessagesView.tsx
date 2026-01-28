import { useState, useEffect, useRef } from 'react';
import { Smartphone, ArrowDownLeft, ArrowUpRight, Wifi, RefreshCw } from 'lucide-react';
import { Transaction } from '@/types/bizplus';
import { formatCurrency, formatTime, formatRelativeTime } from '@/lib/formatters';
import { formatMpesaMessage, MpesaTransaction } from '@/lib/mpesaApi';
import { useMpesaConnection } from '@/hooks/useMpesaConnection';
import { cn } from '@/lib/utils';

export function MessagesView() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    transactions, 
    isConnected, 
    isFetching, 
    credentials,
    fetchTransactions 
  } = useMpesaConnection();

  // Auto-scroll to bottom when new transactions arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transactions.length]);

  const getMpesaStyleMessage = (txn: Transaction): string => {
    const date = txn.date.toLocaleDateString('en-KE', { 
      day: 'numeric', 
      month: 'numeric', 
      year: '2-digit' 
    });
    const time = txn.date.toLocaleTimeString('en-KE', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    if (txn.type === 'income') {
      return `${txn.mpesaCode || 'CASH'} Confirmed. You have received Ksh${txn.amount.toLocaleString()}.00 from ${txn.customerName?.toUpperCase() || 'CUSTOMER'} on ${date} at ${time}.`;
    } else {
      return `${txn.mpesaCode || 'CASH'} Confirmed. Ksh${txn.amount.toLocaleString()}.00 paid to ${txn.customerName?.toUpperCase() || 'VENDOR'} on ${date} at ${time}. ${txn.description}.`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 sm:px-4 py-3 bg-card border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground text-sm sm:text-base">M-Pesa Messages</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isConnected ? 'Auto-synced from your M-Pesa account' : 'Connect M-Pesa to auto-sync'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected && (
              <span className="flex items-center gap-1 px-2 py-1 bg-income/10 text-income rounded-full text-[10px] sm:text-xs font-medium">
                <Wifi className="h-3 w-3" />
                <span className="hidden sm:inline">Live</span>
              </span>
            )}
            <button
              onClick={() => fetchTransactions()}
              disabled={isFetching || !isConnected}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 pb-24 scrollbar-hide bg-muted/30">
        {/* Welcome message */}
        <div className="flex justify-center mb-4">
          <div className="bg-chat-system px-3 sm:px-4 py-2 rounded-xl max-w-[90%] sm:max-w-[85%]">
            <p className="text-xs sm:text-sm text-center">
              {isConnected ? (
                <>
                  ✅ Connected to <strong>{credentials?.businessName}</strong><br/>
                  <span className="text-muted-foreground">
                    {credentials?.tillNumber ? `Till: ${credentials.tillNumber}` : `Paybill: ${credentials?.paybillNumber}`}
                  </span>
                </>
              ) : (
                <>
                  📱 Connect your M-Pesa account to automatically<br/>
                  sync and track all transactions in real-time.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Transaction Messages */}
        {transactions.length === 0 && (
          <div className="text-center py-8">
            <Smartphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {isConnected ? 'New M-Pesa transactions will appear here' : 'Connect M-Pesa to get started'}
            </p>
          </div>
        )}

        {[...transactions].reverse().map((txn, index) => (
          <div key={txn.id} className="mb-3 animate-slide-up">
            {/* M-Pesa Message Bubble */}
            <div className="flex justify-start">
              <div className="relative max-w-[90%] sm:max-w-[85%] px-3 sm:px-4 py-3 rounded-bubble bg-chat-received rounded-tl-sm shadow-sm">
                {/* M-Pesa indicator */}
                <div className="flex items-center gap-1 mb-2 text-mpesa">
                  <Smartphone className="h-3 w-3" />
                  <span className="text-[10px] sm:text-xs font-medium">M-PESA</span>
                </div>
                
                <p className="text-xs sm:text-sm leading-relaxed break-words">
                  {getMpesaStyleMessage(txn)}
                </p>
                
                {/* Parsed details */}
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <span className={cn(
                        'ml-1 font-semibold',
                        txn.type === 'income' ? 'text-income' : 'text-expense'
                      )}>
                        KES {formatCurrency(txn.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-1 font-medium capitalize">
                        {txn.type === 'income' ? 'Received' : 'Sent'}
                      </span>
                    </div>
                    {txn.customerName && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Party:</span>
                        <span className="ml-1 font-medium">
                          {txn.customerName}
                        </span>
                      </div>
                    )}
                    {txn.mpesaCode && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Code:</span>
                        <span className="ml-1 font-mono text-primary">
                          {txn.mpesaCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Time */}
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                    {formatTime(txn.date)}
                  </span>
                </div>
              </div>
            </div>

            {/* System Confirmation */}
            <div className="flex justify-center my-2">
              <div className="bg-chat-system px-3 py-1.5 rounded-xl">
                <p className="text-[10px] sm:text-xs text-center">
                  {txn.type === 'income' ? (
                    <>✅ Logged: +KES {formatCurrency(txn.amount)} from {txn.customerName || 'Customer'}</>
                  ) : (
                    <>💸 Logged: -KES {formatCurrency(txn.amount)} to {txn.customerName || 'Vendor'}</>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
