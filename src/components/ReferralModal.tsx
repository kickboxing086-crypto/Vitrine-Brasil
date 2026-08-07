import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Copy, Check, Lock, Unlock, Users, Award, 
  MessageCircle, Send, LogIn, Loader2, Share2, 
  ChevronRight, Gift, CheckCircle2, HelpCircle 
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot, writeBatch } from 'firebase/firestore';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export function ReferralModal({ isOpen, onClose, onLoginClick }: ReferralModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // States for Master Admin to customize code
  const [isEditingAdminCode, setIsEditingAdminCode] = useState(false);
  const [newAdminCode, setNewAdminCode] = useState('');
  const [updatingAdminCode, setUpdatingAdminCode] = useState(false);

  // Autofill pending referral code from invite links
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('pending_referral_code');
        if (stored) {
          setInviteCodeInput(stored);
        }
      } catch (err) {
        console.warn("Could not read pending referral code from localStorage:", err);
      }
    }
  }, [isOpen]);

  // Load and listen to user profile document in Firestore
  useEffect(() => {
    if (!auth.currentUser || !isOpen) {
      setProfile(null);
      return;
    }

    setLoadingProfile(true);
    const userRef = doc(db, 'users', auth.currentUser.uid);
    
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfile(data);
        if (data.referralCode) {
          setNewAdminCode(data.referralCode);
        }
      }
      setLoadingProfile(false);
    }, (error) => {
      console.error("Error loading referral profile:", error);
      setLoadingProfile(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser, isOpen]);

  if (!isOpen) return null;

  const currentEmail = auth.currentUser?.email || '';
  const currentUid = auth.currentUser?.uid || '';
  const isMasterAdmin = currentEmail.trim().toLowerCase() === 'elitestreambr1@gmail.com';

  const handleUpdateAdminCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    const trimmedCode = newAdminCode.trim().toUpperCase();
    if (!trimmedCode || trimmedCode.length !== 6) {
      setErrorMessage("O código deve ter exatamente 6 caracteres (letras e números).");
      return;
    }

    setUpdatingAdminCode(true);
    try {
      // Check if code is already taken by another user
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', trimmedCode));
      const querySnapshot = await getDocs(q);

      const takenByOther = querySnapshot.docs.some(d => d.id !== currentUid);
      if (takenByOther) {
        setErrorMessage("Este código já está sendo usado por outro usuário. Escolha outro.");
        setUpdatingAdminCode(false);
        return;
      }

      // Update in our document
      const userRef = doc(db, 'users', currentUid);
      await updateDoc(userRef, {
        referralCode: trimmedCode
      });

      setSuccessMessage(`Seu código de administrador foi atualizado com sucesso para: ${trimmedCode}`);
      setIsEditingAdminCode(false);
    } catch (err: any) {
      console.error("Error updating admin code:", err);
      setErrorMessage("Erro ao atualizar o código no banco de dados.");
    } finally {
      setUpdatingAdminCode(false);
    }
  };

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedCode = inviteCodeInput.trim().toUpperCase();

    if (!trimmedCode) {
      setErrorMessage('Por favor, digite um código de 6 caracteres.');
      return;
    }

    if (trimmedCode.length !== 6) {
      setErrorMessage('O código deve conter exatamente 6 caracteres.');
      return;
    }

    if (profile && profile.referralCode === trimmedCode) {
      setErrorMessage('Sistema de Segurança: Você não pode usar o seu próprio código de indicação.');
      return;
    }

    setValidatingCode(true);

    try {
      // Find user who owns this referralCode
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', trimmedCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErrorMessage('Esse código de convite não existe. Verifique se digitou corretamente.');
        setValidatingCode(false);
        return;
      }

      // Found the referrer!
      const referrerDoc = querySnapshot.docs[0];
      const referrerData = referrerDoc.data();
      const referrerId = referrerDoc.id;

      if (referrerId === currentUid) {
        setErrorMessage('Sistema de Segurança: Você não pode indicar a si mesmo.');
        setValidatingCode(false);
        return;
      }

      // Write updates atomically using batch
      const batch = writeBatch(db);

      // 1. Update Current User: unlockedSharing = true, referredBy = trimmedCode
      const currentUserRef = doc(db, 'users', currentUid);
      batch.update(currentUserRef, {
        referredBy: trimmedCode,
        unlockedSharing: true
      });

      // 2. Update Referrer: referralsCount = referralsCount + 1
      const referrerRef = doc(db, 'users', referrerId);
      const currentReferrals = referrerData.referralsCount || 0;
      batch.update(referrerRef, {
        referralsCount: currentReferrals + 1
      });

      await batch.commit();

      setSuccessMessage('Parabéns! Código validado com sucesso. Seus compartilhamentos foram liberados!');
      setInviteCodeInput('');
    } catch (err: any) {
      console.error("Error validating code:", err);
      setErrorMessage('Houve um erro de conexão ao validar o código. Tente de novo.');
    } finally {
      setValidatingCode(false);
    }
  };

  const getEffectiveCode = () => {
    if (isMasterAdmin) {
      return (profile?.referralCode && profile.referralCode !== 'PROMO1') ? profile.referralCode : 'SAM777';
    }
    return profile?.referralCode || 'PROMO1';
  };

  const getShareLink = () => {
    const code = getEffectiveCode();
    return `https://shre.ink/Impulsione-link-SITE?ref=${code}`;
  };

  const getShareText = () => {
    const code = getEffectiveCode();
    return `🤩 GANHE R$ 30,00 NO PIX AGORA MESMO APENAS SE CADASTRANDO! 💎👇

🔥 Descobri um segredo para faturar R$ 30,00 reais via Pix agora mesmo e o melhor: 100% GRATUITO! 🙀💸

Basta fazer o seu cadastro no Impulsione Link, o maior e mais completo portal de divulgação automática de links, canais de Telegram e grupos de WhatsApp do Brasil! 🇧🇷✨

Além de começar a receber milhares de cliques grátis nos seus próprios canais e divulgar seus links, você ganha R$ 30,00 de saldo oficial para se divertir e lucrar! 💰🚀

⚡ PASSO A PASSO MUITO FÁCIL:
1️⃣ Clique no link oficial abaixo e faça seu cadastro rápido:
🔗 ${getShareLink()}

2️⃣ Ative sua conta inserindo obrigatoriamente meu código exclusivo de ativação para liberar seu acesso e prêmios:
👉 Código: ${code}

3️⃣ Pronto! Conta liberada instantaneamente para começar a bombar as suas redes sociais e resgatar o pix de verdade! 📲🍿

⚠️ VAGAS DE ATIVAÇÃO LIMITADAS HOJE! Garanta o seu cadastro agora mesmo clicando no link antes que acabe:
👉 ${getShareLink()}`;
  };

  const copyRefCode = () => {
    const code = getEffectiveCode();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyShareText = () => {
    navigator.clipboard.writeText(getShareText());
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Social Share Channels
  const shareChannels = [
    {
      name: 'WhatsApp',
      icon: 'MessageCircle',
      color: 'bg-[#25D366] text-black hover:bg-[#20ba5a]',
      getHref: () => `https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText())}`
    },
    {
      name: 'Telegram',
      icon: 'Send',
      color: 'bg-[#0088cc] text-white hover:bg-[#0077b5]',
      getHref: () => `https://telegram.me/share/url?url=${encodeURIComponent(getShareLink())}&text=${encodeURIComponent(`Use meu código de convite: [ ${profile?.referralCode || ''} ] para liberar seu link!`)}`
    },
    {
      name: 'Twitter / X',
      icon: 'Share2',
      color: 'bg-black text-white border border-white/20 hover:bg-neutral-900',
      getHref: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}`
    },
    {
      name: 'Facebook',
      icon: 'Facebook',
      color: 'bg-[#1877F2] text-white hover:bg-[#166fe5]',
      getHref: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareLink())}`
    }
  ];

  const referralsCount = profile?.referralsCount || 0;
  const targetReached = referralsCount >= 15;
  const progressRatio = Math.min((referralsCount / 15) * 100, 100);

  // Message for Claiming R$30 Reward on Whatsapp
  const getRewardMessage = () => {
    const code = profile?.referralCode || '---';
    return `Olá Samuel! Concluí com sucesso a meta de 15 indicações recomendadas no site Impulsione Link! Gostaria de resgatar o prêmio especial de R$ 30,00 pix. Meu código de convite é [${code}] e meu e-mail de cadastro é ${currentEmail}.`;
  };

  const rewardWhatsappHref = `https://wa.me/5584999857391?text=${encodeURIComponent(getRewardMessage())}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay with animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-[#0b0b0d] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative z-10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]"
      >
        {/* Glow behind modal */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-2">
            <Gift className="text-cyan-400" size={18} />
            <h3 className="text-white font-black text-sm uppercase tracking-wider">
              Programa Indique & Ganhe
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-5 relative z-10 flex-grow space-y-5 pr-1">
          
          {!auth.currentUser ? (
            /* CASE 0: USER NOT LOGGED IN */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-cyan-400">
                <Lock size={24} />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-white font-bold text-base">Faça login para participar</h4>
                <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
                  Para gerar o seu código de convite, desbloquear os compartilhamentos e resgatar o prêmio de R$30, você precisa estar conectado.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onLoginClick();
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-200 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <LogIn size={14} className="mr-2" />
                Criar Conta ou Login
              </button>
            </div>
          ) : loadingProfile ? (
            /* LOADING STATE */
            <div className="text-center py-12">
              <Loader2 className="animate-spin text-cyan-400 mx-auto h-8 w-8 mb-2" />
              <p className="text-gray-400 text-xs font-semibold">Buscando sua conta...</p>
            </div>
          ) : (
            <>
              {profile && !profile.unlockedSharing && !isMasterAdmin ? (
                /* CASE 1: USER IS LOCKED - MUST REVEAL CODE FROM REFERRER */
                <div className="space-y-5 pt-1">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h4 className="text-amber-300 font-extrabold text-sm mb-1">Compartilhamento Bloqueado</h4>
                      <p className="text-gray-300 text-xs leading-relaxed font-semibold">
                        Para poder compartilhar o aplicativo e desbloquear o seu link de convite, você precisa primeiro ativar sua conta inserindo o código de convite de quem te indicou.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleValidateCode} className="space-y-4 bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                        Código de Convite do Indicador (6 dígitos)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          maxLength={6}
                          required
                          value={inviteCodeInput}
                          onChange={(e) => setInviteCodeInput(e.target.value)}
                          placeholder="Ex: ABC777"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold placeholder-gray-600 focus:ring-1 focus:ring-cyan-400 focus:outline-none uppercase text-center tracking-widest font-mono"
                        />
                        <button
                          type="submit"
                          disabled={validatingCode}
                          className="px-6 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {validatingCode ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              Validando...
                            </>
                          ) : (
                            'Validar'
                          )}
                        </button>
                      </div>
                    </div>

                    {errorMessage && (
                      <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                        ⚠️ {errorMessage}
                      </p>
                    )}
                  </form>

                  <div className="space-y-2 text-xs text-gray-500 leading-normal pl-2 font-medium">
                    <p>💡 Como funciona o fluxo?</p>
                    <p>1. Peça o código ao amigo que te apresentou o app.</p>
                    <p>2. Ao inserir, você libera sua conta para compartilhar.</p>
                    <p>3. Você ganha seu próprio código e, convidando 15 novos usuários através dele, poderá resgatar R$ 30,00 no WhatsApp.</p>
                  </div>
                </div>
              ) : (
            /* CASE 2: USER UNLOCKED (OR MASTER ADMIN) */
            <div className="space-y-6">
              {/* Success Alert if just activated */}
              {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-4 flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <p className="text-xs font-extrabold">{successMessage}</p>
                </div>
              )}

              {/* Invitation Code Banner */}
              <div className="bg-gradient-to-br from-indigo-950/40 via-black to-purple-950/20 border border-white/10 rounded-2xl p-5 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 blur-xl rounded-full" />
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  {isMasterAdmin ? 'Código Admin Semente' : 'Seu Código de Convite'}
                </span>
                
                {!isEditingAdminCode ? (
                  <div className="flex items-center justify-center gap-3 my-4">
                    <span className="text-white text-3xl font-black font-mono tracking-widest pl-2">
                      {getEffectiveCode()}
                    </span>
                    <button
                      onClick={copyRefCode}
                      className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/5 transition-all active:scale-95 cursor-pointer"
                      title="Copiar Código"
                    >
                      {copiedCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                    {isMasterAdmin && (
                      <button
                        onClick={() => {
                          setNewAdminCode(profile?.referralCode || 'SAM777');
                          setIsEditingAdminCode(true);
                        }}
                        className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl text-[10px] font-black uppercase px-2.5 py-1.5 cursor-pointer transition-colors"
                      >
                        Mudar
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleUpdateAdminCode} className="my-4 max-w-xs mx-auto space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        maxLength={6}
                        required
                        value={newAdminCode}
                        onChange={(e) => setNewAdminCode(e.target.value)}
                        placeholder="Ex: SAM777"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-bold placeholder-gray-600 focus:ring-1 focus:ring-cyan-400 focus:outline-none uppercase text-center tracking-widest font-mono"
                      />
                      <button
                        type="submit"
                        disabled={updatingAdminCode}
                        className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-black rounded-xl text-xs uppercase cursor-pointer"
                      >
                        {updatingAdminCode ? '...' : 'Salvar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingAdminCode(false)}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs uppercase cursor-pointer"
                      >
                        Canc.
                      </button>
                    </div>
                  </form>
                )}

                <p className="text-gray-400 text-xs font-semibold leading-relaxed max-w-sm mx-auto">
                  {isMasterAdmin 
                    ? 'Este é o seu código semente. Divulgue-o para iniciar a rede de compartilhamento e impulsionar o aplicativo!' 
                    : 'Compartilhe seu código com conhecidos. Toda conta criada que inserir seu código desbloqueia o compartilhamento deles e acumula para sua meta!'}
                </p>
              </div>

              {/* Admin vs User Progress Tracking */}
              {isMasterAdmin ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
                  <span className="text-xs text-indigo-400 font-bold block mb-1">👑 Você é o Administrador Master</span>
                  <p className="text-gray-400 text-xs font-medium">As indicações começam através de você de forma automática. Você pode distribuir sua chave sem limites!</p>
                </div>
              ) : (
                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5 space-y-4">
                  {/* Stats line */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="text-cyan-400" size={16} />
                      <span className="text-xs font-extrabold text-white uppercase tracking-wider">Indicações Concluídas</span>
                    </div>
                    <span className="bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-black text-xs px-2.5 py-0.5 rounded-full">
                      {referralsCount} / 15
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-white/5 h-2.5 border border-white/10 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressRatio}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                      <span>Começo</span>
                      <span>Meta: 15 cadastros</span>
                    </div>
                  </div>

                  {/* Reward Action Box */}
                  {targetReached ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-3.5 text-center shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    >
                      <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                        <Award size={20} className="stroke-[2.5]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-white text-sm font-black">Meta de 15 Alcançada!</h4>
                        <p className="text-gray-400 text-xs font-semibold leading-relaxed">
                          Sua recompensa de <strong className="text-emerald-400 text-sm">R$ 30,00</strong> está disponível! Clique no link abaixo para falar com o Samuel pelo WhatsApp oficial e retirar seu pix imediato.
                        </p>
                      </div>
                      <a
                        href={rewardWhatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 items-center justify-center gap-2 cursor-pointer border border-emerald-400/20 select-none hover:-translate-y-0.5 transition-transform"
                      >
                        <MessageCircle size={15} />
                        Solicitar R$ 30,00 no Whats
                      </a>
                    </motion.div>
                  ) : (
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center text-xs text-gray-400 font-semibold leading-relaxed">
                      🎁 Indique mais <strong className="text-white">{15 - referralsCount} amigos</strong> para liberar o saque de <strong className="text-cyan-400">R$ 30,00</strong> via Pix direto!
                    </div>
                  )}
                </div>
              )}

              {/* Standard Sharing Component */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:via-indigo-600 hover:to-purple-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                  <Share2 size={15} />
                  {showShareOptions ? 'Fechar Detalhes de Redes Sociais' : 'Compartilhar Aplicativo'}
                </button>

                <AnimatePresence>
                  {showShareOptions && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-4"
                    >
                      {/* Social Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {shareChannels.map((channel) => {
                          let IconComp = Share2;
                          if (channel.name === 'WhatsApp') IconComp = MessageCircle;
                          else if (channel.name === 'Telegram') IconComp = Send;
                          
                          return (
                            <a
                              key={channel.name}
                              href={channel.getHref()}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all relative ${channel.color} cursor-pointer shadow-sm`}
                            >
                              <IconComp size={15} className="shrink-0" />
                              <span>{channel.name}</span>
                            </a>
                          );
                        })}
                      </div>

                      {/* Manual text share container */}
                      <div className="bg-[#121215] border border-white/5 rounded-xl p-4 space-y-3">
                        <span className="block text-[10px] text-gray-500 font-black uppercase tracking-wider pl-0.5">Mensagem Pronta de Indicação</span>
                        <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-xs text-gray-400 font-medium leading-relaxed font-sans max-h-24 overflow-y-auto select-all">
                          {getShareText()}
                        </div>
                        <button
                          onClick={copyShareText}
                          className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {copiedShare ? (
                            <>
                              <CheckCircle2 size={13} className="text-emerald-400" />
                              Mensagem Copiada!
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              Copiar Mensagem Inteira
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </>
      )}

        </div>
      </motion.div>
    </div>
  );
}
