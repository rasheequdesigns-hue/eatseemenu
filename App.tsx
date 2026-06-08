import React, { useState, useEffect } from 'react';
// Triggering new build to resolve missing service resolution
import { View } from './types';
import ChatInterface from './components/ChatInterface';
import Storefront from './components/Storefront';
import { LiquidBackground } from './components/LiquidBackground';
import { MessageSquare } from 'lucide-react';
import { mockDB } from './services/mockFirebase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.STOREFRONT);

  // Sync Global Settings (Title, Icon)
  useEffect(() => {
    const syncSettings = () => {
        const settings = mockDB.getSettings();
        if (settings.appName) {
            document.title = settings.appName;
        }
        if (settings.logoBase64) {
            // Update Favicon
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = settings.logoBase64;
        }
    };
    
    syncSettings();
    
    // Simple polling to keep basic metadata in sync if changed in another tab or view
    const interval = setInterval(syncSettings, 2000);
    return () => clearInterval(interval);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case View.STOREFRONT:
        return <Storefront />;
      case View.CHAT:
        return <ChatInterface />;
      default:
        return <Storefront />;
    }
  };

  return (
    <LiquidBackground>
      <div className="min-h-screen w-full relative overflow-y-auto">
        {/* Main Content Layer */}
        <div className="relative z-10 min-h-full w-full">
          {renderView()}
        </div>

        {/* View Toggle - Floating Glass Button */}
        <button 
          onClick={() => setCurrentView(currentView === View.STOREFRONT ? View.CHAT : View.STOREFRONT)}
          className="fixed bottom-6 right-6 z-50 glass rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group bg-white/10"
          title={currentView === View.STOREFRONT ? "Chat with AI Assistant" : "View Storefront"}
        >
          {currentView === View.STOREFRONT ? (
            <MessageSquare size={20} className="text-white/70 group-hover:text-emerald-400 transition-colors" />
          ) : (
            <div className="bg-white/10 rounded-full p-1"><i className="fa-solid fa-utensils text-white/70 group-hover:text-emerald-400"></i></div>
          )}
        </button>
      </div>
    </LiquidBackground>
  );
};

export default App;