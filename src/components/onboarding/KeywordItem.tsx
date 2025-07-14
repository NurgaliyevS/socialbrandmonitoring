import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { KeywordSuggestion } from './types';

interface KeywordItemProps {
  keyword: KeywordSuggestion;
  onRemove: (id: string) => void;
  onTypeChange: (id: string, type: 'Own Brand' | 'Competitor' | 'Industry') => void;
  onNameChange: (id: string, name: string) => void;
}

const KeywordItem = ({ 
  keyword, 
  onRemove, 
  onTypeChange,
  onNameChange
}: KeywordItemProps) => {
  return(
  <div className="flex items-center gap-4 p-4 rounded-lg transition-colors">
    <div className="flex items-center gap-3 flex-1">
      <div className={`w-3 h-3 rounded-full ${keyword.type === 'Own Brand' ? 'bg-blue-500' : keyword.type === 'Competitor' ? 'bg-red-500' : 'bg-green-500'}`} />
      <Input
        value={keyword.name}
        onChange={(e) => onNameChange(keyword.id, e.target.value)}
        className="w-3/4 h-8 text-sm font-medium"
      />
    </div>
    <Select
      value={keyword.type}
      onValueChange={(value: 'Own Brand' | 'Competitor' | 'Industry') => 
        onTypeChange(keyword.id, value)
      }
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Own Brand">Own Brand</SelectItem>
        <SelectItem value="Competitor">Competitor</SelectItem>
        <SelectItem value="Industry">Industry Keyword</SelectItem>
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
)};

export default KeywordItem; 