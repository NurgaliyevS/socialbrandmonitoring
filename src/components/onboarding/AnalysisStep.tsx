import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const AnalysisStep = () => (
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
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <Progress value={0} className="h-2" />
      </div>
    </CardContent>
  </Card>
);

export default AnalysisStep; 