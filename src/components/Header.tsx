import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Search, Store, Menu, Plus, Megaphone, LogIn, LayoutDashboard } from 'lucide-react';
import { auth } from '../lib/firebase';

interface HeaderProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  onAddClick?: () => void;
  onLoginClick?: () => void;
  onAdvertiseClick?: () => void;
  currentView?: 'home' | 'dashboard';
  setCurrentView?: (view: 'home' | 'dashboard') => void;
}

export function Header({ isAuthenticated, isAdmin, onAddClick, onLoginClick, onAdvertiseClick, currentView = 'home', setCurrentView }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const whatsappLink = `https://wa.me/5584999857391?text=${encodeURIComponent('Olá! Tenho interesse em divulgar o meu site, como funciona?')}`;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          
          {/* Search Bar (Left on Desktop) */}
          <div className="flex-1 max-w-xl hidden md:block z-20">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Buscar grupos, canais, links..."
                className="block w-full pl-11 pr-4 py-3 border border-white/10 rounded-2xl leading-5 bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/10 transition-all text-sm font-medium text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex-1 md:hidden"></div>

          {/* Logo (Centered) */}
          <div 
             className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 cursor-pointer group z-20"
             onClick={() => setCurrentView && setCurrentView('home')}
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 uppercase whitespace-nowrap drop-shadow-sm">
              Vitrine Brasil
            </span>
          </div>

          <div className="flex-1 flex justify-end items-center space-x-3 z-20">
            <button className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
              <Search size={24} />
            </button>
            
            {isAuthenticated && isAdmin && (
              <div className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider select-none animate-pulse" title="Você está logado como Administrador">
                <Icons.ShieldCheck size={16} className="mr-1.5" />
                Admin
              </div>
            )}

            {isAuthenticated && !isAdmin && (
              <div className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider select-none" title="Você está logado como Cliente">
                <Icons.User size={16} className="mr-1.5" />
                {auth.currentUser?.displayName || 'Cliente'}
              </div>
            )}
            
            {isAuthenticated && isAdmin && (
              <button
                onClick={() => setCurrentView && setCurrentView('dashboard')}
                className={`hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                  currentView === 'dashboard' ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard size={18} className="mr-2" />
                Dashboard
              </button>
            )}

            <button
              onClick={() => {
                if (isAuthenticated && isAdmin) {
                  onAddClick && onAddClick();
                } else {
                  onAdvertiseClick && onAdvertiseClick();
                }
              }}
              className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:via-teal-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
            >
              <Plus size={18} className="mr-2" />
              Divulgar Link
            </button>

            <button 
              className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10 shadow-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Menu de Opções"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Menu (Dropdown on desktop, inline on mobile) */}
        {isMobileMenuOpen && (
          <div className="sm:absolute sm:right-6 sm:top-20 sm:w-72 sm:bg-[#0c0c10] sm:border sm:border-white/10 sm:shadow-2xl sm:rounded-2xl sm:mt-2 py-4 border-t border-white/10 sm:border-t-0 space-y-3 animate-in slide-in-from-top-2 duration-200 z-50">
            <div className="px-4 pb-2 sm:hidden">
              <input
                type="text"
                placeholder="Buscar grupos, canais, links..."
                className="block w-full pl-4 pr-4 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/10 transition-all text-sm font-medium text-white placeholder-gray-400"
              />
            </div>
            
            <div className="px-3 flex flex-col gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setCurrentView && setCurrentView('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                    currentView === 'dashboard' ? 'text-white bg-white/10 border border-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard size={18} className="mr-3 text-indigo-400" />
                  Dashboard
                </button>
              )}

              <button
                onClick={() => {
                  onAdvertiseClick && onAdvertiseClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl text-gray-200 hover:text-white hover:bg-white/5 transition-all text-left"
              >
                <Icons.Crown size={18} className="mr-3 text-yellow-500" />
                Planos de Divulgação
              </button>

              <div className="h-px w-full bg-white/10 my-2"></div>

              <button
                onClick={() => {
                  if (isAuthenticated && isAdmin) {
                    onAddClick && onAddClick();
                  } else {
                    onAdvertiseClick && onAdvertiseClick();
                  }
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-md sm:hidden"
              >
                <Plus size={18} className="mr-2" />
                Cadastrar Link
              </button>

              {isAuthenticated && (
                <button 
                  onClick={async () => {
                    const { logout } = await import('../lib/firebase');
                    await logout();
                    if (setCurrentView) setCurrentView('home');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left"
                >
                  <Icons.LogOut size={18} className="mr-3" />
                  Sair da Conta
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

