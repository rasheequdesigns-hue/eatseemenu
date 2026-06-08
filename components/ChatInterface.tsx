import React from 'react';

export default function ChatInterface() {
  return (
    <div className="flex flex-col h-screen p-4 sm:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Eatsee Menu Portal</h1>
          <p className="text-emerald-400/80 text-sm">Interactive Storefront Management</p>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="/eatsee_food_brand_storefront.html" 
            className="bg-emerald-500 hover:bg-emerald-600 text-[#00080f] font-bold py-2 px-6 rounded-full transition-all shadow-lg hover:shadow-emerald-500/20"
          >
            View Live Storefront
          </a>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-2xl w-full glass-card rounded-[32px] p-8 text-center border border-white/10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-utensils text-3xl text-emerald-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to your Menu Portal</h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Manage your food products, update prices, and customize your storefront design perfectly. 
            Click the button above to view your live menu, or use the settings icon below to access the admin panel.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="glass p-4 rounded-2xl border border-white/5">
              <h3 className="text-emerald-400 font-bold mb-1">Product Management</h3>
              <p className="text-xs text-slate-400">Add, edit or delete menu items with ease.</p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/5">
              <h3 className="text-emerald-400 font-bold mb-1">Design Customization</h3>
              <p className="text-xs text-slate-400">Change logos, taglines and slogan texts.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

