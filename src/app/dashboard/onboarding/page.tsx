'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressHeader from '@/components/onboarding/ProgressHeader';
import WebsiteInputStep from '@/components/onboarding/WebsiteInputStep';
import AnalysisStep from '@/components/onboarding/AnalysisStep';
import KeywordsStep from '@/components/onboarding/KeywordsStep';
import { KeywordSuggestion } from '@/components/onboarding/types';
import { validateWebsite } from '@/components/onboarding/utils';

const OnboardingFlow = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [website, setWebsite] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [keywords, setKeywords] = useState<KeywordSuggestion[]>([]);

  const handleWebsiteSubmit = () => {
    setValidationError('');
    const error = validateWebsite(website);
    
    if (error) {
      setValidationError(error);
      return;
    }
    
    setCurrentStep(2);
    startAnalysis();
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ website }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      if (result.data && result.data.analysis && result.data.analysis.keywords) {
        setKeywords(result.data.analysis.keywords);
        setIsAnalyzing(false);
        setCurrentStep(3);
      } else {
        throw new Error('No keywords generated');
      }
      setIsAnalyzing(false);
      setCurrentStep(3);

    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
      setCurrentStep(3);
    }
  };

  const removeKeyword = (id: string) => {
    setKeywords(keywords.filter(k => k.id !== id));
  };

  const updateKeywordType = (id: string, type: 'Own Brand' | 'Competitor') => {
    setKeywords(keywords.map(k => k.id === id ? { ...k, type } : k));
  };

  const updateKeywordName = (id: string, name: string) => {
    setKeywords(keywords.map(k => k.id === id ? { ...k, name } : k));
  };

  const handleOnboardingComplete = () => {
    router.push('/dashboard');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (keywords.length > 0 && currentStep !== 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WebsiteInputStep
            website={website}
            setWebsite={setWebsite}
            onSubmit={handleWebsiteSubmit}
            validationError={validationError}
          />
        );
      case 2:
        return <AnalysisStep />;
      case 3:
        return (
          <KeywordsStep
            keywords={keywords}
            onRemove={removeKeyword}
            onTypeChange={updateKeywordType}
            onNameChange={updateKeywordName}
            onComplete={handleOnboardingComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <ProgressHeader 
          currentStep={currentStep}
          onBack={handleBack}
          onNext={handleNext}
          canGoNext={keywords.length > 0}
        />
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default OnboardingFlow;
