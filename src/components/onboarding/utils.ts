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

export const TOTAL_STEPS = 3; 