import React, { useState } from 'react';
import { X, Lock, Mail, Key } from 'lucide-react';
import { loginWithEmail } from '../lib/firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleMessage?: string;
}

export function AdminLoginModal({ isOpen, onClose, titleMessage }: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginWithEmail(email.trim(), password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-[#050505] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] w-full max-w-md overflow-hidden flex flex-col relative z-10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-white font-extrabold text-base tracking-tight">
            <Lock size={18} className="text-cyan-400" />
            Acesso Restrito - Staff / Painel
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6">
          {titleMessage && (
            <div className="mb-4 p-3 bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold rounded-xl leading-relaxed">
              {titleMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                E-mail *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={14} className="text-gray-500" />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  placeholder="seuemail@exemplo.com"
                  className="w-full pl-9 pr-3 py-3 border border-white/10 rounded-xl focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 bg-white/5 text-white placeholder-gray-500 transition-all text-xs outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={14} className="text-gray-500" />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                  placeholder="Sua senha de acesso"
                  className="w-full pl-9 pr-3 py-3 border border-white/10 rounded-xl focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 bg-white/5 text-white placeholder-gray-500 transition-all text-xs outline-none" 
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center font-bold">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !email || !password} 
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              {loading ? 'Acessando...' : 'AcessAR PAINEL STAFF'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
