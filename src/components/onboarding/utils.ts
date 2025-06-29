export const getMentionsEstimate = (mentions: string): string => {
  switch (mentions) {
    case 'low': return 'low mentions estimate';
    case 'medium': return 'medium mentions estimate';
    case 'high': return 'high mentions estimate';
    default: return 'mentions estimate';
  }
};

export const validateWebsite = (website: string): string | null => {
  if (!website.trim()) {
    return 'Please enter a website URL, format: http:// or https://';
  }
  
  try {
    const url = new URL(website);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'Please enter a valid URL, format: http:// or https://';
    }
    return null;
  } catch (error) {
    return 'Please enter a valid URL, format: http:// or https://';
  }
};

export const INITIAL_KEYWORDS = [
  { id: '1', name: 'mvpagency', type: 'Own Brand' as const, mentions: 'low' as const, color: 'bg-green-500' },
  { id: '2', name: 'webflow', type: 'Competitor' as const, mentions: 'medium' as const, color: 'bg-blue-500' },
  { id: '3', name: 'bubble', type: 'Competitor' as const, mentions: 'medium' as const, color: 'bg-emerald-500' },
  { id: '4', name: 'adalo', type: 'Competitor' as const, mentions: 'medium' as const, color: 'bg-yellow-500' },
];

export const TOTAL_STEPS = 3; 