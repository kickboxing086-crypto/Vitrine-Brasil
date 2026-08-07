import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Users, ExternalLink, Trash2, Crown, Clock, X, Check } from 'lucide-react';
import { Listing, PLATFORMS } from '../data';
import { useListings } from '../hooks/useListings';
import { PlatformIcon } from './PlatformIcon';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ListingCardProps {
  listing: Listing;
  currentUserId?: string | null;
}

export function ListingCard({ listing, currentUserId }: ListingCardProps) {
  const { removeListing } = useListings();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!listing.expiresAt) return;
    
    const calculateTimeLeft = () => {
      let expiryTime: number;
      if (typeof listing.expiresAt === 'object' && 'toMillis' in listing.expiresAt) {
        expiryTime = listing.expiresAt.toMillis();
      } else if (listing.expiresAt instanceof Date) {
        expiryTime = listing.expiresAt.getTime();
      } else {
        expiryTime = new Date(listing.expiresAt).getTime();
      }

      const now = new Date().getTime();
      const difference = expiryTime - now;

      if (difference <= 0) {
        setTimeLeft('Expirado');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      if (hours > 0 || days > 0) timeString += `${hours}h `;
      if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `;
      timeString += `${seconds}s`;

      setTimeLeft(timeString);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [listing.expiresAt]);

  const isOwner = !!currentUserId; // Todo usuário logado (admin) pode deletar

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await removeListing(listing.id);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmingDelete(false);
  };

  const handleVisit = (e: React.MouseEvent<HTMLAnchorElement>) => {
    updateDoc(doc(db, 'listings', listing.id), {
      clicks: increment(1)
    }).catch(error => console.error('Erro ao incrementar clique:', error));
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'ouro':
        return { label: 'MENSAL', color: 'bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)] border-yellow-400' };
      case 'prata':
        return { label: 'SEMANAL', color: 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-400' };
      case 'diamante':
        return { label: 'DIAMANTE', color: 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border-purple-400' };
      default:
        return null;
    }
  };

  const planBadge = getPlanBadge(listing.plan || 'bronze');

  const platformInfo = PLATFORMS.find(p => p.id === (listing.platform || 'whatsapp'));

  return (
    <div className={`group bg-white/5 rounded-2xl overflow-hidden transition-all duration-300 border flex flex-col h-full relative hover:-translate-y-1 backdrop-blur-sm ${planBadge ? 'border-indigo-500/30 shadow-[0_10px_30px_rgba(99,102,241,0.1)]' : 'border-white/5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]'}`}>
      {isOwner && (
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          {isConfirmingDelete ? (
            <div className="flex bg-black/60 backdrop-blur-md rounded-full border border-red-500/30 overflow-hidden shadow-lg shadow-red-500/10">
              <button 
                onClick={handleCancelDelete}
                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Cancelar"
              >
                <X size={14} />
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 transition-colors"
                title="Confirmar Exclusão"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleDeleteClick}
              className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-md text-white hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg border border-white/10"
              title="Excluir"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
      
      <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {platformInfo && (
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 bg-white`}>
                <PlatformIcon platform={platformInfo.id} size={32} />
              </div>
            )}
            <div>
               <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">{listing.title}</h3>
               <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{listing.category}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-3">
          {planBadge && (
            <span className={`self-start inline-flex px-2.5 py-0.5 text-[10px] font-black rounded-full border items-center gap-1 uppercase tracking-widest ${planBadge.color}`}>
              <Crown size={12} />
              {planBadge.label}
            </span>
          )}
          {timeLeft && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium bg-white/5 self-start px-2 py-1 rounded-md border border-white/5">
              <Clock size={12} className="text-gray-500" />
              {timeLeft === 'Expirado' ? (
                <span className="text-red-400">Anúncio Expirado</span>
              ) : (
                <span>Expira em: <span className="font-bold text-gray-300" key={timeLeft}>{timeLeft}</span></span>
              )}
            </div>
          )}
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow font-medium leading-relaxed">
          {listing.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/10">
          <a 
            href={listing.link} 
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleVisit}
            className="flex items-center justify-between w-full group/link"
            aria-label={`Acessar ${listing.title}`}
          >
            <div className="flex items-center text-cyan-400 text-sm font-bold bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)] group-hover/link:bg-indigo-500/20 transition-colors">
              Visitar
            </div>
            
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-xl text-white transition-all group-hover/link:scale-110 shadow-lg ${platformInfo ? platformInfo.color : 'bg-indigo-500 group-hover/link:bg-indigo-600'}`}
            >
              <ExternalLink size={18} />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
