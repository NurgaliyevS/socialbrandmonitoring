import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles } from 'lucide-react';
import KeywordItem from './KeywordItem';
import { KeywordSuggestion } from './types';

interface KeywordsStepProps {
  keywords: KeywordSuggestion[];
  onRemove: (id: string) => void;
  onTypeChange: (id: string, type: 'Own Brand' | 'Competitor') => void;
  onBack: () => void;
  onComplete: () => void;
}

const KeywordsStep = ({ 
  keywords, 
  onRemove, 
  onTypeChange, 
  onBack, 
  onComplete 
}: KeywordsStepProps) => (
  <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl animate-fade-in">
    <CardHeader className="pb-6">
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-xl font-bold text-gray-900">
            Our AI suggests these keywords for you
          </CardTitle>
        </div>
      </div>
      <p className="text-gray-600 ml-11">
        You can change or edit them now, or anytime after onboarding.
      </p>
    </CardHeader>
    <CardContent className="space-y-4">
      {keywords.map((keyword) => (
        <KeywordItem
          key={keyword.id}
          keyword={keyword}
          onRemove={onRemove}
          onTypeChange={onTypeChange}
        />
      ))}
      
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