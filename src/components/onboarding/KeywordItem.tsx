import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Edit, Trash2 } from 'lucide-react';
import { KeywordSuggestion } from './types';
import { getMentionsEstimate } from './utils';

interface KeywordItemProps {
  keyword: KeywordSuggestion;
  onRemove: (id: string) => void;
  onTypeChange: (id: string, type: 'Own Brand' | 'Competitor') => void;
}

const KeywordItem = ({ 
  keyword, 
  onRemove, 
  onTypeChange 
}: KeywordItemProps) => (
  <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
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
        onTypeChange(keyword.id, value)
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
      onClick={() => onRemove(keyword.id)}
      className="p-2 h-8 w-8 text-red-500 hover:text-red-700"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
);

export default KeywordItem; 