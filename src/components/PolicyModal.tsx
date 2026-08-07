import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export function PolicyModal({ isOpen, onClose, type }: PolicyModalProps) {
  if (!isOpen) return null;

  const isTerms = type === 'terms';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-md" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ scale: 0.97, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 15 }}
          className="bg-[#050505] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative z-10 overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.01]">
            <div className="flex items-center gap-3">
              {isTerms ? (
                <FileText size={20} className="text-gray-300" />
              ) : (
                <ShieldCheck size={20} className="text-gray-300" />
              )}
              <span className="text-white font-extrabold text-base tracking-tight">
                {isTerms ? 'Termos de Uso do Impulsione Link' : 'Política de Privacidade'}
              </span>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto space-y-4 text-xs md:text-sm text-gray-400 leading-relaxed custom-scrollbar max-h-[60vh]">
            {isTerms ? (
              <>
                <p className="text-gray-200 font-bold">1. Aceitação dos Termos</p>
                <p>
                  Ao acessar ou utilizar a plataforma Impulsione Link, você concorda expressamente em cumprir e estar vinculado a todos os termos e condições descritos neste documento. Se você não concordar, não deverá se registrar nem utilizar nossos serviços.
                </p>

                <p className="text-gray-200 font-bold">2. Cadastro de Conta e Segurança</p>
                <p>
                  Para publicar links, divulgar categorias ou contratar planos pagos, é obrigatório registrar-se fornecendo seu Nome, Sobrenome, E-mail e criando uma senha segura. É de sua inteira responsabilidade manter seus dados atualizados e sua senha sob confidencialidade.
                </p>

                <p className="text-gray-200 font-bold">3. Requisitos para as Divulgações</p>
                <p>
                  Ao compartilhar canais ou grupos do WhatsApp, Telegram e sites em geral, você garante que possui os direitos das mídias enviadas, e que o conteúdo não infringe leis nacionais, direitos de imagem ou represente spam/links fraudulentos de phishing. O sistema possui IA inteligente que bloqueará tentativas de spam e links perigosos.
                </p>

                <p className="text-gray-200 font-bold">4. Política de Recorrência e Reembolso</p>
                <p>
                  Nossos planos de posicionamento são renovados manualmente pelo cliente ou gerenciados conforme o tempo de contratação escolhido (24 Horas, 7 Dias ou 30 Dias). Transações validadas de forma manual ou automática não são passíveis de cancelamento ou estorno após ativação da entrega dos cliques correspondentes ao plano contratado.
                </p>

                <p className="text-gray-200 font-bold">5. Limitação de Responsabilidade</p>
                <p>
                  O Impulsione Link é um agregador público de links informados por terceiros e não fornece curadoria de chats privados nem se responsabiliza por acordos, transações de compras ou amizades feitas em chats de terceiros externos.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-200 font-bold">1. Coleta de Informações</p>
                <p>
                  Coletamos as informações necessárias para criar e manter sua conta segura ao ingressar na nossa comunidade: Nome, Sobrenome, Endereço de E-mail para Autenticação segura, IPs no momento do login e registros de cliques efetuados nas listagens com finalidade puramente estatística.
                </p>

                <p className="text-gray-200 font-bold">2. Compartilhamento e Uso de Dados</p>
                <p>
                  Não vendemos, divulgamos ou repassamos seus dados privados a parceiros externos comerciais secundários. Os seus dados são utilizados apenas para o controle interno dos seus anúncios ativos, renovação de períodos contratados e verificação inteligente anti-fraude de links duplicados de anúncios.
                </p>

                <p className="text-gray-200 font-bold">3. Cookies e Rastreamento</p>
                <p>
                  Utilizamos cookies e sessões de armazenamento do navegador (localStorage) para acelerar a resposta do site e manter sua sessão conectada com alto desempenho de forma automática e privativa.
                </p>

                <p className="text-gray-200 font-bold">4. Direitos e Controle de Conta</p>
                <p>
                  A qualquer momento, o usuário pode solicitar a remoção permanente de sua conta, cancelamento de anúncios pendentes ou exclusão total de dados do banco de dados do Firestore contactando o suporte.
                </p>

                <p className="text-gray-200 font-bold">5. Segurança Cibernética</p>
                <p>
                  Implementamos as melhores práticas técnicas de firewalls e regras granulares de banco de dados do Firebase Firestore para proteger todos os emails e senhas de qualquer desvio.
                </p>
              </>
            )}
          </div>
          
          <div className="p-4 bg-white/[0.01] border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="py-2 px-5 bg-white text-black hover:bg-gray-150 font-extrabold rounded-xl text-xs uppercase tracking-wider"
            >
              Entendido e Aceito
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
