import { useState } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export function ChatInput({ onSend, placeholder = "Paste M-Pesa message..." }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t p-3">
      <div className="mx-auto max-w-lg">
        <div className="flex items-end gap-2">
          <button className="p-3 text-muted-foreground hover:text-foreground transition-colors">
            <Paperclip className="h-5 w-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className={cn(
                'w-full px-4 py-3 bg-card rounded-2xl border border-border',
                'resize-none focus:outline-none focus:ring-2 focus:ring-primary/50',
                'text-sm placeholder:text-muted-foreground',
                'max-h-32 min-h-[48px]'
              )}
              style={{ 
                height: 'auto',
                minHeight: '48px'
              }}
            />
          </div>
          
          {message.trim() ? (
            <button 
              onClick={handleSend}
              className="p-3 bg-primary text-primary-foreground rounded-full shadow-button hover:bg-primary/90 transition-all active:scale-95"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button className="p-3 text-muted-foreground hover:text-foreground transition-colors">
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-2">
          Forward your M-Pesa messages here to log transactions
        </p>
      </div>
    </div>
  );
}
