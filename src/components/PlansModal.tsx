import React, { useState } from 'react';
import { X, Send, Crown, Check, ShieldCheck, User, Link as LinkIcon, Phone, Layers, Flame, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, PLATFORMS, Category, PlatformType } from '../data';
import { PlatformIcon } from './PlatformIcon';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings?: any[];
  onLoginClick?: () => void;
}

const PLANS = [
  {
    id: 'bronze',
    name: 'Plano Grátis',
    duration: '24 Horas',
    price: 'R$ 0,00',
    description: 'Divulgação básica no feed por 24 horas. Válido 1x por cliente.',
    badge: 'Uso Único (1x)',
    highlight: false,
    notice: 'Permitido apenas 1 uso por anunciante.',
  },
  {
    id: 'prata',
    name: 'Plano Semanal',
    duration: '7 Dias',
    price: 'R$ 9,99',
    description: '7 dias de destaque contínuo no topo do feed.',
    badge: 'Destaque Rápido',
    highlight: false,
  },
  {
    id: 'ouro',
    name: 'Plano Mensal',
    duration: '30 Dias',
    price: 'R$ 19,99',
    description: '30 dias em destaque + Selo de Verificado + Bônus de cliques.',
    badge: 'Mais Popular',
    highlight: true,
  },
  {
    id: 'diamante',
    name: 'Plano Diamante',
    duration: '60 Dias',
    price: 'R$ 44,99',
    description: '60 dias de exposição máxima em todas as categorias.',
    badge: 'Máximo Alcance',
    highlight: false,
  },
];

