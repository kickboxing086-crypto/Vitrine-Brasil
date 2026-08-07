import React from 'react';
import { ArrowRight, Trophy, ShieldCheck, Users, HelpCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  onAddClick?: () => void;
  onAdvertiseClick?: () => void;
  listings?: any[];
}

export function Hero({ isAuthenticated, isAdmin, onAddClick, onAdvertiseClick }: HeroProps) {
  return (
    <div className="relative bg-[#030303] overflow-hidden border-b border-white/10 text-white min-h-[92vh] flex items-center justify-center">
      
      {/* Absolute shapes for depth - clean, non-glittery */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-16 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-5xl mx-auto"
        >
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Trophy size={14} className="text-cyan-400" />
            Vitrine Brasil &bull; Sistema de Divulgação de Links
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-4 leading-[1.08]">
            Encontre os melhores{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
              grupos e links
            </span>
            {' '}em um só lugar
          </h1>
          
          <p className="mt-4 text-base sm:text-lg text-gray-400 mx-auto max-w-2xl leading-relaxed">
            Descubra canais, grupos, comunidades e negócios organizados por categorias. Divulgue seu link para alcançar milhares de acessos diretos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button 
              onClick={(isAuthenticated && isAdmin) ? onAddClick : onAdvertiseClick}
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold rounded-xl text-black bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer max-w-sm mx-auto sm:mx-0 uppercase tracking-wider"
            >
              <Trophy size={16} className="mr-2 text-black" />
              Divulgar meu link
            </button>
            
            <a 
              href="#explorar"
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold rounded-xl text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Explorar Categorias
              <ArrowRight size={16} className="ml-2 text-gray-400" />
            </a>
          </div>

          {/* High Trust Floating Elements Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-6 border-t border-white/5 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
              <ShieldCheck className="text-gray-400 shrink-0" size={15} />
              <span>Conexão Segura SSL</span>
            </div>
            <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
              <Users className="text-gray-400 shrink-0" size={15} />
              <span>Cliques Reais</span>
            </div>
            <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
              <ShieldCheck className="text-gray-400 shrink-0" size={15} />
              <span>Checkout Certificado</span>
            </div>
            <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
              <HelpCircle className="text-gray-400 shrink-0" size={15} />
              <span>Atendimento Direto</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
