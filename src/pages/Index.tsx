import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { HomeView } from '@/views/HomeView';
import { MessagesView } from '@/views/MessagesView';
import { CreditsView } from '@/views/CreditsView';
import { ReportsView } from '@/views/ReportsView';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView onViewAllTransactions={() => setActiveTab('messages')} />;
      case 'messages':
        return <MessagesView />;
      case 'credits':
        return <CreditsView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <HomeView onViewAllTransactions={() => setActiveTab('messages')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-[calc(5rem+env(safe-area-inset-bottom))]">
        {renderView()}
      </main>
      
      <BottomNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default Index;
