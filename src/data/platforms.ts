import { PlatformConfig, PlatformId, Destination, Task } from '../types';

export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    brandColor: '#1877F2',
    accentBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    badgeColor: 'bg-blue-600 text-white',
    iconName: 'Facebook',
    characterLimit: 63206,
    description: 'Pages, Groups, and Communities',
    composerUrl: 'https://www.facebook.com/',
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    brandColor: '#25D366',
    accentBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    badgeColor: 'bg-emerald-600 text-white',
    iconName: 'MessageSquare',
    characterLimit: 65536,
    description: 'Channels, VIP Groups & Broadcasts',
    composerUrl: 'https://web.whatsapp.com/',
  },
  x: {
    id: 'x',
    name: 'X (Twitter)',
    brandColor: '#000000',
    accentBg: 'bg-zinc-500/10 text-zinc-900 dark:text-zinc-100 border-zinc-500/20',
    badgeColor: 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black',
    iconName: 'Twitter',
    characterLimit: 280,
    description: 'Microblogging & Threads',
    composerUrl: 'https://twitter.com/intent/tweet',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    brandColor: '#0A66C2',
    accentBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    badgeColor: 'bg-sky-600 text-white',
    iconName: 'Linkedin',
    characterLimit: 3000,
    description: 'Company Pages & Professional Profiles',
    composerUrl: 'https://www.linkedin.com/feed/?shareActive=true',
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    brandColor: '#E60023',
    accentBg: 'bg-red-500/10 text-red-600 border-red-500/20',
    badgeColor: 'bg-red-600 text-white',
    iconName: 'Pin',
    characterLimit: 500,
    description: 'Visual Boards, Pins & Catalogs',
    composerUrl: 'https://www.pinterest.com/pin-builder/',
  },
  meta_business_suite: {
    id: 'meta_business_suite',
    name: 'Meta Business Suite',
    brandColor: '#0081FB',
    accentBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    badgeColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    iconName: 'Layers',
    characterLimit: 2200,
    description: 'Unified FB & IG Planner & Ads',
    composerUrl: 'https://business.facebook.com/latest/composer',
  },
};

/**
 * Builds the smart launch URL and prepares post text for copying to the clipboard.
 */
export function buildPlatformLaunchData(dest: Destination, task?: Task): {
  url: string;
  clipboardText: string;
  platformName: string;
} {
  const platform = PLATFORMS[dest.platformId];
  let clipboardText = '';

  if (task) {
    const tagsText = task.tags && task.tags.length > 0 
      ? '\n\n' + task.tags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ') 
      : '';
    clipboardText = `${task.content}${tagsText}`.trim();
  }

  let url = dest.targetUrl || platform.composerUrl;
  const encodedContent = encodeURIComponent(clipboardText);

  switch (dest.platformId) {
    case 'x':
      if (clipboardText) {
        url = `https://twitter.com/intent/tweet?text=${encodedContent}`;
      } else {
        url = 'https://twitter.com/compose/tweet';
      }
      break;

    case 'whatsapp':
      if (dest.handleOrGroup && /^\+?[0-9]{10,15}$/.test(dest.handleOrGroup.replace(/[\s-]/g, ''))) {
        const phone = dest.handleOrGroup.replace(/[^0-9]/g, '');
        url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedContent}`;
      } else if (clipboardText) {
        url = `https://web.whatsapp.com/send?text=${encodedContent}`;
      } else {
        url = dest.targetUrl || 'https://web.whatsapp.com/';
      }
      break;

    case 'linkedin':
      if (dest.category === 'profile') {
        url = clipboardText 
          ? `https://www.linkedin.com/feed/?shareActive=true&text=${encodedContent}`
          : 'https://www.linkedin.com/feed/?shareActive=true';
      } else {
        url = dest.targetUrl || 'https://www.linkedin.com/feed/';
      }
      break;

    case 'pinterest':
      url = dest.targetUrl || 'https://www.pinterest.com/pin-builder/';
      break;

    case 'meta_business_suite':
      url = dest.targetUrl || 'https://business.facebook.com/latest/composer';
      break;

    case 'facebook':
    default:
      url = dest.targetUrl || 'https://www.facebook.com/';
      break;
  }

  return {
    url,
    clipboardText,
    platformName: platform.name,
  };
}
