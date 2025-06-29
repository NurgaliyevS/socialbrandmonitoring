import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Globe } from 'lucide-react';

interface WebsiteInputStepProps {
  website: string;
  setWebsite: (value: string) => void;
  onSubmit: () => void;
  validationError: string;
}

const WebsiteInputStep = ({ 
  website, 
  setWebsite, 
  onSubmit, 
  validationError 
}: WebsiteInputStepProps) => (
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
        onClick={onSubmit}
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
);

export default WebsiteInputStep; 