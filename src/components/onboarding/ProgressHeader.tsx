import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TOTAL_STEPS } from './utils';

interface ProgressHeaderProps {
  currentStep: number;
  onBack?: () => void;
  onNext?: () => void;
  canGoNext?: boolean;
}

const ProgressHeader = ({ currentStep, onBack, onNext, canGoNext = false }: ProgressHeaderProps) => (
  <div className="mb-8 sticky">
    <div className="flex items-center justify-between mb-4">
      {currentStep > 1 && onBack && (
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
      )}
      
      <div className="flex-1 mx-4">
        <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-2 bg-white/20" />
        <p className="text-white/80 text-sm mt-2">Step {currentStep} of {TOTAL_STEPS}</p>
      </div>
      
      {currentStep !== 3 && onNext && canGoNext && (
        <button
          onClick={onNext}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowRight className="h-4 w-4 text-white" />
        </button>
      )}
    </div>
  </div>
);

export default ProgressHeader; 