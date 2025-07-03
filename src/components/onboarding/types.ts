export interface KeywordSuggestion {
  id: string;
  name: string;
  type: 'Own Brand' | 'Competitor' | 'Industry';
  mentions: 'low' | 'medium' | 'high';
  color: string;
} 