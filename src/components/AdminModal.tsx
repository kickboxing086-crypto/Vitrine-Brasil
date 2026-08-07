import React, { useState } from 'react';
import { X, ShieldCheck, Check, Crown, Gem } from 'lucide-react';
import { Category, PlanType, PlatformType, CATEGORIES, PLATFORMS } from '../data';
import { Listing } from '../data';
import { auth } from '../lib/firebase';
import { PlatformIcon } from './PlatformIcon';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Listing, 'id'>) => Promise<void>;
  initialData?: Listing;
}

export function AdminModal({ isOpen, onClose, onSubmit, initialData }: AdminModalProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<Category>(initialData?.category || 'Networking');
  const [platform, setPlatform] = useState<PlatformType>(initialData?.platform || 'whatsapp');
  const [link, setLink] = useState(initialData?.link || '');
  const [plan, setPlan] = useState<PlanType>(initialData?.plan || 'bronze');
  const [loading, setLoading] = useState(false);
  const [isConfirmingPublish, setIsConfirmingPublish] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmingPublish) {
      setIsConfirmingPublish(true);
      return;
    }

    if (!auth.currentUser) {
      alert("Você precisa estar logado para publicar.");
      return;
    }
    
    setLoading(true);
    try {
      const now = new Date();
      let expiresAt = new Date(now);
      
      switch (plan) {
        case 'bronze':
          expiresAt.setHours(expiresAt.getHours() + 24);
          break;
        case 'prata':
          expiresAt.setDate(expiresAt.getDate() + 7);
          break;
        case 'ouro':
          expiresAt.setDate(expiresAt.getDate() + 30);
          break;
      }

      const data: Omit<Listing, 'id' | 'imageUrl'> = {
        title,
        description,
        category,
        platform,
        link,
        ownerId: auth.currentUser.uid,
        plan,
        createdAt: now,
        updatedAt: now,
        expiresAt: expiresAt,
        userEmail: auth.currentUser.email || '',
        userName: auth.currentUser.displayName || ''
      };
      
      const submitData = data as Omit<Listing, 'id'>;

      await onSubmit(submitData);
      
      if (!initialData) {
        setTitle('');
        setDescription('');
        setLink('');
        setPlan('bronze');
      }
      setIsConfirmingPublish(false);
      onClose();
    } catch (error) {
      alert('Erro ao salvar: ' + (error as Error).message);
      setIsConfirmingPublish(false);
    } finally {
      setLoading(false);
    }
  };

  const PLANS = [
    { 
      id: 'bronze', 
      name: 'Gratuito (24h)', 
      price: 'Grátis', 
      desc: 'Anúncio por 24 horas (Uso único por cliente)',
      icon: ShieldCheck, 
      color: 'text-amber-400' 
    },
    { 
      id: 'prata', 
      name: 'Semanal (7 Dias)', 
      price: 'R$ 9,99', 
      desc: 'Anúncio por 7 dias com destaque',
      icon: Gem, 
      color: 'text-indigo-500' 
    },
    { 
      id: 'ouro', 
      name: 'Mensal (30 Dias)', 
      price: 'R$ 19,99', 
      desc: 'Destaque no topo e selo verificado',
      icon: Crown, 
      color: 'text-yellow-400' 
    },
    { 
      id: 'diamante', 
      name: 'Diamante (60 Dias)', 
      price: 'R$ 44,99', 
      desc: 'Máxima visibilidade em todas as categorias',
      icon: Crown, 
      color: 'text-cyan-400' 
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Editar Anúncio' : 'Impulsionar Novo Negócio'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto w-full custom-scrollbar">
          
          <div className="mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-4">
             <Gem className="text-indigo-500 shrink-0 mt-0.5" size={24} />
             <div>
               <h3 className="text-indigo-500 font-bold text-sm">Por que divulgar no Impulsione link?</h3>
               <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                 Nossa plataforma é otimizada para buscar pessoas do <strong>seu nicho</strong>. 
                 Quem procura pelo seu estilo de grupo já virá até você. E a melhor maneira de se destacar é com o plano <strong>Premium (Mensal)</strong>, ele vai colocar o anúncio no topo recebendo destaque e atenção em primeira mão!
               </p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-3">Escolha seu Plano</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLANS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = plan === p.id;
                  const isPremium = p.id === 'ouro';
                  return (
                    <div 
                      key={p.id}
                      onClick={() => setPlan(p.id as PlanType)}
                      className={`relative px-4 py-3 border rounded-xl cursor-pointer transition-all ${
                        isSelected 
                          ? isPremium ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className={isSelected ? (isPremium ? 'text-yellow-500' : 'text-blue-500') : p.color} />
                          <span className={`text-sm font-bold ${isSelected ? (isPremium ? 'text-yellow-400' : 'text-blue-400') : 'text-gray-300'}`}>
                            {p.name}
                          </span>
                        </div>
                        <div className={`text-sm font-black ${isSelected ? (isPremium ? 'text-yellow-400' : 'text-blue-400') : 'text-white'}`}>
                          {p.price}
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">{p.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Título do Anúncio</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full pl-4 pr-3 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/5 text-white placeholder-gray-500 transition-all text-sm outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Descrição Chamativa</label>
              <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full pl-4 pr-3 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/5 text-white placeholder-gray-500 transition-all text-sm outline-none resize-none"></textarea>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nicho</label>
                <div className="relative">
                  <select value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full pl-4 pr-3 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/5 text-white transition-all text-sm outline-none shadow-sm appearance-none">
                    {CATEGORIES.map(c => (
                      <option key={c.name} value={c.name} className="bg-[#0a0a0a]">{c.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              <PlatformSelect 
                selectedPlatform={platform} 
                onChange={(id) => setPlatform(id as PlatformType)} 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Link de Destino</label>
              <input required type="url" value={link} onChange={e => setLink(e.target.value)} className="w-full pl-4 pr-3 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/5 text-white placeholder-gray-500 transition-all text-sm outline-none" placeholder="https://chat.whatsapp.com/..." />
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-white/5 mt-6 !mb-0">
              {isConfirmingPublish ? (
                <>
                  <span className="text-sm text-yellow-400 self-center font-bold mr-2 tracking-tight">Confirmar publicação?</span>
                  <button type="button" onClick={() => setIsConfirmingPublish(false)} className="px-5 py-2.5 text-gray-300 hover:bg-white/10 hover:text-white font-medium rounded-xl transition-colors">
                    Não, Voltar
                  </button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] disabled:opacity-50 flex items-center transform hover:-translate-y-0.5">
                    {loading ? 'Processando...' : 'Sim, Confirmar e Publicar!'}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-300 hover:bg-white/10 hover:text-white font-medium rounded-xl transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] disabled:opacity-50 flex items-center transform hover:-translate-y-0.5">
                    {loading ? 'Processando...' : initialData ? 'Salvar Alterações' : 'Publicar Anúncio'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function PlatformSelect({ selectedPlatform, onChange }: { selectedPlatform: PlatformType, onChange: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = PLATFORMS.find(p => p.id === selectedPlatform) || PLATFORMS[0];

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-300 mb-2">Plataforma</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-4 pr-10 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/5 text-white transition-all text-sm outline-none shadow-sm cursor-pointer flex items-center gap-3 relative"
      >
        <PlatformIcon platform={selected.id} size={18} />
        <span>{selected.name}</span>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10 hidden sm:block" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-20 mt-2 w-full bg-[#121212] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-auto custom-scrollbar">
            {PLATFORMS.map(p => (
              <div 
                key={p.id}
                onClick={() => {
                  onChange(p.id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  selectedPlatform === p.id ? 'bg-indigo-500/20' : 'hover:bg-white/5'
                }`}
              >
                <PlatformIcon platform={p.id} size={18} />
                <span className={`text-sm ${selectedPlatform === p.id ? 'font-bold text-indigo-400' : 'text-gray-300'}`}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
