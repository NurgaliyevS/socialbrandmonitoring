import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles } from 'lucide-react';
import KeywordItem from './KeywordItem';
import { KeywordSuggestion } from './types';

interface KeywordsStepProps {
  keywords?: KeywordSuggestion[];
  onRemove: (id: string) => void;
  onTypeChange: (id: string, type: 'Own Brand' | 'Competitor' | 'Industry') => void;
  onNameChange: (id: string, name: string) => void;
  onComplete: () => void;
}

const KeywordsStep = ({ 
  keywords = [], 
  onRemove, 
  onTypeChange,
  onNameChange,
  onComplete 
}: KeywordsStepProps) => (
  <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl animate-fade-in">
    <CardHeader className="pb-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <CardTitle className="text-xl font-bold text-gray-900">
          Our AI suggests these keywords for you
        </CardTitle>
      </div>
      <p className="text-gray-600">
        You can change or edit them now, or anytime after onboarding.
      </p>
    </CardHeader>
    <CardContent>
      {keywords.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No keywords available. Please go back and try again.</p>
        </div>
      ) : (
        // <div className="border rounded-xl overflow-hidden">
        <div className='border rounded-lg overflow-hidden'>
          {keywords.map((keyword, idx) => (
            <div key={keyword.id} className={idx !== keywords.length - 1 ? 'border-b' : ''}>
              <KeywordItem
                keyword={keyword}
                onRemove={onRemove}
                onTypeChange={onTypeChange}
                onNameChange={onNameChange}
              />
            </div>
          ))}
        </div>
      )}
      <Button 
        onClick={onComplete}
        className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium mt-8"
      >
        Continue
      </Button>
    </CardContent>
  </Card>
);

export default KeywordsStep; 