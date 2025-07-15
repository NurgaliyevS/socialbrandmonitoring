'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressHeader from '@/components/onboarding/ProgressHeader';
import WebsiteInputStep from '@/components/onboarding/WebsiteInputStep';
import AnalysisStep from '@/components/onboarding/AnalysisStep';
import KeywordsStep from '@/components/onboarding/KeywordsStep';
import { KeywordSuggestion } from '@/components/onboarding/types';
import { validateWebsite } from '@/components/onboarding/utils';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from '@/components/ui/use-toast';

const OnboardingFlow = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [website, setWebsite] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [keywords, setKeywords] = useState<KeywordSuggestion[]>([]);
  const [scrapedData, setScrapedData] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { refreshBrands } = useDashboard()

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
        setScrapedData(result.data.scrapedData);
        setCompanyName(result.data.analysis.companyName);
        setIsAnalyzing(false);
        setCurrentStep(3);
      } else {
        throw new Error('No keywords generated');
      }
      setIsAnalyzing(false);
      setCurrentStep(3);

    } catch (error) {
      // Handle scraping failure: allow manual entry
      setKeywords([]);
      setScrapedData(null);
      setCompanyName('');
      setIsAnalyzing(false);
      setCurrentStep(3);
    }
  };

  const removeKeyword = (id: string) => {
    setKeywords(keywords.filter(k => k.id !== id));
  };

  const updateKeywordType = (id: string, type: 'Own Brand' | 'Competitor' | 'Industry') => {
    setKeywords(keywords.map(k => k.id === id ? { ...k, type } : k));
  };

  const updateKeywordName = (id: string, name: string) => {
    setKeywords(keywords.map(k => k.id === id ? { ...k, name } : k));
  };

  const handleOnboardingComplete = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          keywords,
          companyName,
          scrapedData,
        }),
      }).then(() => {
        refreshBrands();
        toast({
          title: "Onboarding complete",
          description: "Our system is analyzing your brand and will notify you when we find mentions.",
        })
      });
      router.push('/dashboard');
    } finally {
      setIsSaving(false);
    }
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
            isSaving={isSaving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl relative z-10">
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
