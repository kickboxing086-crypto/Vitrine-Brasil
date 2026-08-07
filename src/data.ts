export type Category = 
  | 'Networking'
  | 'Conexões'
  | 'Relacionamentos'
  | 'Negócios'
  | 'Vendas'
  | 'Mercado Financeiro'
  | 'Marketing'
  | 'Design'
  | 'Games'
  | 'Entretenimento'
  | 'Notícias'
  | 'Informação'
  | 'Filmes'
  | 'Séries'
  | 'Educação'
  | 'Cursos'
  | 'Idiomas'
  | 'Tecnologia'
  | 'Inovação'
  | 'Saúde'
  | 'Esportes'
  | 'Moda'
  | 'Beleza'
  | 'Música'
  | 'Arte'
  | 'Apostas'
  | 'iGaming'
  | 'Vagas'
  | 'Empregos'
  | 'Carros'
  | 'Motos'
  | 'Imóveis'
  | 'Aluguel'
  | 'Viagens'
  | 'Turismo'
  | 'Humor'
  | 'Memes'
  | 'Religião'
  | 'Espiritualidade'
  | 'Geral';

export type PlatformType = 'whatsapp' | 'telegram' | 'discord' | 'facebook' | 'instagram' | 'kwai' | 'tiktok' | 'pinterest' | 'youtube' | 'x' | 'linkedin' | 'twitch' | 'reddit' | 'site' | 'other';
export type PlanType = 'bronze' | 'prata' | 'ouro' | 'diamante';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: Category;
  platform: PlatformType;
  link: string;
  ownerId: string;
  plan: PlanType;
  memberCount?: number;
  createdAt: any;
  updatedAt: any;
  expiresAt?: Date | any;
  clicks?: number;
  status?: 'pending' | 'approved';
  phoneNumber?: string;
  userEmail?: string;
  userName?: string;
}

export const CATEGORIES: { name: Category; icon: string; count: number }[] = [
  { name: 'Networking', icon: 'Users', count: 0 },
  { name: 'Conexões', icon: 'Link', count: 0 },
  { name: 'Relacionamentos', icon: 'Heart', count: 0 },
  { name: 'Negócios', icon: 'Briefcase', count: 0 },
  { name: 'Vendas', icon: 'ShoppingBag', count: 0 },
  { name: 'Mercado Financeiro', icon: 'TrendingUp', count: 0 },
  { name: 'Marketing', icon: 'Megaphone', count: 0 },
  { name: 'Design', icon: 'PenTool', count: 0 },
  { name: 'Games', icon: 'Gamepad2', count: 0 },
  { name: 'Entretenimento', icon: 'Tv', count: 0 },
  { name: 'Notícias', icon: 'Globe', count: 0 },
  { name: 'Informação', icon: 'Info', count: 0 },
  { name: 'Filmes', icon: 'Film', count: 0 },
  { name: 'Séries', icon: 'MonitorPlay', count: 0 },
  { name: 'Educação', icon: 'GraduationCap', count: 0 },
  { name: 'Cursos', icon: 'BookOpen', count: 0 },
  { name: 'Idiomas', icon: 'Languages', count: 0 },
  { name: 'Tecnologia', icon: 'Monitor', count: 0 },
  { name: 'Inovação', icon: 'Lightbulb', count: 0 },
  { name: 'Saúde', icon: 'Activity', count: 0 },
  { name: 'Esportes', icon: 'Dribbble', count: 0 },
  { name: 'Moda', icon: 'Shirt', count: 0 },
  { name: 'Beleza', icon: 'Heart', count: 0 },
  { name: 'Música', icon: 'Music', count: 0 },
  { name: 'Arte', icon: 'Palette', count: 0 },
  { name: 'Apostas', icon: 'Dice1', count: 0 },
  { name: 'iGaming', icon: 'Gamepad', count: 0 },
  { name: 'Vagas', icon: 'Briefcase', count: 0 },
  { name: 'Empregos', icon: 'Building2', count: 0 },
  { name: 'Carros', icon: 'Car', count: 0 },
  { name: 'Motos', icon: 'Bike', count: 0 },
  { name: 'Imóveis', icon: 'Home', count: 0 },
  { name: 'Aluguel', icon: 'Key', count: 0 },
  { name: 'Viagens', icon: 'Plane', count: 0 },
  { name: 'Turismo', icon: 'Map', count: 0 },
  { name: 'Humor', icon: 'Smile', count: 0 },
  { name: 'Memes', icon: 'SmilePlus', count: 0 },
  { name: 'Religião', icon: 'Book', count: 0 },
  { name: 'Espiritualidade', icon: 'Feather', count: 0 },
  { name: 'Geral', icon: 'Package', count: 0 },
];

export const PLATFORMS: { id: PlatformType; name: string; color: string; logoUrl: string }[] = [
  { id: 'whatsapp', name: 'WhatsApp', color: 'bg-emerald-500', logoUrl: 'https://api.iconify.design/logos:whatsapp-icon.svg' },
  { id: 'telegram', name: 'Telegram', color: 'bg-sky-500', logoUrl: 'https://api.iconify.design/logos:telegram.svg' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black', logoUrl: 'https://api.iconify.design/logos:tiktok-icon.svg' },
  { id: 'kwai', name: 'Kwai', color: 'bg-orange-500', logoUrl: 'https://api.iconify.design/simple-icons:kuaishou.svg?color=%23FF5000' },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-600', logoUrl: 'https://api.iconify.design/skill-icons:instagram.svg' },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-600', logoUrl: 'https://api.iconify.design/logos:youtube-icon.svg' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', logoUrl: 'https://api.iconify.design/logos:facebook.svg' },
  { id: 'x', name: 'X / Twitter', color: 'bg-black', logoUrl: 'https://api.iconify.design/ri:twitter-x-fill.svg?color=white' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700', logoUrl: 'https://api.iconify.design/logos:linkedin-icon.svg' },
  { id: 'discord', name: 'Discord', color: 'bg-indigo-500', logoUrl: 'https://api.iconify.design/logos:discord-icon.svg' },
  { id: 'twitch', name: 'Twitch', color: 'bg-purple-600', logoUrl: 'https://api.iconify.design/logos:twitch.svg' },
  { id: 'reddit', name: 'Reddit', color: 'bg-orange-600', logoUrl: 'https://api.iconify.design/logos:reddit-icon.svg' },
  { id: 'pinterest', name: 'Pinterest', color: 'bg-red-600', logoUrl: 'https://api.iconify.design/logos:pinterest.svg' },
  { id: 'site', name: 'Site', color: 'bg-slate-600', logoUrl: 'https://api.iconify.design/mdi:web.svg?color=%2364748b' },
  { id: 'other', name: 'Outro', color: 'bg-gray-500', logoUrl: 'https://api.iconify.design/mdi:link-variant.svg?color=%2394a3b8' },
];

export const MOCK_LISTINGS: Listing[] = [];
