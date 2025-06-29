export interface KeywordSuggestion {
  id: string;
  name: string;
  type: 'Own Brand' | 'Competitor';
  mentions: 'low' | 'medium' | 'high';
  color: string;
} 