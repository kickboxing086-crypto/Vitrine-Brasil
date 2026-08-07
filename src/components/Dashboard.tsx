import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useListings } from '../hooks/useListings';
import { MousePointerClick, TrendingUp, Users, Activity, Crown, Trash2, CalendarClock, RefreshCw, Check, MessageSquare, Search, ShieldAlert, KeyRound, Mail, Send, Copy, ExternalLink, X } from 'lucide-react';
import { PLATFORMS } from '../data';
import { doc, deleteDoc, updateDoc, collection, query, onSnapshot } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { PlatformIcon } from './PlatformIcon';

export function Dashboard() {
  const { user } = useAuth();
  const { listings } = useListings();

  const [activeTab, setActiveTab] = useState<'listings' | 'customers'>('listings');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // WhatsApp Notification Modal State
  const [notifyModalListing, setNotifyModalListing] = useState<any | null>(null);
  const [notifyPhone, setNotifyPhone] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList: any[] = [];
      snapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);
      setLoadingUsers(false);
    }, (err) => {
      console.error("Error loading users:", err);
      setLoadingUsers(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePasswordReset = async (email: string) => {
    if (!email) return;
    if (window.confirm(`Gostaria de enviar um e-mail de recuperação de senha oficial para o endereço: ${email}?`)) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert(`Link de recuperação oficial enviado com sucesso para ${email}!`);
      } catch (error: any) {
        console.error("Erro ao enviar e-mail de recuperação de senha:", error);
        alert(`Erro ao iniciar recuperação de login: ${error.message}`);
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.email || '').toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q)
    );
  });

  const isListingExpired = (listing: any) => {
    if (!listing.expiresAt) return false;
    let expiryTime: number;
    if (typeof listing.expiresAt === 'object' && 'toMillis' in listing.expiresAt) {
      expiryTime = listing.expiresAt.toMillis();
    } else if (listing.expiresAt instanceof Date) {
      expiryTime = listing.expiresAt.getTime();
    } else {
      expiryTime = new Date(listing.expiresAt).getTime();
    }
    return expiryTime <= Date.now();
  };

  const pendingListings = listings.filter(l => l.status === 'pending');
  const approvedListings = listings.filter(l => l.status !== 'pending');

  const activeListingsFiltered = approvedListings.filter(l => !isListingExpired(l));
  const expiredListingsFiltered = approvedListings.filter(l => isListingExpired(l));

  const totalClicks = listings.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const activeCount = activeListingsFiltered.length;
  const expiredCount = expiredListingsFiltered.length;

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este anúncio?')) {
      try {
        await deleteDoc(doc(db, 'listings', id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  const handleApprove = async (listing: any) => {
    let daysToAdd = 30;
    if (listing.plan === 'bronze') daysToAdd = 1;
    if (listing.plan === 'prata') daysToAdd = 7;
    if (listing.plan === 'ouro') daysToAdd = 30;
    if (listing.plan === 'diamante') daysToAdd = 60;

    if (window.confirm(`Gostaria de aprovar e ativar este anúncio por ${daysToAdd} dias no plano (${listing.plan || 'Grátis'})?`)) {
      try {
        const now = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + daysToAdd);

        await updateDoc(doc(db, 'listings', listing.id), {
          status: 'approved',
          expiresAt: expiresAt,
          updatedAt: now
        });

        // Open WhatsApp notification modal for this listing
        openNotifyModal(listing);
      } catch (error) {
        console.error('Erro ao aprovar:', error);
        alert('Erro ao aprovar anúncio.');
      }
    }
  };

  const openNotifyModal = (listing: any) => {
    setNotifyModalListing(listing);
    setNotifyPhone(listing.phoneNumber || '');
    setCopiedText(false);
  };

  const generateWhatsAppMessage = (listing: any) => {
    const siteUrl = window.location.origin;
    const clientNameStr = listing.userName ? ` *${listing.userName}*` : '';

    return `🎉 *SEU ANÚNCIO ESTÁ NO AR NO VITRINE BRASIL!* 🚀

Olá${clientNameStr}!

Temos o prazer de informar que o seu anúncio *"${listing.title}"* foi aprovado e já está publicado na nossa plataforma!

🔗 *Acesse a plataforma para ver seu link disponível ao vivo:*
${siteUrl}

Agradecemos pela preferência e desejamos excelentes resultados!
_Atenciosamente, Equipe Vitrine Brasil._`;
  };

  const handleSendWhatsAppNotification = () => {
    if (!notifyModalListing) return;
    const cleanPhone = notifyPhone.replace(/\D/g, '');
    const message = generateWhatsAppMessage(notifyModalListing);

    if (!cleanPhone) {
      alert('Por favor, informe o número de WhatsApp do cliente com DDD (Ex: 84988887777).');
      return;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyNotificationText = () => {
    if (!notifyModalListing) return;
    const message = generateWhatsAppMessage(notifyModalListing);
    navigator.clipboard.writeText(message);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleRenew = async (id: string, plan: string) => {
    let daysToAdd = 30;
    if (plan === 'bronze') daysToAdd = 1;
    if (plan === 'prata') daysToAdd = 7;
    if (plan === 'ouro') daysToAdd = 30;

    if (window.confirm(`Gostaria de estender este anúncio por mais ${daysToAdd} dias no plano (${plan})?`)) {
      try {
        const now = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + daysToAdd);

        await updateDoc(doc(db, 'listings', id), {
          expiresAt,
          updatedAt: now
        });
        alert('Anúncio renovado com sucesso!');
      } catch (error) {
        console.error('Erro ao renovar:', error);
        alert('Erro ao renovar anúncio.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2">Painel de Controle Staff</h1>
        <p className="text-gray-400">Acompanhe e gerencie anúncios, aprovações e notificações para clientes do Vitrine Brasil.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-white/10 gap-8 mb-10">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-4 text-sm font-black uppercase tracking-wider transition-all relative cursor-pointer ${
            activeTab === 'listings' 
              ? 'text-cyan-400 border-b-2 border-cyan-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Anúncios e Vitrine
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-4 text-sm font-black uppercase tracking-wider transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'customers' 
              ? 'text-cyan-400 border-b-2 border-cyan-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Painel de Clientes
        </button>
      </div>

      {activeTab === 'listings' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium">Total de Acessos</h3>
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <MousePointerClick className="text-indigo-500" size={20} />
                </div>
              </div>
              <p className="text-4xl font-black text-white">{totalClicks}</p>
              <p className="text-sm text-indigo-400 mt-2 flex items-center gap-1 font-medium">
                <TrendingUp size={14} /> cliques acumulados
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium">Anúncios Ativos</h3>
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Activity className="text-emerald-500" size={20} />
                </div>
              </div>
              <p className="text-4xl font-black text-white">{activeCount}</p>
              <p className="text-sm text-emerald-400 mt-2 font-medium">Atualmente rodando ao vivo</p>
            </div>

            <div className="bg-[#1a0f12] border border-rose-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 blur-2xl rounded-full" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-rose-300 font-medium">Links Expirados</h3>
                <div className="p-2 bg-rose-500/20 rounded-lg">
                  <CalendarClock className="text-rose-500" size={20} />
                </div>
              </div>
              <p className="text-4xl font-black text-rose-400">{expiredCount}</p>
              <p className="text-sm text-rose-500 mt-2 font-medium">Aguardando renovação do cliente</p>
            </div>
          </div>

          {/* SEÇÃO DE LINKS PENDENTES DE APROVAÇÃO */}
          {pendingListings.length > 0 && (
            <div className="mb-12 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-yellow-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping shrink-0" />
                <h2 className="text-xl font-black text-white">
                  Aguardando Confirmação / Pagamento (<span key={pendingListings.length}>{pendingListings.length}</span>)
                </h2>
                <span className="text-[10px] bg-yellow-400 text-yellow-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Ação Necessária
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingListings.map(listing => {
                  const platform = PLATFORMS.find(p => p.id === listing.platform);
                  const zapLink = listing.phoneNumber 
                    ? `https://wa.me/${listing.phoneNumber.replace(/\D/g, '')}`
                    : null;

                  return (
                    <div 
                      key={listing.id} 
                      className="bg-[#111] border border-white/10 rounded-xl p-5 hover:border-yellow-500/40 hover:bg-[#151515] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[9px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                            Plano: {(listing.plan || 'bronze').toUpperCase()}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <PlatformIcon platform={listing.platform} size={14} />
                            <span className="text-[10px] text-gray-400 font-semibold">{platform?.name}</span>
                          </div>
                        </div>

                        <h4 className="text-white font-black text-base truncate mb-1" title={listing.title}>
                          {listing.title}
                        </h4>
                        
                        <a 
                          href={listing.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-indigo-400 hover:underline truncate block mb-3 font-medium select-all"
                        >
                          {listing.link}
                        </a>

                        {listing.description && (
                          <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2 bg-white/5 p-2.5 rounded-lg border border-white/5 mb-4">
                            💡 {listing.description}
                          </p>
                        )}

                        {/* Customer info */}
                        <div className="mt-2 pt-3 border-t border-white/5 space-y-1 text-xs">
                          {listing.userName && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Nome:</span>
                              <span className="text-gray-300 font-bold">{listing.userName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-white/5 flex gap-2">
                        <button
                          onClick={() => handleApprove(listing)}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Check size={14} className="stroke-[3]" />
                          Aprovar & Publicar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6">Controle de Anúncios Publicados</h2>
            
            {approvedListings.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400">Você ainda não tem nenhum anúncio aprovado ou ativo.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-sm">
                      <th className="pb-4 font-medium pl-4">Anúncio</th>
                      <th className="pb-4 font-medium px-4">Plataforma</th>
                      <th className="pb-4 font-medium px-4">Plano</th>
                      <th className="pb-4 font-medium px-4">Status</th>
                      <th className="pb-4 font-medium px-4">Acessos</th>
                      <th className="pb-4 font-medium pr-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedListings.map(listing => {
                      const platform = PLATFORMS.find(p => p.id === listing.platform);
                      const isExpired = isListingExpired(listing);
                      return (
                        <tr key={listing.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 pl-4">
                            <div className="font-bold text-white truncate max-w-[220px]">{listing.title}</div>
                            <div className="text-xs text-gray-400 truncate max-w-[220px] mt-0.5">{listing.link}</div>
                            {listing.userName && (
                              <div className="text-[10px] text-cyan-300 font-semibold mt-1">
                                Anunciante: {listing.userName}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <PlatformIcon platform={listing.platform} size={16} />
                              <span className="text-sm text-gray-300">{platform?.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 border border-white/10 px-2 py-1 rounded-md">
                              {listing.plan || 'bronze'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                Expirado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Ativo
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                              <MousePointerClick size={14} />
                              {listing.clicks || 0}
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openNotifyModal(listing)}
                                title="Notificar Cliente no WhatsApp"
                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black rounded-lg transition-colors border border-emerald-500/20 cursor-pointer flex items-center justify-center font-bold text-xs gap-1"
                              >
                                <MessageSquare size={14} />
                                <span className="hidden sm:inline">Notificar Whats</span>
                              </button>

                              <button
                                onClick={() => handleRenew(listing.id, listing.plan || 'bronze')}
                                title="Renovar Plano / Estender Anúncio"
                                className="p-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-yellow-950 rounded-lg transition-colors border border-yellow-500/20 cursor-pointer flex items-center justify-center"
                              >
                                <RefreshCw size={14} />
                              </button>
                              
                              <button 
                                onClick={() => handleDelete(listing.id)}
                                title="Excluir Anúncio"
                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20 cursor-pointer flex items-center justify-center"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
              <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Total de Registros</h3>
              <div className="text-4xl font-black text-white">{users.length}</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
              <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">Usuários Ativos</h3>
              <div className="text-4xl font-black text-emerald-400">{users.length}</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Base de Clientes</h2>
              </div>

              <div className="relative max-w-sm w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={14} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Filtrar por e-mail ou nome..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-white/10 rounded-xl bg-black/40 text-white placeholder-gray-500 text-xs outline-none focus:border-cyan-400 transition-all font-medium"
                />
              </div>
            </div>

            {loadingUsers ? (
              <div className="text-center py-12 text-gray-500">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-indigo-500" />
                Carregando registros...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs border border-dashed border-white/5 rounded-xl bg-black/20">
                Nenhum usuário correspondente encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 font-bold">
                      <th className="pb-3 pl-4">Cliente / E-mail</th>
                      <th className="pb-3 pr-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 pl-4">
                          <div className="font-extrabold text-white text-sm">
                            {u.displayName || 'Cliente'}
                          </div>
                          <div className="text-xs text-indigo-300 mt-0.5 select-all font-mono font-bold flex items-center gap-1">
                            <Mail size={11} className="text-gray-500" />
                            {u.email}
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <button
                            onClick={() => handlePasswordReset(u.email)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white font-extrabold uppercase text-[10px] tracking-wider rounded-lg border border-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                          >
                            Recuperar Acesso
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WHATSAPP NOTIFICATION MODAL */}
      {notifyModalListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setNotifyModalListing(null)} />
          
          <div className="bg-[#09090e] border border-emerald-500/30 rounded-3xl shadow-[0_25px_60px_rgba(16,185,129,0.2)] w-full max-w-lg overflow-hidden flex flex-col relative z-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-base">
                    Notificar Cliente no WhatsApp
                  </h3>
                  <p className="text-gray-400 text-xs">
                    Informa que o anúncio já está disponível na plataforma
                  </p>
                </div>
              </div>

              <button
                onClick={() => setNotifyModalListing(null)}
                className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Número de WhatsApp do Cliente (com DDD)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 84988887777"
                  value={notifyPhone}
                  onChange={(e) => setNotifyPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Mensagem a ser enviada:
                  </label>
                  <button
                    onClick={handleCopyNotificationText}
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={12} />
                    {copiedText ? 'Copiado!' : 'Copiar Texto'}
                  </button>
                </div>

                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl text-gray-300 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto custom-scrollbar select-all">
                  {generateWhatsAppMessage(notifyModalListing)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSendWhatsAppNotification}
                  className="flex-1 py-3.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Send size={16} className="fill-black" />
                  Abrir e Enviar no WhatsApp
                </button>

                <button
                  onClick={() => setNotifyModalListing(null)}
                  className="px-4 py-3.5 bg-white/5 hover:bg-white/10 text-gray-400 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
