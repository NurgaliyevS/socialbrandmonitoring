import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, MessageSquare } from 'lucide-react';
import { Brand, Keyword, NotificationSettings } from './types';

interface KeywordManagementProps {
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  handleAddKeyword: (brandId: string) => void;
  handleRemoveKeyword: (brandId: string, keywordId: string) => void;
  handleUpdateKeyword: (brandId: string, keywordId: string, updates: Partial<Keyword>) => void;
}

const KeywordManagement = ({
  brands,
  setBrands,
  handleAddKeyword,
  handleRemoveKeyword,
  handleUpdateKeyword
}: KeywordManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Keywords by Brand
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {brands.map((brand) => (
          <div key={brand.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{brand.name}</h3>
              <Button
                size="sm"
                onClick={() => handleAddKeyword(brand.id)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Keyword
              </Button>
            </div>
            
            <div className="space-y-2">
              {brand.keywords.map((keyword) => (
                <div key={keyword.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${keyword.color}`} />
                  <Input
                    value={keyword.name}
                    onChange={(e) => handleUpdateKeyword(brand.id, keyword.id, { name: e.target.value })}
                    className="flex-1"
                    placeholder="Enter keyword"
                  />
                  <select
                    value={keyword.type}
                    onChange={(e) => handleUpdateKeyword(brand.id, keyword.id, { type: e.target.value as any })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="Own Brand">Own Brand</option>
                    <option value="Competitor">Competitor</option>
                    <option value="Industry">Industry</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveKeyword(brand.id, keyword.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {brand.keywords.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No keywords added yet. Click "Add Keyword" to get started.
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default KeywordManagement; 