export function PlansModal({ isOpen, onClose }: PlansModalProps) {
  const [clientName, setClientName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('Networking');
  const [formPlatform, setFormPlatform] = useState<PlatformType>('whatsapp');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('ouro');
  const [formDescription, setFormDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmitToWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert('Por favor, informe o seu Nome ou Nome da sua Empresa.');
      return;
    }
    if (!formTitle.trim()) {
      alert('Por favor, informe o Título do seu canal, grupo ou link.');
      return;
    }
    if (!formLink.trim()) {
      alert('Por favor, informe o Link de acesso (Ex: https://chat.whatsapp.com/... ou seu site).');
      return;
    }

    if (!formLink.startsWith('http://') && !formLink.startsWith('https://')) {
      alert('O link deve iniciar com http:// ou https://');
      return;
    }

    const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[2];
    const platformObj = PLATFORMS.find((p) => p.id === formPlatform);
    const platformLabel = platformObj ? platformObj.name : formPlatform;

    setIsSubmitting(true);

    // Save lead to Firestore in background
    try {
      await addDoc(collection(db, 'listings'), {
        title: formTitle,
        link: formLink,
        category: formCategory,
        platform: formPlatform,
        description: formDescription || '',
        plan: selectedPlanId,
        status: 'pending',
        clicks: 0,
        memberCount: 0,
        userName: clientName,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Silent notice: Lead logged via WhatsApp directly:', err);
    }

    // Format WhatsApp message cleanly (Destination phone hidden from UI)
    const whatsappPhone = '5584986113980';
    const messageText = `*SOLICITAÇÃO DE DIVULGAÇÃO - VITRINE BRASIL* 🚀

👤 *Nome do Anunciante:* ${clientName.trim()}
📌 *Título do Anúncio:* ${formTitle.trim()}
📱 *Plataforma:* ${platformLabel}
📂 *Categoria:* ${formCategory}
💎 *Plano Escolhido:* ${selectedPlan.name} (${selectedPlan.price} / ${selectedPlan.duration})
🔗 *Link para Divulgar:* ${formLink.trim()}
📝 *Descrição:* ${formDescription.trim() || 'Sem observações'}

Olá, Assessoria Vitrine Brasil! Preenchi os dados do meu link acima e gostaria de publicar minha divulgação!`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(messageText)}`;

    window.open(whatsappUrl, '_blank');
    setIsSubmitting(false);
    onClose();
  };

  const directWhatsAppContact = () => {
    const whatsappPhone = '5584986113980';
    const messageText = `Olá, Assessoria Vitrine Brasil! Gostaria de tirar dúvidas sobre como divulgar meu link na plataforma.`;
    window.open(`https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(messageText)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-[#0a0a0f] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] w-full max-w-3xl my-auto relative z-10 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Crown size={20} />
              </div>
              <div>
                <h2 className="text-white font-extrabold text-lg sm:text-xl tracking-tight">
                  Divulgar no Vitrine Brasil
                </h2>
                <p className="text-gray-400 text-xs font-medium">
                  Preencha os dados e envie direto para nossa equipe de assessoria
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            <form onSubmit={handleSubmitToWhatsApp} className="space-y-6">
              
              {/* Step 1: Customer & Title Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <User size={14} /> 1. Seus Dados e Título do Anúncio
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Seu Nome / Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Samuel Silva"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Título do Grupo / Canal / Site *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Grupo de Ofertas e Network VIP"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Custom Platform & Category Selectors */}
              <div className="space-y-5 pt-2 border-t border-white/5">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <LinkIcon size={14} /> 2. Plataforma, Categoria e Link
                </h3>

                {/* Platform Picker */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">
                    Selecione a Plataforma:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PLATFORMS.map((platform) => {
                      const isSelected = formPlatform === platform.id;
                      return (
                        <button
                          type="button"
                          key={platform.id}
                          onClick={() => setFormPlatform(platform.id as PlatformType)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                              : 'bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/[0.07] hover:text-gray-200'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-black/40 shrink-0">
                            <PlatformIcon platform={platform.id} size={16} />
                          </div>
                          <span className="truncate">{platform.name}</span>
                          {isSelected && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category Picker */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">
                    Selecione a Categoria:
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-white/[0.02] border border-white/10 rounded-xl custom-scrollbar">
                    {CATEGORIES.map((category) => {
                      const isSelected = formCategory === category.name;
                      return (
                        <button
                          type="button"
                          key={category.name}
                          onClick={() => setFormCategory(category.name as Category)}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600/80 border-purple-400 text-white font-bold'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {isSelected ? <Check size={12} className="text-purple-300 stroke-[3]" /> : <Layers size={12} className="text-gray-400" />}
                          {category.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Link Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Link do Canal, Grupo ou Site (URL completa) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="Ex: https://chat.whatsapp.com/seu-grupo"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              {/* Step 3: Plan Selection */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Crown size={14} /> 3. Selecione o Plano de Divulgação
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PLANS.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                            : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                        }`}
                      >
                        {plan.badge && (
                          <span className={`absolute top-2.5 right-2.5 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                            plan.id === 'bronze'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : plan.highlight 
                                ? 'bg-cyan-400 text-black' 
                                : 'bg-white/10 text-gray-300'
                          }`}>
                            {plan.badge}
                          </span>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-gray-500'
                            }`}>
                              {isSelected && <Check size={10} className="text-black stroke-[3]" />}
                            </div>
                            <h4 className="text-white font-extrabold text-sm">{plan.name}</h4>
                          </div>

                          <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-xl font-black text-white">{plan.price}</span>
                            <span className="text-xs text-gray-400 font-semibold">/ {plan.duration}</span>
                          </div>

                          <p className="text-xs text-gray-400 mt-1 leading-snug">
                            {plan.description}
                          </p>

                          {plan.notice && (
                            <div className="mt-2 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md flex items-center gap-1">
                              <AlertTriangle size={12} className="shrink-0 text-amber-400" />
                              <span>{plan.notice}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedPlanId === 'bronze' && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-300 text-xs font-semibold flex items-start gap-2.5">
                    <AlertTriangle size={16} className="shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-200 uppercase tracking-wide text-[11px]">Aviso sobre o Plano Grátis:</span>
                      <p className="text-[11px] text-amber-300/90 mt-0.5 leading-relaxed">
                        O teste gratuito é permitido <strong>somente uma única vez por anunciante</strong> para você experimentar a plataforma. Para divulgações contínuas, recomendamos os planos de 7, 30 ou 60 dias.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 4: Description */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="block text-xs font-bold text-gray-300">
                  Descrição Curta ou Observações (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva sobre o seu grupo ou negócio para atrair mais participantes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 px-6 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Send size={18} className="fill-black" />
                  Enviar para a Assessoria no WhatsApp
                </button>

                <button
                  type="button"
                  onClick={directWhatsAppContact}
                  className="px-5 py-4 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone size={15} className="text-emerald-400" />
                  Atendimento Direto
                </button>
              </div>

              <div className="text-center pt-1">
                <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Atendimento seguro e suporte oficial via Assessoria WhatsApp
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
