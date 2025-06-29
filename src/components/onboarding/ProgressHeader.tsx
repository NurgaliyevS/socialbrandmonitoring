import React from 'react';
import { Progress } from '@/components/ui/progress';
import { TOTAL_STEPS } from './utils';

interface ProgressHeaderProps {
  currentStep: number;
}

const ProgressHeader = ({ currentStep }: ProgressHeaderProps) => (
  <div className="mb-8">
    <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-2 bg-white/20" />
    <p className="text-white/80 text-sm mt-2">Step {currentStep} of {TOTAL_STEPS}</p>
  </div>
);

export default ProgressHeader; 