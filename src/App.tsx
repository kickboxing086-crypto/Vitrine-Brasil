import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { ListingCard } from './components/ListingCard';
import { AdminModal } from './components/AdminModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PlansModal } from './components/PlansModal';
import { PolicyModal } from './components/PolicyModal';
import { ReferralModal } from './components/ReferralModal';
import { CATEGORIES, Category, PLATFORMS, PlatformType } from './data';
import { useListings } from './hooks/useListings';
import { useAuth } from './hooks/useAuth';
import { logout } from './lib/firebase';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { PlatformIcon } from './components/PlatformIcon';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category | 'Todos'>('Todos');
  const [activePlatform, setActivePlatform] = useState<PlatformType | 'Todos'>('Todos');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'terms' | 'privacy'>('terms');
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  const { listings, loading, addListing } = useListings();
  const { user, isAuthenticated } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = isAuthenticated;

  useEffect(() => {
    // Sync URL path with modal state
    if (location.pathname === '/impulsionelink/login' || location.pathname === '/login') {
      setIsLoginModalOpen(true);
    } else if (location.pathname === '/impulsionelink/dashboard' || location.pathname === '/dashboard') {
      setCurrentView('dashboard');
    } else if (location.pathname === '/impulsionelink' || location.pathname === '/impulsionelink/' || location.pathname === '/') {
      setIsLoginModalOpen(false);
      setCurrentView('home');
    }
  }, [location.pathname]);

  const handleCloseLogin = () => {
    setIsLoginModalOpen(false);
    if (location.pathname.includes('/login')) {
      navigate('/impulsionelink');
    }
  };

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');
      if (refCode) {
        try {
          localStorage.setItem('pending_referral_code', refCode.trim().toUpperCase());
        } catch (storageErr) {
          console.warn("Could not save pending referral code to localStorage:", storageErr);
        }
        setIsReferralModalOpen(true);
        // Clean up the URL to keep it pretty
        try {
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } catch (historyErr) {
          console.warn("Could not clean up URL using history API (iframe constraint):", historyErr);
        }
      }
    } catch (err) {
      console.error("Error checking referral query arguments:", err);
    }
  }, []);

  const isListingActive = (listing: any) => {
    if (listing.status === 'pending') return false;
    if (!listing.expiresAt) return true; // If no expiry date, assume active (backward compatibility)
    let expiryTime: number;
    if (typeof listing.expiresAt === 'object' && 'toMillis' in listing.expiresAt) {
      expiryTime = listing.expiresAt.toMillis();
    } else if (listing.expiresAt instanceof Date) {
      expiryTime = listing.expiresAt.getTime();
    } else {
      expiryTime = new Date(listing.expiresAt).getTime();
    }
    return expiryTime > Date.now();
  };

  const activeListings = listings.filter(isListingActive);

  const filteredListings = activeListings.filter(l => {
    const categoryMatch = activeCategory === 'Todos' || l.category === activeCategory;
    const platformMatch = activePlatform === 'Todos' || l.platform === activePlatform;
    return categoryMatch && platformMatch;
  });

  const trendingListings = [...activeListings]
    .filter(l => l.plan === 'ouro')
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#030303] text-gray-100 font-sans selection:bg-indigo-500 selection:text-white">
      <Header 
        isAuthenticated={isAuthenticated} 
        isAdmin={isAdmin}
        onAddClick={() => setIsAdminModalOpen(true)} 
        onLoginClick={() => navigate('/impulsionelink/login')}
        onAdvertiseClick={() => setIsPlansModalOpen(true)}
        currentView={currentView}
        setCurrentView={(view) => navigate(view === 'home' ? '/impulsionelink' : `/impulsionelink/${view}`)}
        onReferralClick={() => setIsReferralModalOpen(true)}
      />
      
      <main>
        {currentView === 'dashboard' && isAdmin ? (
           <Dashboard />
        ) : (
          <>
            <Hero 
              isAuthenticated={isAuthenticated} 
              isAdmin={isAdmin}
              onAddClick={() => setIsAdminModalOpen(true)}
              onAdvertiseClick={() => setIsPlansModalOpen(true)}
              listings={listings}
            />
            
            {/* Main Content Area */}
            <div id="explorar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-16">
              <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Sidebar (Categories) */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="sticky top-28">
                <h2 className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-4 pl-3">
                  Categorias
                </h2>
                <nav className="space-y-1 relative flex flex-col">
                  <button
                    onClick={() => setActiveCategory('Todos')}
                    className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors z-10 ${
                      activeCategory === 'Todos' 
                        ? 'text-cyan-400 shadow-sm' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                  >
                    {activeCategory === 'Todos' && (
                      <motion.div layoutId="activeCategoryBg" className="absolute inset-0 bg-white/10 rounded-xl shadow-sm border border-white/10 backdrop-blur-sm -z-10" />
                    )}
                    <div className="flex items-center gap-3">
                      <Icons.LayoutGrid size={18} className={activeCategory === 'Todos' ? 'text-cyan-400' : 'text-gray-500'} />
                      Ver Todos
                    </div>
                    <span className="bg-black/40 text-gray-400 py-0.5 px-2.5 rounded-full text-xs font-semibold border border-white/5">
                      {activeListings.filter(l => activePlatform === 'Todos' || l.platform === activePlatform).length}
                    </span>
                  </button>
                  
                  {(showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 5)).map((cat) => {
                    const IconComponent = (Icons as any)[cat.icon] || Icons.Folder;
                    const isActive = activeCategory === cat.name;
                    const count = activeListings.filter(l => l.category === cat.name && (activePlatform === 'Todos' || l.platform === activePlatform)).length;
                    
                    return (
                      <button
                        key={cat.name}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors z-10 ${
                          isActive 
                            ? 'text-cyan-400 shadow-sm' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                        }`}
                      >
                        {isActive && (
                          <motion.div layoutId="activeCategoryBg" className="absolute inset-0 bg-white/10 rounded-xl shadow-sm border border-white/10 backdrop-blur-sm -z-10" />
                        )}
                        <div className="flex items-center gap-3">
                           <IconComponent size={18} className={isActive ? 'text-cyan-400' : 'text-gray-500'} />
                           {cat.name}
                        </div>
                        <span className="bg-black/40 text-gray-400 py-0.5 px-2.5 rounded-full text-xs font-semibold border border-white/5">
                           {count}
                        </span>
                      </button>
                    )
                  })}
                  
                  {CATEGORIES.length > 5 && (
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-cyan-400 hover:bg-white/5 transition-colors mt-2"
                    >
                      <span className="flex items-center gap-2">
                        {showAllCategories ? (
                          <>
                            <Icons.ChevronUp size={16} />
                            Ver menos categorias
                          </>
                        ) : (
                          <>
                            <Icons.ChevronDown size={16} className="animate-bounce" />
                            Ver mais categorias (+{CATEGORIES.length - 5})
                          </>
                        )}
                      </span>
                    </button>
                  )}
                </nav>
              </div>
            </aside>

            {/* Grid Area */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-extrabold text-white">
                  {activeCategory === 'Todos' ? 'Anúncios Recentes' : `Categoria: ${activeCategory}`}
                </h2>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActivePlatform('Todos')}
                    className={`relative px-4 py-2 text-sm font-bold transition-all z-10 overflow-hidden ${
                      activePlatform === 'Todos' 
                        ? 'text-white' 
                        : 'bg-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {activePlatform === 'Todos' && (
                      <motion.div layoutId="activePlatformBg" className="absolute inset-0 bg-white/10 rounded-xl border border-white/20 -z-10" />
                    )}
                    Todas Plataformas
                  </button>
                  {PLATFORMS.map(p => {
                    const isActive = activePlatform === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setActivePlatform(p.id)}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm z-10 ${
                          isActive 
                            ? `text-white` 
                            : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {isActive && (
                          <motion.div layoutId="activePlatformBg" className={`absolute inset-0 ${p.color} rounded-xl -z-10`} />
                        )}
                        <PlatformIcon platform={p.id} size={16} className={isActive ? "brightness-0 invert" : "opacity-80 grayscale group-hover:grayscale-0"} />
                        {p.name}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Trending Section */}
              {trendingListings.length > 0 && activeCategory === 'Todos' && activePlatform === 'Todos' && (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <Icons.Crown className="text-yellow-500" size={24} />
                    <h2 className="text-xl font-bold text-white">Ranking Em Alta <span className="text-sm font-medium text-gray-400 ml-2">(Plano Mensal)</span></h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {trendingListings.map((listing, index) => (
                      <div key={listing.id} className="relative">
                        <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm z-10 shadow-lg ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900 border-2 border-yellow-200' : 
                          index === 1 ? 'bg-gray-300 text-gray-800 border-2 border-gray-100' : 
                          'bg-amber-600 text-amber-100 border-2 border-amber-400'
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="transform transition-transform hover:-translate-y-1">
                           <ListingCard listing={listing} currentUserId={user?.uid} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full py-12 text-center text-gray-500">
                    <Icons.Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-indigo-500" />
                    Carregando anúncios...
                  </div>
                ) : filteredListings.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-white/5 border border-white/10 rounded-3xl border-dashed backdrop-blur-sm w-full">
                    <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <Icons.SearchX size={28} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 font-sans">Crie o primeiro anúncio grátis!</h3>
                    <p className="text-gray-400 max-w-sm mx-auto text-xs leading-relaxed mb-6 font-medium">Ainda não há anúncios ativos nesta categoria. Aproveite nossa promoção especial de inauguração para garantir sua vaga!</p>
                    <button
                      onClick={() => setIsPlansModalOpen(true)}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      Cadastrar meu Link Grátis
                    </button>
                  </div>
                ) : (
                  filteredListings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} currentUserId={user?.uid} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </main>

      {/* Values Section */}
      <section className="border-t border-white/10 mt-20 pt-16 pb-12 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-blue-400">
                <Icons.Target size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Nossa Missão</h3>
              <p className="text-gray-400 leading-relaxed text-sm font-medium">
                Conectar pessoas e negócios por meio de grupos e links de forma rápida, segura e eficiente, impulsionando comunidades em todo o Brasil.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)] text-purple-400">
                <Icons.Eye size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Nossa Visão</h3>
              <p className="text-gray-400 leading-relaxed text-sm font-medium">
                Ser a maior e mais confiável plataforma de impulso de links do país, reconhecida pela inovação, engajamento e a melhor curadoria de links e comunidades.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-cyan-400">
                <Icons.Heart size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Nossos Valores</h3>
              <p className="text-gray-400 leading-relaxed text-sm font-medium">
                Transparência, excelência, foco no cliente e dedicação total à melhoria contínua da experiência dos nossos usuários.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#030303] border-t border-white/10 pb-8 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <p className="font-medium flex items-center gap-2">
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight uppercase text-base">Vitrine Brasil</span>
            &copy; 2026
          </p>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <button 
              onClick={() => { setPolicyType('terms'); setIsPolicyOpen(true); }}
              className="hover:text-cyan-400 font-medium transition-colors cursor-pointer bg-transparent border-none"
            >
              Termos de Uso
            </button>
            <button 
              onClick={() => { setPolicyType('privacy'); setIsPolicyOpen(true); }}
              className="hover:text-cyan-400 font-medium transition-colors cursor-pointer bg-transparent border-none"
            >
              Privacidade
            </button>
            {!isAuthenticated ? (
              <button 
                onClick={() => navigate('/impulsionelink/login')}
                className="text-gray-600 hover:text-indigo-400 font-bold transition-all ml-2 text-xs cursor-pointer"
              >
                Acesso Restrito Staff
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate(currentView === 'dashboard' ? '/impulsionelink' : '/impulsionelink/dashboard')}
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors text-xs cursor-pointer"
                >
                  {currentView === 'dashboard' ? 'Ver Vitrine' : 'Painel de Controle'}
                </button>
                <button 
                  onClick={async () => {
                    await logout();
                    navigate('/impulsionelink');
                  }} 
                  className="text-rose-500 hover:text-rose-400 font-bold transition-colors text-xs cursor-pointer"
                >
                  Sair do Painel
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>

      <PlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        listings={listings}
        onLoginClick={() => navigate('/impulsionelink/login')}
      />
      <AdminModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
        onSubmit={addListing} 
      />
      <AdminLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={handleCloseLogin} 
      />
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        type={policyType}
      />
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        onLoginClick={() => navigate('/impulsionelink/login')}
      />
    </div>
  );
}
