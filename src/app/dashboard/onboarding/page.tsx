'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Sparkles, Globe, BarChart3, Edit, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

interface KeywordSuggestion {
  id: string;
  name: string;
  type: 'Own Brand' | 'Competitor';
  mentions: 'low' | 'medium' | 'high';
  color: string;
}

const OnboardingFlow = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [website, setWebsite] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [keywords, setKeywords] = useState<KeywordSuggestion[]>([
    { id: '1', name: 'mvpagency', type: 'Own Brand', mentions: 'low', color: 'bg-green-500' },
    { id: '2', name: 'webflow', type: 'Competitor', mentions: 'medium', color: 'bg-blue-500' },
    { id: '3', name: 'bubble', type: 'Competitor', mentions: 'medium', color: 'bg-emerald-500' },
    { id: '4', name: 'adalo', type: 'Competitor', mentions: 'medium', color: 'bg-yellow-500' },
  ]);

  const handleWebsiteSubmit = () => {
    setValidationError('');
    if (!website.trim()) {
      setValidationError('Please enter a website URL, format: http:// or https://');
      return;
    }
    
    // Validate URL format
    try {
      const url = new URL(website);
      if (!['http:', 'https:'].includes(url.protocol)) {
        setValidationError('Please enter a valid URL, format: http:// or https://');
        return;
      }
      setCurrentStep(2);
      startAnalysis();
    } catch (error) {
      setValidationError('Please enter a valid URL, format: http:// or https://');
      return;
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Call the actual backend API
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

      // API completed successfully, move to next step immediately
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

  const getStepProgress = () => {
    return (currentStep / 3) * 100;
  };

  const getMentionsEstimate = (mentions: string) => {
    switch (mentions) {
      case 'low': return 'low mentions estimate';
      case 'medium': return 'medium mentions estimate';
      case 'high': return 'high mentions estimate';
      default: return 'mentions estimate';
    }
  };

  const handleOnboardingComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={getStepProgress()} className="h-2 bg-white/20" />
          <p className="text-white/80 text-sm mt-2">Step {currentStep} of 3</p>
        </div>

        {/* Step 1: Website Input */}
        {currentStep === 1 && (
          <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl animate-fade-in">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Let's set up your workspace
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Enter your company website and we'll automatically find all the information we need.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                  Company website *
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="h-12 text-base"
                  autoComplete="url"
                />
                <p className="text-sm text-gray-500">
                  Enter your company website (must start with http:// or https://). We'll analyze it to automatically set up your profile.
                </p>
              </div>
              <Button 
                onClick={handleWebsiteSubmit}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate company profile
              </Button>
              {validationError && (
                <p className="text-red-500 text-sm mt-2">{validationError}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Analysis */}
        {currentStep === 2 && (
          <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl animate-fade-in">
            <CardContent className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-8 h-8 bg-purple-600 rounded-full animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Analyzing your company
              </h2>
              <p className="text-gray-600 mb-8">
                This may take up to 20 seconds.
              </p>
              
              <div className="space-y-6 max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Gathering company data</span>
                  <span className="text-sm text-green-600 font-medium">Complete</span>
                </div>
                <Progress value={100} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Identifying product use cases</span>
                  {analysisProgress < 100 && (
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Keyword Suggestions */}
        {currentStep === 3 && (
          <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl animate-fade-in">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
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
                <div key={keyword.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <Edit className="h-4 w-4 text-gray-400" />
                    <div className={`w-3 h-3 rounded-full ${keyword.color}`} />
                    <span className="font-medium text-gray-900">{keyword.name}</span>
                    <BarChart3 className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="text-xs text-gray-500">
                    {getMentionsEstimate(keyword.mentions)}
                  </div>
                  <Select
                    value={keyword.type}
                    onValueChange={(value: 'Own Brand' | 'Competitor') => 
                      updateKeywordType(keyword.id, value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Own Brand">Own Brand</SelectItem>
                      <SelectItem value="Competitor">Competitor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeKeyword(keyword.id)}
                    className="p-2 h-8 w-8 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button 
                onClick={handleOnboardingComplete}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium mt-8"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
