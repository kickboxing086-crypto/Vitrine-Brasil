import React from 'react';
import { FaWhatsapp, FaTelegram, FaTiktok, FaInstagram, FaFacebook, FaDiscord, FaPinterest, FaYoutube, FaXTwitter, FaLinkedin, FaTwitch, FaReddit } from 'react-icons/fa6';
import { SiKuaishou } from 'react-icons/si';
import { Globe, Link } from 'lucide-react';
import { PlatformType } from '../data';

interface PlatformIconProps {
  platform: PlatformType;
  className?: string;
  size?: number;
}

export function PlatformIcon({ platform, className = '', size = 20 }: PlatformIconProps) {
  switch (platform) {
    case 'whatsapp':
      return <FaWhatsapp size={size} className={className} color="#25D366" />;
    case 'telegram':
      return <FaTelegram size={size} className={className} color="#229ED9" />;
    case 'tiktok':
      return <FaTiktok size={size} className={className} />;
    case 'kwai':
      return <SiKuaishou size={size} className={className} color="#FF5000" />;
    case 'instagram':
      return <FaInstagram size={size} className={className} color="#E4405F" />;
    case 'facebook':
      return <FaFacebook size={size} className={className} color="#1877F2" />;
    case 'youtube':
      return <FaYoutube size={size} className={className} color="#FF0000" />;
    case 'x':
      return <FaXTwitter size={size} className={className} color="#000000" />;
    case 'linkedin':
      return <FaLinkedin size={size} className={className} color="#0A66C2" />;
    case 'discord':
      return <FaDiscord size={size} className={className} color="#5865F2" />;
    case 'twitch':
      return <FaTwitch size={size} className={className} color="#9146FF" />;
    case 'reddit':
      return <FaReddit size={size} className={className} color="#FF4500" />;
    case 'pinterest':
      return <FaPinterest size={size} className={className} color="#E60023" />;
    case 'site':
      return <Globe size={size} className={className} />;
    case 'other':
    default:
      return <Link size={size} className={className} />;
  }
}
