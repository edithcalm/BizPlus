import { Check, CheckCheck, Smartphone } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/bizplus';
import { formatTime, formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isSystem = message.type === 'system';
  const isSent = message.type === 'sent';

  if (isSystem) {
    return (
      <div className="flex justify-center my-3 animate-fade-in">
        <div className="bg-chat-system px-4 py-2 rounded-xl max-w-[85%]">
          <p className="text-sm text-center">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex mb-3 animate-slide-up',
      isSent ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'relative max-w-[85%] px-4 py-3 rounded-bubble shadow-sm',
        isSent 
          ? 'bg-chat-sent rounded-tr-sm' 
          : 'bg-chat-received rounded-tl-sm'
      )}>
        {/* M-Pesa indicator for received messages */}
        {!isSent && message.parsed && (
          <div className="flex items-center gap-1 mb-2 text-mpesa">
            <Smartphone className="h-3 w-3" />
            <span className="text-xs font-medium">M-Pesa Message</span>
          </div>
        )}
        
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        
        {/* Parsed transaction details */}
        {message.parsed && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <span className={cn(
                  'ml-1 font-semibold',
                  message.parsed.type === 'received' ? 'text-income' : 'text-expense'
                )}>
                  KES {formatCurrency(message.parsed.amount)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-1 font-medium capitalize">
                  {message.parsed.type}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Party:</span>
                <span className="ml-1 font-medium">
                  {message.parsed.party}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Code:</span>
                <span className="ml-1 font-mono text-primary">
                  {message.parsed.transactionCode}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Time and status */}
        <div className={cn(
          'flex items-center gap-1 mt-2',
          isSent ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
          {isSent && (
            <CheckCheck className="h-3 w-3 text-primary" />
          )}
        </div>
      </div>
    </div>
  );
}
