import { useState } from 'react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { mockChatMessages } from '@/lib/mockData';
import { ChatMessage as ChatMessageType, ParsedMpesa } from '@/types/bizplus';

export function MessagesView() {
  const [messages, setMessages] = useState<ChatMessageType[]>(mockChatMessages);

  const parseMpesaMessage = (text: string): ParsedMpesa | null => {
    // Simple regex patterns to extract M-Pesa transaction details
    const codeMatch = text.match(/([A-Z0-9]{10})/);
    const amountMatch = text.match(/Ksh([\d,]+\.?\d*)/);
    const receivedMatch = text.toLowerCase().includes('received');
    const nameMatch = text.match(/(?:from|to)\s+([A-Z\s]+)\s+\d/i);
    
    if (codeMatch && amountMatch) {
      return {
        transactionCode: codeMatch[1],
        amount: parseFloat(amountMatch[1].replace(/,/g, '')),
        type: receivedMatch ? 'received' : 'sent',
        party: nameMatch ? nameMatch[1].trim() : 'Unknown',
        date: new Date(),
      };
    }
    
    return null;
  };

  const handleSendMessage = (content: string) => {
    // Add the received message (simulating forwarded M-Pesa SMS)
    const parsed = parseMpesaMessage(content);
    
    const receivedMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: 'received',
      content,
      timestamp: new Date(),
      parsed,
    };
    
    setMessages(prev => [...prev, receivedMessage]);
    
    // Add system confirmation if parsed successfully
    if (parsed) {
      setTimeout(() => {
        const systemMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          type: 'system',
          content: parsed.type === 'received'
            ? `✅ Transaction logged: KES ${parsed.amount.toLocaleString()} received from ${parsed.party}`
            : `💸 Expense logged: KES ${parsed.amount.toLocaleString()} paid to ${parsed.party}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, systemMessage]);
      }, 500);
    } else {
      // Add help message if parsing failed
      setTimeout(() => {
        const helpMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          type: 'system',
          content: '❓ Could not parse this message. Please forward the complete M-Pesa SMS.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, helpMessage]);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-card border-b">
        <h2 className="font-semibold text-foreground">M-Pesa Messages</h2>
        <p className="text-sm text-muted-foreground">
          Forward your M-Pesa SMS to automatically log transactions
        </p>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-40 scrollbar-hide bg-muted/30">
        {/* Welcome message */}
        <div className="flex justify-center mb-4">
          <div className="bg-chat-system px-4 py-2 rounded-xl max-w-[85%]">
            <p className="text-sm text-center">
              📱 Paste or forward your M-Pesa messages here.<br/>
              BizPlus will automatically log your transactions.
            </p>
          </div>
        </div>
        
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      
      {/* Input */}
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}
